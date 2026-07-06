// Candidate tick spacings (years). Pick the smallest whose on-screen spacing
// is at least MIN_TICK_PX, so axis ticks stay readable at every zoom level.
export const TICK_STEPS = [1000, 500, 250, 100, 50, 25, 10, 5, 1];
export const MIN_TICK_PX = 90;

export const chooseTickStep = (pps: number): number =>
  [...TICK_STEPS].reverse().find((step) => step * pps >= MIN_TICK_PX) ?? 1000;
