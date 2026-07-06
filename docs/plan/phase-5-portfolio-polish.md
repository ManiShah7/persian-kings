# Phase 5 — Portfolio credibility layer

Requires Phases 1–4. These are the things a hiring engineer checks after the
first impression: shareable URLs, keyboard/a11y, tests, README, deploy.

## 1. URL state (shareable views)

- On load, read `?year=<int>&pps=<float>` from `location.search`; if
  present (and valid: year in `[MIN_YEAR, MAX_YEAR]`, pps clamped), center
  the viewport on that year at that zoom before first paint (set
  `ppsAtom` + initial `scrollLeft` in the viewport hook's mount effect).
- While navigating, write the current `centerYear` and `pps` back with
  `history.replaceState` (never `pushState` — no history spam), debounced
  ~300ms after scrolling/zooming stops.
- Selection too: `&sel=king:cyrus-ii` restores the detail panel. Encode as
  `kind:id`; validate the id exists before applying.
- Pure helpers `parseViewParams(search: string)` / `serializeViewParams(...)`
  in `src/utils/urlState.ts` — unit-tested.

## 2. Accessibility sweep

- Timeline scroll container: `role="region"`, `aria-label="Timeline of
  Iranian history"`, keyboard already works (Phase 1) — verify against this
  list: arrows, shift+arrows, `+`/`-`, Home/End.
- Dynasty headers, king segments, event markers: `tabIndex={0}`,
  `role="button"`, `aria-label` like `"Cyrus II (the Great), reigned c. 559
  to c. 530 BC, Achaemenid dynasty"`, Enter/Space triggers the same
  `onClick`. Tab order will be document order — acceptable.
- Focused SVG elements get a visible focus ring (SVG `:focus-visible`
  → 2px stroke in the era accent).
- `prefers-reduced-motion` already handled in Phases 3–4; verify all three
  spots (era crossfade, parallax if built, panel slide).
- Run Chrome Lighthouse a11y audit; fix anything scoring below ~95 that
  takes <30min each (contrast, aria, names).

## 3. Tests — Vitest

`npm i -D vitest` (no jsdom needed — test pure logic only). Add
`"test": "vitest run"` script. Test files next to sources
(`*.test.ts`). Cover:

- `coords.ts` — `yearToX`/`xToYear` round-trip, MIN_YEAR maps to 0,
  pps scaling.
- `format.ts` — BC formatting, `c.` prefixes, ranges.
- `eras.ts` — `eraForYear` at every boundary year (inclusive start,
  exclusive end), MIN_YEAR, MAX_YEAR; assert eras tile the full range with
  no gaps/overlaps (loop over the array — this is the valuable test).
- `color.ts` — `shadeColor`, `contrastText`, `normalizeDynastyColor`
  produce valid hex and stay in clamped ranges.
- Event clustering — `clusterEvents` merges points closer than the gap and
  preserves counts.
- `urlState.ts` — parse/serialize round-trip, rejection of invalid input.
- Axis tick-step chooser — steps grow as pps shrinks; spacing ≥ the minimum.

Data sanity test (cheap, catches editing mistakes): every king's
`dynastyId` exists; every `startYear <= endYear`; no year 0 anywhere; every
event category is a known key.

## 4. README + meta

- `README.md` at repo root: hero screenshot or GIF (place under
  `docs/media/`, author records it manually — leave a TODO placeholder
  path), one-paragraph pitch, feature list (scroll/zoom timeline, era
  atmosphere, LOD rendering, bilingual EN/FA, virtualized SVG), tech stack,
  architecture sketch (viewport atoms → derived atoms → components),
  `npm run dev/build/test` instructions.
- `index.html`: real `<title>` ("Kings of Persia — 2,700 Years of Iranian
  History"), meta description, OG tags (`og:title`, `og:description`,
  `og:image` pointing at a `public/og.png` placeholder), theme-color,
  `lang="en"`. Favicon: simple SVG crown or 8-point star in `public/`
  (hand-write a small SVG, don't fetch one).
- Update `CLAUDE.md`: mark the roadmap items done, point to `docs/plan/`.

## 5. Capitals map — stretch goal (do last; skip if anything above is unfinished)

A `CapitalMap` inside the dynasty detail panel — deliberately abstract, no
map library, no external tiles:

- Fixed bounding box lng 40→70 E, lat 24→42 N, equirectangular:
  `x = (lng - 40) / 30 * W`, `y = (42 - lat) / 18 * H` (W≈300, H≈180).
- Backdrop: subtle grid lines every 5°, `color.line`; no coastlines.
- Plot **all** dynasty capitals as 2px dots in `inkFaint`; the selected
  dynasty's capital as a 5px dot in its color with the capital name labeled.
- Pure `projectCapital(lat, lng, w, h)` helper — add to the test suite.

## 6. Final QA gate

- [ ] `npm run build`, `npm run lint`, `npm run test` all green.
- [ ] Cold load with no params lands at the Median start, default zoom.
- [ ] Copying the URL mid-scroll and opening it in a new tab restores the
      exact view (year, zoom, open panel).
- [ ] Full keyboard-only session: tab to timeline, pan, zoom, open a king,
      read it, Esc, reach an event. No mouse needed.
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on the built preview
      (`npm run build && npm run preview`).
- [ ] README renders correctly on GitHub; index.html title/OG present.
