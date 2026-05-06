# Iranian Kings Timeline

Interactive horizontal SVG timeline visualising Iranian dynasties and kings from the Median Empire (-728) to the Pahlavi Dynasty (1979), with parallel rows for overlapping dynasties, an events ribbon, and a per-dynasty map panel.

## Stack

- Vite + React + TypeScript
- Plain CSS (no Tailwind/UnoCSS yet)
- Raw SVG (no chart libraries)
- No state library yet (useState/useContext only)

## Data

Three JSON files under `/src/data/`:

- `dynasties.json` (29 dynasties)
- `kings.json` (65 significant kings, not all kings)
- `events.json` (40 historical events across 3 categories: politics-wars, culture-religion, science)

Conventions:

- BCE years are negative integers. No year 0.
- `row` is 0-indexed lane assignment for parallel dynasties.
- Maps go in `/public/maps/[dynastyId].svg`, portraits in `/public/portraits/[kingId].webp`.
- `foreignRule: true` for non-Iranian-origin dynasties (Macedonian, Seleucid, Umayyad, Abbasid, Ilkhanate, Jalayirid).

## Layout (top to bottom)

1. Big sticky year ticker (updates with scroll)
2. 3 event rows
3. 5 dynasty rows (row 0 = main line; row 4 = Bavandid)
4. Map panel (per-dynasty, swaps based on scroll position)

## Visual concept

- **Dynasty bands**: coloured rectangles spanning each dynasty's full duration
- **Kings**: smaller rectangles rendered on top of dynasty bands, spanning each king's reign. Names shown on hover (later: portraits inside the rects)
- **Events**: always-visible labels on their category rows
- Background gradient shifts from warm earthy tones (pre-Islamic) to cooler Islamic palette around 651 CE
- Caliphates rendered with greyed/striped "foreign rule" treatment
- Alexander gets a fire/destruction visual motif

## Constants

- MIN_YEAR: -750, MAX_YEAR: 2000 (with padding)
- PIXELS_PER_YEAR: 3 (default zoom)
- ROW_HEIGHT: 60
- TOP_OFFSET: 80

## Plan (phased)

- **Phase 0** (done): Data files
- **Phase 1** (in progress): Timeline skeleton (dynasty bands, king rects)
- **Phase 2**: Horizontal scroll, zoom, drag scrubber, dynasty jump buttons
- **Phase 3**: Map panel that swaps per dynasty as user scrolls
- **Phase 4**: AI-generated coin/engraved-style portraits (SDXL via ComfyUI on local RTX 4060)
- **Phase 5**: Polish (typography, transitions, mobile pass)

## Decisions locked

- Linear time scaling with zoom (not logarithmic)
- Coin/engraved portrait style for consistency
- Mix of dry historical and punchy fact tone
- Includes any dynasty that ruled from Iranian soil
- Desktop first, mobile later
- ~3-5 kings per major dynasty, 1-2 per minor (not all kings)

## Interaction model (decided 2026-05-06)

The timeline uses a **playhead model**, not page scroll. A fixed vertical line in the viewport marks the active year; the timeline slides under it as the user scrubs. UX framing: this is a **story**, not a research tool — bias all UX calls toward narrative momentum over comparative analysis.

- **Primary state**: `activeYear` (number, can be fractional). Single source of truth. Everything is derived from it: timeline transform offset, year ticker, year axis labels, BG gradient (warm→cool around 651 CE), Alexander fire motif, caliphate greyed/striped treatment, map panel selection.
- **Architecture**: React state + SVG transform. Inner `<g>` shifts via `transform: translate(-offsetX, 0)` where `offsetX = yearToX(activeYear) - playheadViewportX`. **Not** native DOM scroll. Reason: the playhead model needs `activeYear` as the single state value driving every visual; native scroll puts the truth in the DOM and forces imperative sync.
- **Playhead position**: fixed vertical line at ~20–25% from left edge of viewport. Glows / has active treatment so user connects it to the corner year ticker. Left-offset (not centred) chosen because the project is narrative — reading-direction matches discovery direction, more upcoming content visible.
- **Wheel input**: scroll down = forward in time (timeline slides left). Wheel delta is **pixels** of intended timeline movement, then converted to year delta via current `pixelsPerYear`. Implication: scrub feel auto-adjusts with zoom — more zoom = finer scrubbing. Sensitivity to be tuned by feel after first build.
- **Clamping**: hard clamp at `MIN_YEAR` / `MAX_YEAR`. No void scrolling, no elastic bounce.
- **Coordinate math**: centralised in `yearToX(year, pixelsPerYear, …)` and `xToYear(x, pixelsPerYear, …)` helpers. **Do not** import `PIXELS_PER_YEAR` as a constant inside render code — pass scale in as a parameter. Reason: `pixelsPerYear` becomes runtime state at P2 (zoom). Writing render code against a parameter from day 1 means zoom requires zero refactor of render code.
- **Zoom invariant** (will land at P2): when user zooms, the year under the playhead must stay locked. This falls out for free if `activeYear` is the primary state — zoom only changes `pixelsPerYear`, render redraws, year stays fixed under the line.

## Open questions / WIP

Pending decisions to revisit when resuming. None block the next step (writing centralised coord helpers + the playhead-driven render skeleton); they can be settled as the relevant code lands.

- **State sharing pattern**: prop-drill `activeYear` from `App`, or use React Context? ~5 components read it. Lean: defer until prop-drilling actually feels painful. No state library yet (per Stack).
- **Wheel sensitivity value**: ship a starting default, then tune live by feel. Not a paper decision.
- **Year axis at bottom**: tick density per zoom level (decade / half-century / century thresholds). Render-time concern, decide while building.
- **Animation strategy** (P2+): for any moving SVG element, prefer CSS `transform` on a wrapping `<g>`, not animating SVG `x`/`y` attributes. Decide per feature.
- **Initial `activeYear` on load**: -728 (start) vs some "interesting" year vs persisted last position. Defer.
- **Horizontal scrollbar UI**: with the playhead model there is no native scrollbar. Decide later whether to add a custom drag-scrubber bar (was already planned for P2) and how it relates to the wheel.

## Resume context (for next session)

- Phase 1 (static skeleton) is in progress. The interaction-model decisions above land before the next code is written.
- **Tutor mode is active for this project**: the assistant teaches and refines ideas, the user writes the code. The assistant should not produce implementation code unless explicitly asked.
- Next concrete step on resume: design the `yearToX` / `xToYear` helpers and the top-level state shape, then build the playhead-driven render. Suggest discussing what data those helpers need to accept (year, pixelsPerYear, padding/offset, playhead viewport position) before code.
