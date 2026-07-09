// Visual design tokens. Timeline *geometry* stays in utils/constants.ts;
// this file is style only. Components import from here instead of hardcoding.

export const font = {
  latin: `"Fraunces Variable", Georgia, serif`, // display / headings
  ui: `"Inter Variable", system-ui, sans-serif`, // labels, body
  farsi: `"Vazirmatn Variable", Tahoma, sans-serif`,
};

export const text = { xs: 11, sm: 12, md: 14, lg: 16, xl: 22, hud: 28 };

export const color = {
  ink: "#e8e4dc", // primary text on dark
  inkDim: "#a39d92",
  inkFaint: "#6b665e",
  panelBg: "#141210",
  line: "rgba(255,255,255,0.08)",
};

export const radius = { sm: 3, md: 6, lg: 10 };

export const shadow = { panel: "-8px 0 32px rgba(0,0,0,0.5)" };

export const z = { background: -1, timeline: 0, seek: 15, hud: 20, panel: 30 };
