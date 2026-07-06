export const MIN_YEAR = -728; // earliest year on timeline (Median start)
export const MAX_YEAR = 1979; // latest year (Pahlavi end)
export const ROW_HEIGHT = 60; // height of each dynasty lane
export const ROW_GAP = 8; // vertical gap between dynasty lanes
export const NUM_DYNASTY_ROWS = 5; // rows 0-4
export const NUM_EVENT_ROWS = 3; // politics-wars, culture-religion, science
export const AXIS_HEIGHT = 48; // height of the sticky year-axis strip
export const HUD_HEIGHT = 72; // height of the fixed header HUD

export const ALL_YEARS = Math.abs(MIN_YEAR) + MAX_YEAR;

// Zoom (pixels per year) bounds. pps is dynamic state, not a fixed constant.
export const DEFAULT_PPS = 3;
export const MIN_PPS = 0.4; // ~fit-everything on a laptop screen
export const MAX_PPS = 24; // one year ≈ 24px, comfortable king-label zoom

// Full timeline width in px at a given zoom.
export const timelineWidth = (pps: number): number => ALL_YEARS * pps;

// Vertical position of a dynasty lane by its row index.
export const laneY = (row: number): number =>
  AXIS_HEIGHT + row * (ROW_HEIGHT + ROW_GAP);

// Dynasty-bar anatomy + king level-of-detail thresholds.
export const DYNASTY_HEADER_HEIGHT = 22; // solid header strip holding the name
export const KING_SEGMENTS_MIN_PPS = 1.2; // show king segments at/above this zoom
export const KING_NAME_MIN_WIDTH = 70; // segment px width to show the king name
export const KING_RANGE_MIN_WIDTH = 130; // + reign range as well

import type { EventCategory } from "../types/Event";

export const EVENT_BAND_TOP = 720;
export const EVENT_LANE_HEIGHT = 90;
export const EVENT_STEM_HEIGHT = 14;

export const CATEGORY_ORDER: EventCategory[] = [
  "politics-wars",
  "culture-religion",
  "science",
];

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; color: string }
> = {
  "politics-wars": { label: "Politics & Wars", color: "#B23A48" },
  "culture-religion": { label: "Culture & Religion", color: "#6A4C93" },
  science: { label: "Science", color: "#1B998B" },
};

export const TIMELINE_HEIGHT =
  EVENT_BAND_TOP + CATEGORY_ORDER.length * EVENT_LANE_HEIGHT;
