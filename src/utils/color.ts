export type Rgb = { r: number; g: number; b: number };

const clampChannel = (v: number): number => Math.max(0, Math.min(255, Math.round(v)));

export const hexToRgb = (hex: string): Rgb => {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const int = parseInt(h, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

export const rgbToHex = ({ r, g, b }: Rgb): string => {
  const toHex = (v: number) => clampChannel(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Lighten (amount > 0) or darken (amount < 0) a hex color by shifting each RGB
 * channel by `amount`. No external color library.
 */
export const shadeColor = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({ r: r + amount, g: g + amount, b: b + amount });
};

export type Hsl = { h: number; s: number; l: number }; // h 0-360, s/l 0-1

export const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
};

export const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
};

const SAT_MIN = 0.35;
const SAT_MAX = 0.65;
const LIGHT_MIN = 0.38;
const LIGHT_MAX = 0.58;

/**
 * Bring the raw, inconsistent dynasty colors into a cohesive band by clamping
 * saturation and lightness in HSL. Hue is preserved.
 */
export const normalizeDynastyColor = (hex: string): string => {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  return rgbToHex(
    hslToRgb({
      h,
      s: Math.max(SAT_MIN, Math.min(SAT_MAX, s)),
      l: Math.max(LIGHT_MIN, Math.min(LIGHT_MAX, l)),
    }),
  );
};

/** Pick a near-white or near-black text color for legibility over `hex`. */
export const contrastText = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? "rgba(0,0,0,0.82)" : "#f5f2ec";
};
