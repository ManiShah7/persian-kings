# Persian Kings — Execution Plan

This folder is the implementation plan for turning the timeline into a
portfolio-grade app. Execute the phases **in order** — each builds on the
previous one. One phase = one coherent unit of work = one commit (or a few).

## Vision

A horizontally-scrolling journey through 2,700 years of Iranian history.
Scrolling pans through time; zooming changes the time scale. Dynasties and
their kings render as nested bars, events as markers in category lanes. As the
viewer scrolls, the page's background and header **change atmosphere by era**
(Achaemenid golds → Sasanian crimson → post-conquest greys → Safavid greens →
Pahlavi navy…), so moving through time *feels* like moving through history.
Everything is clickable and opens the existing detail panel.

The bar is "would a hiring frontend engineer be impressed": clean
architecture, correct typing, 60fps interaction, deliberate visual design,
accessibility, tests.

## Phases

| # | File | What | Depends on |
|---|------|------|-----------|
| 1 | [phase-1-scroll-pan-zoom.md](phase-1-scroll-pan-zoom.md) | Replace slider/playhead with native scroll + zoom; viewport atoms; virtualization | — |
| 2 | [phase-2-kings-lod.md](phase-2-kings-lod.md) | Kings as reign segments inside dynasty bars; level-of-detail by zoom; sticky labels | 1 |
| 3 | [phase-3-eras-atmosphere.md](phase-3-eras-atmosphere.md) | Era config; crossfading background; header HUD | 1 |
| 4 | [phase-4-design-pass.md](phase-4-design-pass.md) | Design tokens, fonts (Latin + Farsi), dark theme, detail panel & event marker polish | 2, 3 |
| 5 | [phase-5-portfolio-polish.md](phase-5-portfolio-polish.md) | URL state, keyboard/a11y, Vitest suite, README, deploy meta, capitals map (stretch) | 1–4 |

## Global conventions (apply in every phase)

- **TypeScript strict, no `any`.** New types go in `src/types/`.
- **All year↔pixel math goes through `src/utils/coords.ts`** (`yearToX`,
  `xToYear`). Never compute `(year - MIN_YEAR) * pps` inline.
- **Magic numbers go in `src/utils/constants.ts`** (or `src/theme/tokens.ts`
  after Phase 4).
- **Jotai for shared state**, atoms in `src/state/atoms.ts`. Prefer derived
  atoms over duplicated math in components.
- Years are signed ints, negative = BC, **no year 0**. `startYearApprox` /
  `endYearApprox` / `yearApprox` mean "display with `c.` prefix" — use the
  existing `formatYear`/`formatRange` in `src/utils/format.ts`.
- Farsi text (`nameFa`/`titleFa`) always renders with `dir="rtl"`.
- After each phase: `npm run build` and `npm run lint` must pass with zero
  errors, and the manual checks in that phase's **Acceptance** section must
  pass in `npm run dev`.
- Don't refactor beyond what the phase asks for. The repo owner does cleanup
  passes himself.

## Current state (as of writing)

- `App.tsx` — red fixed header showing `activeYear`, then `<Timeline/>`,
  `<YearAxis/>`, `<DetailPanel/>`.
- `Timeline.tsx` — SVG sized to `window.innerWidth`; a `<g>` translated by a
  playhead offset derived from `activeYearAtom`; dynasty rects with king names
  **joined into the label text** (kings are not individual elements yet);
  renders `<Events/>`; category lane labels.
- `YearAxis.tsx` — duplicated playhead offset math + an
  `<input type="range">` that scrubs `activeYearAtom`. **The slider and
  playhead model gets deleted in Phase 1.**
- `Events.tsx` — 40 events as stem+dot markers with rotated labels in three
  category lanes. Labels collide at this zoom; fixed in Phase 4.
- `DetailPanel.tsx` — working fixed right panel for dynasty/king/event
  selection via `selectionAtom`. Restyled in Phase 4.
- `state/atoms.ts` — `activeYearAtom` (replaced in Phase 1), `selectionAtom`
  (kept).
- Data: 29 dynasties (rows 0–4), 65 kings, 40 events. Dynasty rows overlap in
  time (e.g. rows 0–3 all occupied ~900–1200 AD).
