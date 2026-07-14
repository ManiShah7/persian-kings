import type { ReactNode } from "react";
import type { EraId } from "../types/Era";

export type EraMotif = {
  /** Tile size in px for patternUnits="userSpaceOnUse". */
  size: number;
  /** Stroke-only geometry drawn inside one tile. */
  body: ReactNode;
  /**
   * Optional per-era opacity override. Denser motifs are toned down so dynasty
   * bars and king labels stay legible over them; defaults to MOTIF_OPACITY.
   */
  opacity?: number;
};

/**
 * One motif per era, drawn from that era's architecture or craft.
 * Everything is stroke-only so the pattern can be tinted with the era accent
 * and faded as a whole. Shapes deliberately bleed past the tile edge where the
 * neighbouring tile completes them (corner roundels, girih points).
 *
 * Keyed off the EraId union so the compiler rejects any missing or unknown era.
 */
export const eraMotifs: Record<EraId, EraMotif> = {
  // Persepolis stepped merlons + fluted column shafts.
  achaemenid: {
    size: 40,
    body: (
      <>
        <path d="M0 40 V30 H8 V22 H14 V14 H26 V22 H32 V30 H40 V40" />
        <path d="M4 0 V12 M12 0 V12 M20 0 V12 M28 0 V12 M36 0 V12" />
        <path d="M0 12 H40" />
      </>
    ),
  },

  // Zagros rubble coursing: staggered stone joints.
  median: {
    size: 60,
    body: (
      <>
        <path d="M0 15 H60 M0 30 H60 M0 45 H60 M0 60 H60" />
        <path d="M10 0 V15 M35 0 V15" />
        <path d="M0 15 V30 M22 15 V30 M48 15 V30" />
        <path d="M14 30 V45 M40 30 V45" />
        <path d="M0 45 V60 M28 45 V60 M52 45 V60" />
      </>
    ),
  },

  // Greek meander (key pattern) for the Seleucid interlude.
  hellenistic: {
    size: 40,
    body: <path d="M0 20 H4 V4 H36 V36 H12 V12 H28 V28 H20" />,
  },

  // Hatra-style blind arcading with spandrel bosses.
  parthian: {
    size: 60,
    body: (
      <>
        <path d="M0 60 V30 A15 15 0 0 1 30 30 V60" />
        <path d="M30 60 V30 A15 15 0 0 1 60 30 V60" />
        <path d="M0 30 H60 M0 60 H60" />
        <circle cx="30" cy="22" r="3" />
        <circle cx="0" cy="22" r="3" />
        <circle cx="60" cy="22" r="3" />
      </>
    ),
  },

  // Taq Kasra parabolic iwan + Sasanian roundels at the tile corners.
  sasanian: {
    size: 80,
    body: (
      <>
        <path d="M8 80 V48 Q40 12 72 48 V80" />
        <path d="M18 80 V50 Q40 24 62 50 V80" />
        <circle cx="0" cy="0" r="9" />
        <circle cx="80" cy="0" r="9" />
        <circle cx="0" cy="0" r="4" />
        <circle cx="80" cy="0" r="4" />
      </>
    ),
  },

  // Austere rectilinear kufic band: the plainest motif of the twelve.
  conquest: {
    size: 60,
    body: (
      <>
        <path d="M0 10 H60 M0 50 H60" />
        <path d="M10 50 V22 H22 V38 H34 V22 H46 V50" />
      </>
    ),
  },

  // Samanid mausoleum basketweave brickwork. Dense grid, so toned down.
  intermezzo: {
    size: 40,
    opacity: 0.08,
    body: (
      <>
        <path d="M2 4 H18 M2 10 H18 M2 16 H18" />
        <path d="M24 2 V18 M30 2 V18 M36 2 V18" />
        <path d="M4 22 V38 M10 22 V38 M16 22 V38" />
        <path d="M22 24 H38 M22 30 H38 M22 36 H38" />
      </>
    ),
  },

  // Seljuk girih: eight-point star and cross.
  turkic: {
    size: 60,
    body: (
      <>
        <rect x="16" y="16" width="28" height="28" />
        <rect
          x="16"
          y="16"
          width="28"
          height="28"
          transform="rotate(45 30 30)"
        />
        <path d="M0 30 H10 M50 30 H60 M30 0 V10 M30 50 V60" />
        <path d="M0 0 l8 8 l-8 8 l-8 -8 Z" />
        <path d="M60 60 l8 8 l-8 8 l-8 -8 Z" />
      </>
    ),
  },

  // Timurid ribbed dome: radiating ribs under a shallow arc.
  mongol: {
    size: 80,
    body: (
      <>
        <path d="M4 46 Q40 -6 76 46" />
        <path d="M14 60 Q40 28 66 60" />
        <path d="M40 80 V10 M40 80 L14 22 M40 80 L66 22 M40 80 L4 46 M40 80 L76 46" />
      </>
    ),
  },

  // Safavid pointed arch flanked by arabesque scrollwork.
  safavid: {
    size: 60,
    body: (
      <>
        <path d="M10 60 V34 Q30 8 30 2 Q30 8 50 34 V60" />
        <path d="M0 20 q10 -14 20 -6 q-12 12 -20 6" />
        <path d="M60 20 q-10 -14 -20 -6 q12 12 20 6" />
        <path d="M0 60 H60" />
      </>
    ),
  },

  // Qajar aineh-kari: faceted mirrorwork. Busiest facet grid, so toned down.
  qajar: {
    size: 40,
    opacity: 0.08,
    body: (
      <>
        <path d="M20 0 L40 20 L20 40 L0 20 Z" />
        <path d="M0 20 H40 M20 0 V40" />
        <path d="M0 0 L20 0 L0 20 Z" />
        <path d="M40 0 L20 0 L40 20 Z" />
        <path d="M0 40 L20 40 L0 20 Z" />
        <path d="M40 40 L20 40 L40 20 Z" />
      </>
    ),
  },

  // Shahyad / Azadi tower parabola over deco rules.
  pahlavi: {
    size: 80,
    body: (
      <>
        <path d="M8 80 Q30 60 40 8 Q50 60 72 80" />
        <path d="M0 66 H80 M0 74 H80" />
      </>
    ),
  },
};
