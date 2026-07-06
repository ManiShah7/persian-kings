import { describe, expect, it } from "vitest";
import { dynasties, events, kings } from "./index";
import { CATEGORY_ORDER } from "../utils/constants";

describe("data sanity", () => {
  const dynastyIds = new Set(dynasties.map((d) => d.id));

  it("every king belongs to a real dynasty", () => {
    for (const king of kings) {
      expect(dynastyIds.has(king.dynastyId), `${king.id} -> ${king.dynastyId}`).toBe(true);
    }
  });

  it("every entity has startYear <= endYear and no year 0", () => {
    for (const d of dynasties) {
      expect(d.startYear).toBeLessThanOrEqual(d.endYear);
      expect(d.startYear).not.toBe(0);
      expect(d.endYear).not.toBe(0);
    }
    for (const k of kings) {
      expect(k.startYear).toBeLessThanOrEqual(k.endYear);
      expect(k.startYear).not.toBe(0);
      expect(k.endYear).not.toBe(0);
    }
    for (const e of events) {
      expect(e.year).not.toBe(0);
    }
  });

  it("every event has a known category", () => {
    for (const e of events) {
      expect(CATEGORY_ORDER).toContain(e.category);
    }
  });

  it("all ids are unique within each dataset", () => {
    expect(new Set(dynasties.map((d) => d.id)).size).toBe(dynasties.length);
    expect(new Set(kings.map((k) => k.id)).size).toBe(kings.length);
    expect(new Set(events.map((e) => e.id)).size).toBe(events.length);
  });
});
