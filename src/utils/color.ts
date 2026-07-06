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
