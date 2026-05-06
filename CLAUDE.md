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
