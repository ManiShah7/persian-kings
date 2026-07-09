import { atom } from "jotai";
import { xToYear } from "../utils/coords";
import { ALL_YEARS, DEFAULT_PPS, MAX_YEAR, MIN_YEAR, timelineWidth } from "../utils/constants";
import { clamp } from "../utils/clamp";
import { eraForYear } from "../data/eras";

// --- Viewport (single source of truth for scroll/pan/zoom) ---

export const ppsAtom = atom<number>(DEFAULT_PPS); // pixels per year (zoom)
export const scrollXAtom = atom<number>(0); // scroll-container scrollLeft, px
export const viewportWidthAtom = atom<number>(
  typeof window === "undefined" ? 1200 : window.innerWidth,
);

// The scroll-content is exactly the timeline width — no gutters. The first and
// last years sit flush against the viewport's left/right edges (you can't
// scroll past them). The SVG's x=0 aligns with the content's left edge, so the
// viewport's left edge is at SVG-x = scrollLeft and its centre at SVG-x =
// scrollLeft + viewportWidth/2.

// Derived — the year range currently on screen, padded by ~1 viewport on each
// side so elements mount slightly before they scroll into view.
export const visibleRangeAtom = atom((get) => {
  const pps = get(ppsAtom);
  const x = get(scrollXAtom);
  const w = get(viewportWidthAtom);
  // The viewport spans SVG-x [x, x + w]; pad by one viewport on each side.
  return {
    startYear: xToYear(x - w, pps),
    endYear: xToYear(x + 2 * w, pps),
  };
});

// Derived — the "playhead" year that drives the header HUD + era background.
// Without gutters the geometric viewport centre can't reach the first/last
// years (they sit flush at the edges), so instead we report scroll *progress*
// across the whole span: scrollLeft 0 → MIN_YEAR, scrollLeft max → MAX_YEAR.
// This meets the geometric centre exactly at the midpoint and lets the readout
// span end to end. Falls back to the clamped centre when the timeline fully
// fits on screen (nothing to scroll). Year 0 is unhistorical → map it to -1.
export const centerYearAtom = atom((get) => {
  const pps = get(ppsAtom);
  const x = get(scrollXAtom);
  const w = get(viewportWidthAtom);
  const maxScroll = timelineWidth(pps) - w;
  const year =
    maxScroll > 0
      ? MIN_YEAR + clamp(x / maxScroll, 0, 1) * ALL_YEARS
      : clamp(xToYear(x + w / 2, pps), MIN_YEAR, MAX_YEAR);
  const rounded = Math.round(year);
  return rounded === 0 ? -1 : rounded;
});

// Derived — the era containing the centered year.
export const currentEraAtom = atom((get) => eraForYear(get(centerYearAtom)));

// --- Selection (detail panel) ---

export type Selection =
  | { kind: "dynasty"; id: string }
  | { kind: "king"; id: string }
  | { kind: "event"; id: string };

export const selectionAtom = atom<Selection | null>(null);

// --- Tooltip (hover card rendered in a portal) ---

export type TooltipContent = {
  title: string;
  titleFa?: string;
  lines: string[];
};

export const tooltipAtom = atom<{
  content: TooltipContent;
  x: number;
  y: number;
} | null>(null);
