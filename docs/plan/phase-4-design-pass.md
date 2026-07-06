# Phase 4 — Visual design pass

Requires Phases 2 and 3. This phase converts "works" into "looks hired".

## 1. Design tokens — `src/theme/tokens.ts`

Centralize every visual constant. Components import from here instead of
hardcoding:

```ts
export const font = {
  latin: `"Fraunces Variable", Georgia, serif`,        // display/headings
  ui: `"Inter Variable", system-ui, sans-serif`,       // labels, body
  farsi: `"Vazirmatn Variable", Tahoma, sans-serif`,
};
export const text = { xs: 11, sm: 12, md: 14, lg: 16, xl: 22, hud: 28 };
export const color = {
  ink: "#e8e4dc",       // primary text on dark
  inkDim: "#a39d92",
  inkFaint: "#6b665e",
  panelBg: "#141210",
  line: "rgba(255,255,255,0.08)",
};
export const radius = { sm: 3, md: 6, lg: 10 };
export const shadow = { panel: "-8px 0 32px rgba(0,0,0,0.5)" };
export const z = { background: -1, timeline: 0, hud: 20, panel: 30 };
```

Fonts: `npm i @fontsource-variable/fraunces @fontsource-variable/inter
@fontsource-variable/vazirmatn`, import the three CSS files in `main.tsx`.
Self-hosted — no runtime Google Fonts request. Apply `font.farsi` to every
`dir="rtl"` element (add a `.fa` class in `index.css`).

Keep *timeline geometry* constants in `utils/constants.ts`; `tokens.ts` is
visual style only.

## 2. `index.css`

Real base styles: `box-sizing: border-box` reset; body font = `font.ui`;
light-on-dark defaults; `::selection` in a warm gold; visible
`:focus-visible` outlines (2px accent); scrollbar styling for the timeline
container (thin, subtle, WebKit + Firefox syntax); the `.fa` class;
`.king-segment:hover` / dynasty-header hover rules from Phase 2 refined here.

## 3. Dynasty & king bar cohesion

The raw data colors (`#FF69B4`, `#A9A9A9`…) are inconsistent in saturation
and lightness. Don't edit the JSON; normalize at render time:

- Add `normalizeDynastyColor(hex: string): string` in `src/utils/color.ts`:
  convert to HSL, clamp saturation to 35–65% and lightness to 38–58%, return
  hex. Use the normalized color everywhere the dynasty color is rendered
  (bars, detail-panel accents, event lane usage stays as-is).
- **Foreign rule** (`dynasty.foreignRule` — Macedonian, Seleucid, Umayyad,
  Abbasid, Ilkhanate, Jalayirid): render the header strip with a diagonal
  hatch instead of solid fill — one shared SVG `<pattern>` (id
  `foreign-hatch`, 6px diagonal lines of the dynasty color on transparent)
  defined once in `Timeline.tsx`'s `<defs>`, plus a dashed 1px border on the
  container. Add "Foreign rule" to the detail-panel eyebrow (already there)
  — the visual mark tells the story at a glance.
- Bar text: dynasty header text in near-white; king names in
  `rgba(0,0,0,0.75)` or near-white chosen by a `contrastText(bg)` helper
  (relative-luminance threshold) in `color.ts`.

## 4. Event markers — declutter

`Events.tsx` currently rotates a label next to every dot; at default zoom
they collide badly.

- **LOD**: labels only when `pps >= 6`; below that, dots only.
- **Clustering** below `pps 6`: group events in the same lane closer than
  16px; render a slightly larger circle with the count inside (`fontSize 9`,
  white). Clicking a cluster zooms in: set `pps` to the level where the
  cluster separates (e.g. `pps * 2.5`, clamped) anchored at the cluster's
  year. Pure function `clusterEvents(events, pps, minGapPx)` →
  `Array<{ x, events }>` — unit-tested in Phase 5.
- Replace the rotated text with horizontal labels above the dot
  (`textAnchor="middle"`, dy −8), `fill: color.inkDim`, keep `c.` prefix.
- **Hover tooltip** (replaces `<title>`): a single reusable
  `src/components/Tooltip.tsx` rendered in a portal at the pointer, dark
  card (`panelBg`, `radius.md`, 1px `line` border), showing
  title / titleFa / year. Also use it on king segments (name, reign,
  death cause first ~6 words).

## 5. Detail panel polish (`DetailPanel.tsx`)

- Restyle to dark theme: `panelBg` background, `color.ink` text, accents via
  the normalized dynasty color / category color, `shadow.panel`.
- **Animate in**: slide from right + fade, 240ms `cubic-bezier(0.2,0.8,0.2,1)`.
  Mount-animation via a CSS class is fine; skip under
  `prefers-reduced-motion`.
- **Close on `Escape`** and on click outside the panel (pointer-down
  listener; ignore clicks that land in the panel). Keep the × button;
  give it `:focus-visible` styling; move focus to the panel (`tabIndex={-1}`,
  `.focus()`) on open and restore focus on close.
- **King view gains a reign-position bar**: a slim horizontal track
  representing the dynasty's full span with the king's reign highlighted in
  the accent color, labels `formatYear(dynasty.startYear)` /
  `formatYear(dynasty.endYear)` at the ends. Pure presentational component
  inside `DetailPanel.tsx`.
- Dynasty view: rulers list becomes clickable — each name sets
  `selectionAtom` to that king (drill-down navigation). Add a "← back to
  dynasty" affordance in the king view when the previous selection was its
  dynasty (keep a simple `previousSelection` in component state or extend
  the atom to a small stack — component state is enough).
- Typography: headings in `font.latin`, Farsi lines in `font.farsi`.

## 6. HUD refinement

Bring `HeaderHUD` onto tokens: title in `font.latin`, year in a large
tabular figure, era names sized with `text.sm`. Verify it still reads over
every era gradient.

## Acceptance

- [ ] Build + lint pass; no hardcoded font-families/colors left in
      components that duplicate a token.
- [ ] Zero layout shift while fonts load (fonts are bundled).
- [ ] At default zoom no event labels overlap; clusters show counts; clicking
      a cluster zooms to separate it.
- [ ] Foreign-rule dynasties are visually distinct (hatched header, dashed
      border) — compare Abbasid vs Samanid.
- [ ] Panel slides in; Esc and outside-click close it; focus lands in the
      panel on open.
- [ ] Ruler names in a dynasty panel navigate to that king's panel.
- [ ] Screenshot test by eye at years -500, 700, 1250, 1600, 1935: each
      scene looks composed — consistent bar palette, legible labels,
      era backdrop harmonious with content.
