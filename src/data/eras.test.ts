import { describe, expect, it } from "vitest";
import { eras, eraForYear } from "./eras";
import { MAX_YEAR, MIN_YEAR } from "../utils/constants";

describe("eras", () => {
  it("tile MIN_YEAR..MAX_YEAR with no gaps or overlaps", () => {
    expect(eras[0].startYear).toBe(MIN_YEAR);
    expect(eras[eras.length - 1].endYear).toBe(MAX_YEAR);
    for (let i = 1; i < eras.length; i++) {
      expect(eras[i].startYear).toBe(eras[i - 1].endYear);
    }
  });

  it("resolves each era at its inclusive start and just before its exclusive end", () => {
    for (const era of eras) {
      expect(eraForYear(era.startYear).id).toBe(era.id);
      expect(eraForYear(era.endYear - 1).id).toBe(era.id);
    }
  });

  it("resolves boundary years to the era that starts there", () => {
    expect(eraForYear(-550).id).toBe("achaemenid");
    expect(eraForYear(224).id).toBe("sasanian");
    expect(eraForYear(1501).id).toBe("safavid");
  });

  it("clamps the endpoints of the timeline", () => {
    expect(eraForYear(MIN_YEAR).id).toBe(eras[0].id);
    expect(eraForYear(MAX_YEAR).id).toBe(eras[eras.length - 1].id);
  });
});
