import { describe, expect, it } from "vitest";
import {
  contrastText,
  hexToRgb,
  normalizeDynastyColor,
  rgbToHsl,
  shadeColor,
} from "./color";

const HEX = /^#[0-9a-f]{6}$/;

describe("shadeColor", () => {
  it("returns valid hex and clamps channels at the extremes", () => {
    expect(shadeColor("#808080", 20)).toMatch(HEX);
    expect(shadeColor("#ffffff", 50)).toBe("#ffffff");
    expect(shadeColor("#000000", -50)).toBe("#000000");
  });

  it("lightens for positive and darkens for negative amounts", () => {
    const base = hexToRgb("#606060").r;
    expect(hexToRgb(shadeColor("#606060", 18)).r).toBeGreaterThan(base);
    expect(hexToRgb(shadeColor("#606060", -8)).r).toBeLessThan(base);
  });
});

describe("normalizeDynastyColor", () => {
  const raws = ["#FF69B4", "#A9A9A9", "#4169E1", "#8B4513", "#191970", "#1E90FF"];

  it("returns valid hex within the clamped S/L band (allowing 8-bit drift)", () => {
    for (const raw of raws) {
      const out = normalizeDynastyColor(raw);
      expect(out).toMatch(HEX);
      const { s, l } = rgbToHsl(hexToRgb(out));
      expect(s).toBeGreaterThanOrEqual(0.35 - 0.02);
      expect(s).toBeLessThanOrEqual(0.65 + 0.02);
      expect(l).toBeGreaterThanOrEqual(0.38 - 0.02);
      expect(l).toBeLessThanOrEqual(0.58 + 0.02);
    }
  });
});

describe("contrastText", () => {
  it("picks dark text on light backgrounds and light text on dark", () => {
    expect(contrastText("#eeeeee")).toBe("rgba(0,0,0,0.82)");
    expect(contrastText("#1a1a1a")).toBe("#f5f2ec");
  });
});
