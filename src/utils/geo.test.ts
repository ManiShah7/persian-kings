import { describe, expect, it } from "vitest";
import { GEO_BOX, projectCapital } from "./geo";

describe("projectCapital", () => {
  it("maps the box corners to the box edges", () => {
    expect(projectCapital(GEO_BOX.latMax, GEO_BOX.lngMin, 300, 180)).toEqual({ x: 0, y: 0 });
    expect(projectCapital(GEO_BOX.latMin, GEO_BOX.lngMax, 300, 180)).toEqual({ x: 300, y: 180 });
  });

  it("maps the center to the middle", () => {
    const { x, y } = projectCapital(33, 55, 300, 180);
    expect(x).toBeCloseTo(150, 5);
    expect(y).toBeCloseTo(90, 5);
  });

  it("puts higher latitudes nearer the top (smaller y)", () => {
    expect(projectCapital(40, 50, 300, 180).y).toBeLessThan(projectCapital(28, 50, 300, 180).y);
  });
});
