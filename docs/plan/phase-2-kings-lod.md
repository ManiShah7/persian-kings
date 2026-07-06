# Phase 2 — Kings as first-class elements + level-of-detail

Requires Phase 1 (viewport atoms, virtualization).

## Goal

Kings currently appear only as a comma-joined string inside the dynasty
label. Render each king as an individual, clickable **reign segment** nested
inside its dynasty's bar, with **level-of-detail (LOD)**: zooming out shows
clean dynasty bars; zooming in progressively reveals king segments, then king
names. This is what makes zoom feel meaningful.

## Bar anatomy

Each dynasty lane (height `ROW_HEIGHT`, currently 60 — raise to 64 if
needed) splits into:

```
┌──────────────────────────────────────────────┐
│  DYNASTY NAME            ← header strip, ~22px, solid dynasty color
├────────┬─────────┬───────┬───────────────────┤
│ king 1 │ king 2  │ king3 │ ...               ← reign strip, remaining height
└────────┴─────────┴───────┴───────────────────┘
```

- **Dynasty container**: one `<rect>` spanning the dynasty's full range,
  `rx={4}`, fill = dynasty color at low opacity (~0.18), plus a solid
  header strip rect on top in the dynasty color. Clicking anywhere that is
  *not* a king segment selects the dynasty (existing behavior).
- **King segments**: one `<rect>` per king inside the reign strip,
  `x = yearToX(king.startYear, pps)`, width from start/end years. Fill:
  alternate two shades derived from the dynasty color so adjacent reigns are
  distinguishable — implement `shadeColor(hex: string, amount: number)` in a
  new `src/utils/color.ts` (parse hex, lighten/darken in RGB; no library).
  Alternate `shadeColor(c, +18)` / `shadeColor(c, -8)` by index. 1px gap
  between segments.
- Kings whose reigns fall outside their dynasty's bar or overlap each other
  (co-regencies / data quirks): render them anyway in data order; overlaps
  may visually stack — acceptable, do not build overlap resolution.

## Level of detail

Drive everything off `ppsAtom` and per-element pixel width:

| Condition | Show |
|---|---|
| always | dynasty container + dynasty name |
| `pps >= 1.2` | king segments (no text) |
| segment pixel width `>= 70` | king name inside segment |
| segment pixel width `>= 130` | king name + reign range (`formatRange`) |

- King name text: `fontSize 11`, truncate to fit: estimate
  `maxChars = floor((segWidth - 12) / 6.5)`; if the name is longer, slice and
  append `…`. Strip parentheticals first (e.g. "Cyrus II (the Great)" →
  "Cyrus II") when space is tight.
- Transitions between LOD levels should not animate — just mount/unmount.
  (Zoom already provides continuity.)

## Sticky dynasty labels

When a long dynasty (Abbasid: 508 years) fills more than the viewport, its
centered label scrolls off. Pin the dynasty name to the visible part of its
bar:

```ts
const labelX = clamp(
  scrollX + 12,                        // stick to viewport left edge + pad
  barX + 8,                            // never before the bar starts
  barX + barWidth - labelWidth - 8,    // never past the bar end
);
```

`labelWidth` can be estimated as `name.length * 7.5`. Read `scrollXAtom` for
this. Text in the header strip: `fontSize 12`, `fontWeight 700`, white,
`textAnchor="start"`. If the bar is too narrow for the name at current zoom
(barWidth < ~40px), render no text; between 40px and the full name width,
truncate with `…` like king names.

## Interaction

- King segment: `cursor: pointer`, `onClick` →
  `setSelection({ kind: "king", id: king.id })` (DetailPanel already handles
  it). Stop propagation so the dynasty click underneath doesn't also fire.
- Hover: brighten the segment (swap fill to `shadeColor(c, +30)` via
  CSS `:hover` on a class, or `onPointerEnter` state — prefer a CSS class in
  `index.css`, SVG rects accept `class` + `fill` via CSS).
- Add `<title>{king.name}, {formatRange(...)}</title>` inside each king
  segment group for native tooltips (placeholder until Phase 4).

## Structure

- New component `src/components/DynastyBar.tsx` — renders one dynasty
  container + its kings. `Timeline.tsx` maps visible dynasties to
  `<DynastyBar dynasty={d} kings={kingsByDynasty[d.id]} />`.
- Build `kingsByDynasty` once at module level (plain
  `Map<string, King[]>` from `kings.json`, sorted by `startYear`) in a new
  `src/data/index.ts` that also exports typed `dynasties`, `kings`, `events`
  arrays — so components stop re-casting JSON imports individually.
- Memoize `DynastyBar` (`React.memo`) — it only depends on its props + the
  atoms it reads.

## Acceptance

- [ ] Build + lint pass.
- [ ] Zoomed out (pps ≈ 0.5): only dynasty bars with names; no king noise.
- [ ] Default zoom (pps = 3): king segments visible; wide reigns
      (Shapur II, 70 years) show names.
- [ ] Zoomed in (pps ≥ 10): nearly all kings show names; long reigns show
      name + years.
- [ ] Clicking a king opens the king detail panel; clicking dynasty header
      opens the dynasty panel; clicks don't double-fire.
- [ ] Scroll inside the Abbasid dynasty: its label stays visible, pinned to
      the viewport edge, and never escapes the bar.
- [ ] All 65 kings reachable (spot-check first/last per dynasty).
