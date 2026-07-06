import { atom } from "jotai";
import { xToYear } from "../utils/coords";
import { DEFAULT_PPS } from "../utils/constants";
import { eraForYear } from "../data/eras";

// --- Viewport (single source of truth for scroll/pan/zoom) ---

export const ppsAtom = atom<number>(DEFAULT_PPS); // pixels per year (zoom)
export const scrollXAtom = atom<number>(0); // scroll-container scrollLeft, px
export const viewportWidthAtom = atom<number>(
  typeof window === "undefined" ? 1200 : window.innerWidth,
);

// The timeline is padded with a leading + trailing gutter of half a viewport
// each, so the first and last years can be scrolled all the way to the centre.
// With that gutter the SVG's x=0 sits half a viewport in, which makes the
// centre year exactly xToYear(scrollLeft): scrollLeft 0 → MIN_YEAR, scrollLeft
// timelineWidth → MAX_YEAR.

// Derived — the year range currently on screen, padded by ~1 viewport on each
// side so elements mount slightly before they scroll into view.
export const visibleRangeAtom = atom((get) => {
  const pps = get(ppsAtom);
  const x = get(scrollXAtom);
  const w = get(viewportWidthAtom);
  // SVG-x at the viewport's left edge is scrollLeft minus the half-viewport
  // gutter; pad by one viewport on each side.
  const leftSvgX = x - w / 2;
  return {
    startYear: xToYear(leftSvgX - w, pps),
    endYear: xToYear(leftSvgX + 2 * w, pps),
  };
});

// Derived — the year at the horizontal center of the screen. Drives the era
// background + header HUD. Year 0 doesn't exist historically → map it to -1.
export const centerYearAtom = atom((get) => {
  const year = Math.round(xToYear(get(scrollXAtom), get(ppsAtom)));
  return year === 0 ? -1 : year;
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
