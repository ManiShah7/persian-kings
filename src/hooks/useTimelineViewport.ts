import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { ppsAtom, scrollXAtom, viewportWidthAtom } from "../state/atoms";
import { MAX_PPS, MIN_PPS, timelineWidth } from "../utils/constants";
import { xToYear, yearToX } from "../utils/coords";
import { clamp } from "../utils/clamp";

const DRAG_THRESHOLD = 4; // px before a pointer press counts as a drag
const KEYBOARD_ZOOM_FACTOR = 1.2;

/**
 * Owns every wiring concern of the native scroll viewport: scroll→atom,
 * resize→atom, wheel pan/zoom, drag-to-pan, and keyboard nav. Returns a ref
 * for the scroll container. The container's first child must be the
 * scroll-content element (its width is set imperatively during zoom so the
 * new scrollLeft isn't clamped against a stale width).
 */
export function useTimelineViewport() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pps, setPps] = useAtom(ppsAtom);
  const setScrollX = useSetAtom(scrollXAtom);
  const setViewportWidth = useSetAtom(viewportWidthAtom);

  // Mirror pps so event handlers read the latest value without re-binding.
  const ppsRef = useRef(pps);
  useEffect(() => {
    ppsRef.current = pps;
  }, [pps]);

  const rafScroll = useRef<number | null>(null);
  const latestScroll = useRef(0);

  const flushScroll = useCallback(
    (value: number) => {
      latestScroll.current = value;
      if (rafScroll.current == null) {
        rafScroll.current = requestAnimationFrame(() => {
          rafScroll.current = null;
          setScrollX(latestScroll.current);
        });
      }
    },
    [setScrollX],
  );

  // Zoom to a target level (clamped) and center the viewport on `year`.
  const zoomToYear = useCallback(
    (year: number, targetPps: number) => {
      const el = containerRef.current;
      if (!el) return;
      const content = el.firstElementChild as HTMLElement | null;
      const newPps = clamp(targetPps, MIN_PPS, MAX_PPS);
      if (content) content.style.width = `${timelineWidth(newPps)}px`;
      el.scrollLeft = yearToX(year, newPps) - el.clientWidth / 2;
      ppsRef.current = newPps;
      setPps(newPps);
      setScrollX(el.scrollLeft);
    },
    [setPps, setScrollX],
  );

  // Zoom around a horizontal anchor point (px offset from the viewport left),
  // keeping the year under that point stationary.
  const applyZoom = useCallback(
    (factor: number, pointerOffsetX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const content = el.firstElementChild as HTMLElement | null;
      const oldPps = ppsRef.current;
      const newPps = clamp(oldPps * factor, MIN_PPS, MAX_PPS);
      if (newPps === oldPps) return;

      const anchorYear = xToYear(el.scrollLeft + pointerOffsetX, oldPps);
      // Widen/narrow the content *before* assigning scrollLeft, else the
      // browser clamps the new scrollLeft against the old (stale) width.
      if (content) content.style.width = `${timelineWidth(newPps)}px`;
      el.scrollLeft = yearToX(anchorYear, newPps) - pointerOffsetX;

      ppsRef.current = newPps;
      setPps(newPps);
      setScrollX(el.scrollLeft);
    },
    [setPps, setScrollX],
  );

  // Scroll → atom (rAF-throttled), and initialize from the container.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => flushScroll(el.scrollLeft);
    el.addEventListener("scroll", onScroll, { passive: true });
    setScrollX(el.scrollLeft);
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafScroll.current != null) cancelAnimationFrame(rafScroll.current);
      rafScroll.current = null;
    };
  }, [flushScroll, setScrollX]);

  // Resize → viewport width.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setViewportWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setViewportWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [setViewportWidth]);

  // Wheel: ctrl/meta → zoom at cursor; vertical wheel → horizontal pan.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const offsetX = e.clientX - el.getBoundingClientRect().left;
        applyZoom(Math.exp(-e.deltaY * 0.002), offsetX);
      } else if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // The page has no vertical scroll; translate wheel-Y into time pan.
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
      // Horizontal deltas (trackpads) fall through to native scrolling.
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyZoom]);

  // Drag-to-pan.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let active = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let suppressClick = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      active = true;
      moved = false;
      suppressClick = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!moved) {
        moved = true;
        el.setPointerCapture(e.pointerId);
        el.setAttribute("data-dragging", "true");
      }
      el.scrollLeft = startScroll - dx;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!active) return;
      active = false;
      if (moved) {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        el.removeAttribute("data-dragging");
        suppressClick = true; // swallow the click this drag would synthesize
      }
    };
    // Capture-phase: stop a post-drag click from opening the detail panel.
    const onClickCapture = (e: MouseEvent) => {
      if (suppressClick) {
        suppressClick = false;
        e.stopPropagation();
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("click", onClickCapture, { capture: true });
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("click", onClickCapture, { capture: true });
    };
  }, []);

  // Keyboard nav (container has tabIndex={0}).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const w = el.clientWidth;
      const panStep = (e.shiftKey ? 0.5 : 0.1) * w;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          el.scrollLeft -= panStep;
          break;
        case "ArrowRight":
          e.preventDefault();
          el.scrollLeft += panStep;
          break;
        case "Home":
          e.preventDefault();
          el.scrollLeft = 0;
          break;
        case "End":
          e.preventDefault();
          el.scrollLeft = el.scrollWidth;
          break;
        case "+":
        case "=":
          e.preventDefault();
          applyZoom(KEYBOARD_ZOOM_FACTOR, w / 2);
          break;
        case "-":
        case "_":
          e.preventDefault();
          applyZoom(1 / KEYBOARD_ZOOM_FACTOR, w / 2);
          break;
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [applyZoom]);

  return { containerRef, zoomToYear };
}
