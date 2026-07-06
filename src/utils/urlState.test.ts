import { describe, expect, it } from "vitest";
import { parseViewParams, serializeViewParams } from "./urlState";
import { MAX_PPS } from "./constants";

describe("parseViewParams", () => {
  it("parses valid year, pps and selection", () => {
    const p = parseViewParams("?year=-550&pps=6&sel=king:cyrus-ii");
    expect(p.year).toBe(-550);
    expect(p.pps).toBe(6);
    expect(p.sel).toEqual({ kind: "king", id: "cyrus-ii" });
  });

  it("rejects out-of-range years and non-integers", () => {
    expect(parseViewParams("?year=9999").year).toBeUndefined();
    expect(parseViewParams("?year=1.5").year).toBeUndefined();
    expect(parseViewParams("?year=abc").year).toBeUndefined();
  });

  it("clamps pps and rejects non-positive values", () => {
    expect(parseViewParams("?pps=1000").pps).toBe(MAX_PPS);
    expect(parseViewParams("?pps=0").pps).toBeUndefined();
    expect(parseViewParams("?pps=-2").pps).toBeUndefined();
  });

  it("rejects malformed selections", () => {
    expect(parseViewParams("?sel=bogus:x").sel).toBeUndefined();
    expect(parseViewParams("?sel=king").sel).toBeUndefined();
    expect(parseViewParams("?sel=king:").sel).toBeUndefined();
  });

  it("ignores an id with colons only after the first delimiter", () => {
    expect(parseViewParams("?sel=event:a:b").sel).toEqual({ kind: "event", id: "a:b" });
  });
});

describe("serialize/parse round-trip", () => {
  it("preserves a full view", () => {
    const qs = serializeViewParams(700, 4.5, { kind: "dynasty", id: "samanid" });
    const p = parseViewParams(`?${qs}`);
    expect(p.year).toBe(700);
    expect(p.pps).toBe(4.5);
    expect(p.sel).toEqual({ kind: "dynasty", id: "samanid" });
  });

  it("omits selection when none is open", () => {
    const qs = serializeViewParams(0, 3, null);
    expect(qs).not.toContain("sel");
  });
});
