import { describe, expect, it } from "vitest";
import { xToYear, yearToX } from "./coords";
import { MIN_YEAR } from "./constants";

describe("coords", () => {
  it("maps MIN_YEAR to x=0", () => {
    expect(yearToX(MIN_YEAR, 3)).toBe(0);
  });

  it("scales linearly with pps", () => {
    expect(yearToX(MIN_YEAR + 100, 3)).toBe(300);
    expect(yearToX(MIN_YEAR + 100, 6)).toBe(600);
  });

  it("round-trips year -> x -> year at several zoom levels", () => {
    for (const pps of [0.4, 1, 3, 12, 24]) {
      for (const year of [-728, -550, -1, 1, 224, 1000, 1979]) {
        expect(xToYear(yearToX(year, pps), pps)).toBeCloseTo(year, 6);
      }
    }
  });
});
