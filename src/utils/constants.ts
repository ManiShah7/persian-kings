export const MIN_YEAR = -728; // earliest year on timeline (Median start)
export const MAX_YEAR = 1979; // latest year (Pahlavi end)
export const PIXELS_PER_YEAR = 3; // horizontal scale
export const ROW_HEIGHT = 60; // height of each lane
export const NUM_DYNASTY_ROWS = 5; // rows 0-4
export const NUM_EVENT_ROWS = 3; // politics-wars, culture-religion, science
export const TOP_OFFSET = 80; // space at top for the year ticker
export const EVENT_ROWS_TOP = TOP_OFFSET;

export const ALL_YEARS = Math.abs(MIN_YEAR) + MAX_YEAR;
export const APP_WIDTH = ALL_YEARS * PIXELS_PER_YEAR;

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
