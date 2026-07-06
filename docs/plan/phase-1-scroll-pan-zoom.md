# Phase 1 — Scroll / Pan / Zoom foundation

## Goal

Replace the slider + fixed-playhead model with **native horizontal scrolling**
and **cursor-anchored zoom**. Introduce a single source of truth for the
viewport (scroll position, viewport width, zoom level) as Jotai atoms, and
virtualize rendering so only visible elements mount. Everything later
(kings LOD, era backgrounds, URL state) reads from these atoms.

## Architecture

Native scroll container, not a custom camera:

```
<div class="scroll-container">   overflow-x: auto; overflow-y: hidden; height: 100vh
  <div class="scroll-content">   width: timelineWidth(pps) px; position: relative
    <svg .../>                   width/height 100%; absolutely fills scroll-content
  </div>
</div>
```

Native scroll gives momentum, trackpad gestures, and a scrollbar for free.
The SVG is as wide as the whole timeline; **virtualization of its children**
(not translating a `<g>`) keeps it fast.

## State — rewrite `src/state/atoms.ts`

Keep `selectionAtom` exactly as is. Replace `activeYearAtom` with:

```ts
export const ppsAtom = atom<number>(3);          // pixels per year (zoom)
export const scrollXAtom = atom<number>(0);      // scroll-container scrollLeft, px
export const viewportWidthAtom = atom<number>(
  typeof window === "undefined" ? 1200 : window.innerWidth,
);

// Derived — the year range currently on screen (pad by ~1 viewport on each
// side so elements mount slightly before they scroll into view):
export const visibleRangeAtom = atom((get) => {
  const pps = get(ppsAtom);
  const x = get(scrollXAtom);
  const w = get(viewportWidthAtom);
  return {
    startYear: xToYear(x - w, pps),
    endYear: xToYear(x + 2 * w, pps),
  };
});

// Derived — the year at the horizontal center of the screen. This replaces
// activeYearAtom and later drives the era background + header HUD.
export const centerYearAtom = atom((get) =>
  Math.round(xToYear(get(scrollXAtom) + get(viewportWidthAtom) / 2, get(ppsAtom))),
);
```

Search for all `activeYearAtom` usages and migrate them to `centerYearAtom`
(read-only) or delete them with the playhead code.

## Constants — `src/utils/constants.ts`

- Delete `APP_WIDTH` and `PIXELS_PER_YEAR` as fixed layout inputs. Add:

```ts
export const DEFAULT_PPS = 3;
export const MIN_PPS = 0.4;   // ~fit-everything on a laptop screen
export const MAX_PPS = 24;    // one year ≈ 24px, comfortable king-label zoom
export const timelineWidth = (pps: number) => ALL_YEARS * pps;
```

(`timelineWidth` may live in `coords.ts` instead — either is fine, just one
place.)

## New hook — `src/hooks/useTimelineViewport.ts`

One hook owns all viewport wiring. It returns a `ref` for the scroll
container and sets the atoms. Responsibilities:

1. **Scroll → atom.** `onScroll`, write `scrollLeft` into `scrollXAtom`,
   throttled with `requestAnimationFrame` (store latest value, flush once per
   frame) so atom subscribers re-render at most once per frame.
2. **Resize.** `ResizeObserver` on the container → `viewportWidthAtom`.
   This removes every direct `window.innerWidth` read in components.
3. **Wheel** (non-passive listener via `addEventListener`, because it calls
   `preventDefault`):
   - `ctrlKey || metaKey` (pinch gestures arrive as ctrl+wheel): **zoom**.
     `newPps = clamp(pps * exp(-deltaY * 0.002), MIN_PPS, MAX_PPS)`.
     Anchor at the cursor: keep the year under the pointer stationary —
     ```ts
     const anchorYear = xToYear(scrollLeft + pointerOffsetX, oldPps);
     container.scrollLeft = yearToX(anchorYear, newPps) - pointerOffsetX;
     ```
     Set `ppsAtom` and scrollLeft in the same frame. Note: changing `pps`
     changes `scroll-content` width; set the width via React state/atom and
     apply scrollLeft in a `useLayoutEffect` (or set `el.style.width`
     imperatively before assigning scrollLeft) so the new scrollLeft isn't
     clamped against the old width.
   - Plain wheel with `deltaY` dominant: translate vertical wheel to
     horizontal pan (`scrollLeft += deltaY`) — the page has no vertical
     scroll, so a mouse wheel should move through time. Horizontal deltas
     (trackpads) work natively; don't intercept them.
4. **Drag-to-pan.** Pointer events on the container: on `pointerdown` record
   start; on `pointermove` past a 4px threshold, set `pointer-capture`,
   update `scrollLeft` by the delta, and set a `data-dragging` flag; suppress
   the next `click` if a drag happened (so dragging across a dynasty bar
   doesn't open the detail panel). Cursor: `grab`/`grabbing`.
5. **Keyboard** (listener on the container, which gets `tabIndex={0}`):
   `ArrowLeft/ArrowRight` pan by 10% of viewport (`shift` → 50%), `+`/`-`
   zoom around the viewport center, `Home`/`End` jump to start/end.

## Component changes

### `App.tsx`
Render the scroll container (from the hook) wrapping `Timeline`. `YearAxis`
becomes a **sticky strip at the top inside the scroll content** (or a fixed
overlay reading the atoms — pick one; sticky inside is simpler). Keep
`DetailPanel` outside the scroll container. The red header div stays for now
(Phase 3 replaces it) but shows `centerYearAtom` formatted with `formatYear`.

### `Timeline.tsx`
- Remove the playhead/offset math and the translated `<g>` — the SVG now
  lives inside the scroll content at full timeline width
  (`timelineWidth(pps)`).
- Read `visibleRangeAtom`; **only map over dynasties/events that intersect
  it** (`d.endYear >= startYear && d.startYear <= endYear`). Same filter
  inside `Events.tsx`.
- Fix the lane math while touching this: replace the current
  `(TOP_OFFSET * dynasty.row * ROW_HEIGHT) / 30` with an explicit
  `laneY(row) = AXIS_HEIGHT + row * (ROW_HEIGHT + ROW_GAP)` helper in
  `constants.ts`. Add `ROW_GAP = 8`. Kings-in-label rendering stays as-is
  (Phase 2 replaces it).
- The category-label `<g>` at the end of `Timeline.tsx` (the white pills)
  currently sits at fixed x=0; make it stick to the viewport left by
  positioning it at `x = scrollX` (read `scrollXAtom`), or move those labels
  out of the SVG into a fixed-position HTML overlay. Either is fine.

### `YearAxis.tsx`
- Delete the `<input type="range">`, the playhead constant, and the offset
  math.
- Render tick marks inside the scroll content (sticky `top: 0`), full
  timeline width, using an **adaptive tick step**: pick the smallest step
  from `[1000, 500, 250, 100, 50, 25, 10, 5, 1]` such that
  `step * pps >= 90` px. Label every tick with `formatYear`. Only render
  ticks inside `visibleRangeAtom`.
- Delete `YearTick.tsx` if it no longer fits; plain elements in a map are
  fine.

## Edge cases

- **Clamp pps** to `[MIN_PPS, MAX_PPS]` everywhere it's set.
- `xToYear` can produce year 0 (which doesn't exist historically) — only a
  display concern; `formatYear(0)` shows "0", acceptable for the axis at
  integer steps ≥ 1... but when rounding `centerYearAtom`, map `0 → -1`.
- On mount, initialize `scrollXAtom` from the container's actual
  `scrollLeft` (0) — do not leave atoms stale if the browser restores scroll.
- StrictMode double-mount: effects in the hook must clean up listeners.

## Acceptance

- [ ] `npm run build` and `npm run lint` pass.
- [ ] No `window.innerWidth` reads left in any component render path.
- [ ] Trackpad two-finger swipe pans; mouse wheel pans; drag pans; scrollbar
      visible and usable.
- [ ] Ctrl+wheel / pinch zooms smoothly between MIN_PPS and MAX_PPS, and the
      year under the cursor stays put while zooming.
- [ ] Keyboard: arrows, `+`/`-`, Home/End work when the timeline has focus.
- [ ] Clicking a dynasty bar still opens the detail panel; a drag does NOT
      open it.
- [ ] React DevTools: scrolling does not re-render `DetailPanel`; only
      timeline components update, at most once per frame.
- [ ] With the React profiler, the number of rendered dynasty rects at
      default zoom is only those near the viewport (virtualization works).
