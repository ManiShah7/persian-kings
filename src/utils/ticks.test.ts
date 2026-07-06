import { describe, expect, it } from "vitest";
import { MIN_TICK_PX, chooseTickStep } from "./ticks";

describe("chooseTickStep", () => {
  it("keeps tick spacing at or above the minimum", () => {
    for (const pps of [0.4, 1, 3, 6, 12, 24]) {
      expect(chooseTickStep(pps) * pps).toBeGreaterThanOrEqual(MIN_TICK_PX);
    }
  });

  it("uses larger steps as pps shrinks", () => {
    expect(chooseTickStep(24)).toBeLessThanOrEqual(chooseTickStep(3));
    expect(chooseTickStep(3)).toBeLessThanOrEqual(chooseTickStep(0.4));
  });

  it("picks the smallest qualifying step", () => {
    // At pps=3, need step >= 30; smallest candidate is 50.
    expect(chooseTickStep(3)).toBe(50);
  });
});
