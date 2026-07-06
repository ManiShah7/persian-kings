# Phase 3 — Eras & atmosphere (background + header HUD)

Requires Phase 1 (`centerYearAtom`). Independent of Phase 2.

## Goal

Make scrolling through time *feel* like passing through history: a
full-viewport background that **crossfades between era palettes** as the
centered year moves, and a proper header HUD (replacing the red placeholder)
showing the current year and era in English and Farsi.

## 1. Era config — `src/data/eras.ts`

New type in `src/types/Era.ts`:

```ts
export type Era = {
  id: string;
  name: string;       // "Age of the Achaemenids"
  nameFa: string;
  startYear: number;  // inclusive
  endYear: number;    // exclusive-ish; eras tile the full range with no gaps
  background: { from: string; to: string }; // vertical gradient stops
  accent: string;     // used by HUD underline / highlights
};
```

Eras tile `MIN_YEAR..MAX_YEAR` contiguously. Boundaries sit at the great
inflection points of Iranian history. Use exactly this list (colors are
dark, desaturated backdrops — dynasty bars must still pop on top):

| id | name | nameFa | years | from → to | accent |
|---|---|---|---|---|---|
| median | Rise of the Medes | برآمدن مادها | -728 → -550 | `#1a1410` → `#2b2118` | `#c08552` |
| achaemenid | The Achaemenid Empire | شاهنشاهی هخامنشی | -550 → -330 | `#1c160a` → `#332a12` | `#d4a935` |
| hellenistic | Hellenistic Interlude | دوران هلنی | -330 → -247 | `#131720` → `#232936` | `#8fa3bf` |
| parthian | The Parthian Era | دوران اشکانی | -247 → 224 | `#181410` → `#2e2418` | `#c8873c` |
| sasanian | The Sasanian Empire | شاهنشاهی ساسانی | 224 → 651 | `#1c0d10` → `#33161c` | `#d94f5c` |
| conquest | The Islamic Conquest | فتح اسلامی | 651 → 821 | `#121212` → `#242424` | `#9a9a9a` |
| intermezzo | The Iranian Intermezzo | میان‌پرده ایرانی | 821 → 1037 | `#0e1a17` → `#1c332c` | `#3fae8f` |
| turkic | Turks & the Seljuk Age | ترکان و سلجوقیان | 1037 → 1219 | `#0e141f` → `#1b2739` | `#4f83cc` |
| mongol | Mongol Storm & Timurids | یورش مغول و تیموریان | 1219 → 1501 | `#16121c` → `#251d31` | `#8f6fc2` |
| safavid | The Safavid Revival | شکوه صفوی | 1501 → 1789 | `#0c1710` → `#17301f` | `#3f9e5f` |
| qajar | Qajar Iran | ایران قاجار | 1789 → 1925 | `#171020` → `#2a1d3a` | `#b06ab3` |
| pahlavi | The Pahlavi Century | سده پهلوی | 1925 → 1979 | `#0d1220` → `#182340` | `#5b7fd4` |

Export `eras: Era[]` and a resolver:

```ts
export const eraForYear = (year: number): Era =>
  eras.find((e) => year >= e.startYear && year < e.endYear) ?? eras[eras.length - 1];
```

(Keep `eraForYear` pure — Phase 5 unit-tests it.)

## 2. Derived atom

In `atoms.ts`:

```ts
export const currentEraAtom = atom((get) => eraForYear(get(centerYearAtom)));
```

## 3. Background — `src/components/EraBackground.tsx`

- `position: fixed; inset: 0; z-index: -1;` behind everything.
- **Two stacked gradient layers to crossfade** (CSS can't transition
  `background-image`): keep the previous era's gradient on layer A, the
  current era's on layer B, and transition layer B's `opacity` 0 → 1 over
  ~800ms `ease`; when it finishes (or on next era change), promote B to A.
  A small `usePrevious`-style state inside the component is enough.
- Gradient: `linear-gradient(180deg, from, to)`.
- Respect `prefers-reduced-motion: reduce` → swap instantly (no transition).
- Render it in `App.tsx` (outside the scroll container).
- Set page text defaults to light (`index.css`: `body { color: #e8e4dc; }`)
  since backgrounds are now dark. Timeline lane text that was `fill="black"`
  needs flipping to light where it sits on the dark background (axis labels,
  category labels). Text *inside* colored bars can stay dark/white per
  contrast. Don't fully restyle — Phase 4 does that; just keep everything
  legible.

## 4. Header HUD — replace the red div in `App.tsx`

New `src/components/HeaderHUD.tsx`, fixed at top, full width:

- Left: app title, e.g. **"Kings of Persia"** small caps / spaced uppercase.
- Center: the current year, large (`formatYear(centerYear)`), with era name
  under it in English and, `dir="rtl"`, in Farsi (`era.nameFa`).
- A 2–3px underline / accent rule in `era.accent` that (with the era name)
  crossfades on era change (CSS `transition: color, border-color 400ms`).
- Style: translucent dark bar, `backdrop-filter: blur(8px)`,
  `background: rgba(10,10,12,0.55)`, subtle bottom border
  `1px solid rgba(255,255,255,0.08)`. No red anywhere.
- The scroll content needs top padding = HUD height so bars aren't hidden
  under it. Put `HUD_HEIGHT` in `constants.ts`.

## 5. (Stretch — skip if time-boxed) Parallax motif

A fixed SVG layer between background and timeline with a faint repeating
Persian geometric pattern (simple 8-point star tile drawn as SVG paths,
`opacity: 0.04`), translated by `-scrollX * 0.15` so it drifts slower than
the content. Skip entirely under `prefers-reduced-motion`.

## Acceptance

- [ ] Build + lint pass.
- [ ] Scrolling from -728 to 1979 passes through all 12 era backdrops; each
      transition is a smooth ~0.8s crossfade with no flash of white.
- [ ] Fast scrubbing (grab the scrollbar, drag end to end) doesn't error or
      strobe — transitions interrupt cleanly.
- [ ] HUD shows correct year + era at several spot-check years:
      -400 → Achaemenid; 700 → Islamic Conquest; 1000 → Iranian Intermezzo;
      1300 → Mongol; 1600 → Safavid; 1950 → Pahlavi.
- [ ] Farsi era name renders RTL correctly.
- [ ] With `prefers-reduced-motion: reduce` emulated in devtools, era
      changes are instant.
- [ ] All text on screen remains legible on the dark backgrounds.
