# Persian Kings — Interactive History Timeline

An interactive, horizontally-scrollable timeline of Persian/Iranian history from the
Median Empire (728 BC) through the fall of the Pahlavi dynasty (1979). Dynasties,
their kings, and major historical events are plotted on a shared time axis the user
can pan and zoom through.

## Purpose

This is a **portfolio / resume project**. The bar is "extremely professional": the
code, architecture, and visual design should all be presentable to potential
employers. When making decisions, favor clean abstractions, correct typing, and
polished UX over quick hacks. Treat visual design and interaction quality as
first-class concerns, not afterthoughts.

## Tech Stack

- **React 19** + **TypeScript** (strict) + **Vite 8**
- **Jotai** for state (atoms in `src/state/`)
- **SVG** for timeline rendering (not canvas/DOM)
- No CSS framework yet — plain inline styles + `index.css` (styling is placeholder)

Scripts: `npm run dev` (Vite dev server), `npm run build` (`tsc -b && vite build`),
`npm run lint` (ESLint), `npm run preview`.

## Domain Model

Three datasets in `src/data/`, all keyed by string `id`:

- **`dynasties.json`** (`Dynasty`) — a ruling house/empire. Has `startYear`/`endYear`,
  a `row` (0–4, which lane it draws in), a `color`, a `capital` (`{name, lat, lng}`),
  a `foreignRule` flag, and `facts[]`. ~30 entries spanning Medes → Pahlavi.
- **`kings.json`** (`King`) — an individual ruler. Belongs to a dynasty via
  `dynastyId`. Has reign `startYear`/`endYear`, `nameFa` (Persian name), `facts[]`,
  and `deathCause`.
- **`events.json`** — discrete historical moments (battles, books, discoveries).
  Has a single `year`, a `category` (`politics-wars` | `culture-religion` |
  `science`), `title`/`titleFa`, and a `fact`. **Not yet rendered.** (No TS type
  defined for events yet — add one in `src/types/` when wiring these up.)

Conventions across all data:
- Years are signed integers; **negative = BC** (e.g. `-550`). There is no year 0.
- `startYearApprox`/`endYearApprox`/`yearApprox` booleans flag uncertain dates —
  surface these in the UI (e.g. a `c.` prefix) rather than presenting them as exact.
- `nameFa`/`titleFa` hold Persian (Farsi, RTL) text for bilingual display.

## Coordinate System

The timeline maps **years → x-pixels** linearly. This is the spine of the whole app.

- `src/utils/constants.ts` — `MIN_YEAR` (-728), `MAX_YEAR` (1979), `PIXELS_PER_YEAR`,
  `ROW_HEIGHT`, row counts, offsets. `APP_WIDTH` is the full timeline width in px.
- `src/utils/coords.ts` — `yearToX(year, pps)` and `xToYear(x, pps)`. Always convert
  through these, never compute pixel offsets inline.
- Dynasties stack into lanes by their `row`; kings will nest within their dynasty's
  span; events belong in category lanes.

## State

`src/state/atoms.ts` — currently just `activeYearAtom` (the focused year). Components
read it via Jotai `useAtomValue`/`useAtom`. The active year drives the horizontal
pan offset (a "playhead" the timeline scrolls to keep in view).

## Architecture Notes / Known Rough Edges

The app works but is mid-refactor. Be aware:

- **Navigation is changing.** The current model is a range-slider that scrubs a fixed
  playhead. The **intended** model is **free horizontal scroll/pan + zoom** (direct
  drag-to-pan, zoom to change the time scale). New navigation work should move toward
  scroll/pan/zoom; the slider is transitional.
- `window.innerWidth` is read directly in render (`Timeline.tsx`, `YearAxis.tsx`) —
  not resize-reactive. Revisit when reworking navigation.
- `Timeline.tsx` and `YearAxis.tsx` duplicate the playhead/offset math. Worth
  hoisting into a shared hook or derived atom.
- Placeholder styling (red fixed header, raw SVG `<text>`) — slated for a design pass.

## Roadmap (priority order)

1. **Render events** — wire `events.json` into the three category lanes; add an
   `Event` type.
2. **Detail panel** — click a dynasty / king / event to open a panel with its facts,
   dates, capital, death cause, etc.
3. **Map of capitals** — use each dynasty's `capital` lat/lng to plot capitals on a map.
4. **Visual / styling polish** — replace placeholder styling with a deliberate,
   professional design.
5. **Free scroll/pan + zoom navigation** (see above) — underpins the interaction model.

## Conventions

- TypeScript is strict — keep it that way; no `any`, define types in `src/types/`.
- Keep year↔pixel math in `coords.ts`; keep magic numbers in `constants.ts`.
- The user prefers concise communication and does end-of-build cleanup themselves —
  don't flag DRY/refactor nits mid-feature.
