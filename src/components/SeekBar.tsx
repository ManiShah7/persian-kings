import { useCallback, useRef } from "react";
import { useAtomValue } from "jotai";
import { ppsAtom, scrollXAtom, viewportWidthAtom } from "../state/atoms";
import { ALL_YEARS, MAX_YEAR, MIN_YEAR } from "../utils/constants";
import { xToYear } from "../utils/coords";
import { clamp } from "../utils/clamp";
import { color, font, radius, text, z } from "../theme/tokens";
import { formatYear } from "../utils/format";
import { eras } from "../data/eras";
import { useViewportApi } from "../state/viewportContext";

const BAR_HEIGHT = 46;
const TRACK_HEIGHT = 22;
const MIN_THUMB_PCT = 1.5; // keep the window grabbable when fully zoomed in

// Map a year to a 0..1 fraction of the whole timeline span.
const yearFrac = (year: number): number =>
  clamp((year - MIN_YEAR) / ALL_YEARS, 0, 1);

/**
 * An overview scrubber docked at the bottom: the full 728 BC → 1979 span with
 * era shading, a draggable window showing the on-screen range, and
 * click-to-jump. Complements (does not replace) free scroll/pan/zoom.
 */
const SeekBar = () => {
  const pps = useAtomValue(ppsAtom);
  const scrollX = useAtomValue(scrollXAtom);
  const viewportWidth = useAtomValue(viewportWidthAtom);
  const viewport = useViewportApi();
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Actual (unpadded) on-screen range: the viewport edges mapped back to years.
  // No gutter → the viewport spans SVG-x [scrollX, scrollX + viewportWidth].
  const leftYear = xToYear(scrollX, pps);
  const rightYear = xToYear(scrollX + viewportWidth, pps);
  const centerYear = xToYear(scrollX + viewportWidth / 2, pps);

  const leftPct = yearFrac(leftYear) * 100;
  const rightPct = yearFrac(rightYear) * 100;
  const thumbPct = Math.max(rightPct - leftPct, MIN_THUMB_PCT);

  // Convert a pointer's clientX to a year within the track.
  const yearAtClientX = useCallback((clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return centerYear;
    const frac = clamp((clientX - rect.left) / rect.width, 0, 1);
    return MIN_YEAR + frac * ALL_YEARS;
  }, [centerYear]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || !viewport) return;
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      const yearsPerPx = ALL_YEARS / rect.width;
      const onThumb = (e.target as HTMLElement).dataset.seekThumb === "true";

      // Grabbing the window drags it relatively; clicking the track jumps the
      // center under the pointer first, then drags from there.
      let startCenter = centerYear;
      if (!onThumb) {
        startCenter = yearAtClientX(e.clientX);
        viewport.panToYear(clamp(startCenter, MIN_YEAR, MAX_YEAR));
      }
      const startX = e.clientX;

      const move = (ev: PointerEvent) => {
        const next = clamp(startCenter + (ev.clientX - startX) * yearsPerPx, MIN_YEAR, MAX_YEAR);
        viewport.panToYear(next);
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [viewport, centerYear, yearAtClientX],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!viewport) return;
      const step = ALL_YEARS * (e.shiftKey ? 0.1 : 0.02);
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        viewport.panToYear(clamp(centerYear - step, MIN_YEAR, MAX_YEAR));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        viewport.panToYear(clamp(centerYear + step, MIN_YEAR, MAX_YEAR));
      }
    },
    [viewport, centerYear],
  );

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: BAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        boxSizing: "border-box",
        background: "rgba(10,10,12,0.62)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderTop: `1px solid ${color.line}`,
        zIndex: z.seek,
      }}
    >
      <span style={endLabelStyle}>{formatYear(MIN_YEAR)}</span>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Timeline position"
        aria-valuemin={MIN_YEAR}
        aria-valuemax={MAX_YEAR}
        aria-valuenow={Math.round(centerYear)}
        aria-valuetext={formatYear(Math.round(centerYear))}
        style={{
          position: "relative",
          flex: 1,
          height: TRACK_HEIGHT,
          borderRadius: radius.sm,
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${color.line}`,
          overflow: "hidden",
          cursor: "pointer",
          touchAction: "none",
        }}
      >
        {/* Era chapters — subtle accent bands for spatial context. */}
        {eras.map((era) => {
          const left = yearFrac(era.startYear) * 100;
          const w = (yearFrac(era.endYear) - yearFrac(era.startYear)) * 100;
          return (
            <div
              key={era.id}
              title={era.name}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${left}%`,
                width: `${w}%`,
                background: era.accent,
                opacity: 0.22,
                borderRight: `1px solid rgba(0,0,0,0.35)`,
              }}
            />
          );
        })}

        {/* The on-screen window. */}
        <div
          data-seek-thumb="true"
          style={{
            position: "absolute",
            top: -1,
            bottom: -1,
            left: `${clamp(leftPct, 0, 100 - thumbPct)}%`,
            width: `${thumbPct}%`,
            minWidth: 8,
            background: "rgba(232,228,220,0.16)",
            border: `1.5px solid ${color.ink}`,
            borderRadius: radius.sm,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            cursor: "grab",
          }}
        />
      </div>

      <span style={endLabelStyle}>{formatYear(MAX_YEAR)}</span>
    </div>
  );
};

const endLabelStyle: React.CSSProperties = {
  fontFamily: font.ui,
  fontSize: text.xs,
  fontVariantNumeric: "tabular-nums",
  color: color.inkDim,
  whiteSpace: "nowrap",
  userSelect: "none",
};

export default SeekBar;
