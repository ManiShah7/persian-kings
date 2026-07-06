import { describe, expect, it } from "vitest";
import { formatRange, formatYear } from "./format";

describe("formatYear", () => {
  it("formats AD years plainly", () => {
    expect(formatYear(1979)).toBe("1979");
  });

  it("formats BC years with a suffix", () => {
    expect(formatYear(-550)).toBe("550 BC");
  });

  it("adds a c. prefix when approximate", () => {
    expect(formatYear(-728, true)).toBe("c. 728 BC");
    expect(formatYear(224, true)).toBe("c. 224");
  });
});

describe("formatRange", () => {
  it("joins start and end", () => {
    expect(formatRange(-559, -530)).toBe("559 BC – 530 BC");
  });

  it("applies approx flags per endpoint", () => {
    expect(formatRange(-559, -530, true, false)).toBe("c. 559 BC – 530 BC");
  });
});
