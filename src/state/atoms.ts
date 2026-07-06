import { atom } from "jotai";
import { xToYear } from "../utils/coords";
import { DEFAULT_PPS } from "../utils/constants";

// --- Viewport (single source of truth for scroll/pan/zoom) ---

export const ppsAtom = atom<number>(DEFAULT_PPS); // pixels per year (zoom)
export const scrollXAtom = atom<number>(0); // scroll-container scrollLeft, px
export const viewportWidthAtom = atom<number>(
  typeof window === "undefined" ? 1200 : window.innerWidth,
);

// Derived — the year range currently on screen, padded by ~1 viewport on each
// side so elements mount slightly before they scroll into view.
export const visibleRangeAtom = atom((get) => {
  const pps = get(ppsAtom);
  const x = get(scrollXAtom);
  const w = get(viewportWidthAtom);
  return {
    startYear: xToYear(x - w, pps),
    endYear: xToYear(x + 2 * w, pps),
  };
});

// Derived — the year at the horizontal center of the screen. Drives the era
// background + header HUD. Year 0 doesn't exist historically → map it to -1.
export const centerYearAtom = atom((get) => {
  const year = Math.round(
    xToYear(get(scrollXAtom) + get(viewportWidthAtom) / 2, get(ppsAtom)),
  );
  return year === 0 ? -1 : year;
});

// --- Selection (detail panel) ---

export type Selection =
  | { kind: "dynasty"; id: string }
  | { kind: "king"; id: string }
  | { kind: "event"; id: string };

export const selectionAtom = atom<Selection | null>(null);
