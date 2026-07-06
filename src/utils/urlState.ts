import { MAX_PPS, MAX_YEAR, MIN_PPS, MIN_YEAR } from "./constants";
import { clamp } from "./clamp";
import type { Selection } from "../state/atoms";

export type ViewParams = {
  year?: number;
  pps?: number;
  sel?: Selection;
};

const SELECTION_KINDS = ["dynasty", "king", "event"] as const;

const isKind = (v: string): v is Selection["kind"] =>
  (SELECTION_KINDS as readonly string[]).includes(v);

/**
 * Parse `?year=&pps=&sel=` into validated view params. Range-checks year and
 * pps; selection ids are shape-validated here but existence-checked by the
 * caller against the dataset.
 */
export const parseViewParams = (search: string): ViewParams => {
  const params = new URLSearchParams(search);
  const out: ViewParams = {};

  const yearRaw = params.get("year");
  if (yearRaw !== null) {
    const year = Number(yearRaw);
    if (Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR) {
      out.year = year;
    }
  }

  const ppsRaw = params.get("pps");
  if (ppsRaw !== null) {
    const pps = Number(ppsRaw);
    if (Number.isFinite(pps) && pps > 0) {
      out.pps = clamp(pps, MIN_PPS, MAX_PPS);
    }
  }

  const selRaw = params.get("sel");
  if (selRaw) {
    const idx = selRaw.indexOf(":");
    if (idx > 0) {
      const kind = selRaw.slice(0, idx);
      const id = selRaw.slice(idx + 1);
      if (isKind(kind) && id) out.sel = { kind, id };
    }
  }

  return out;
};

/** Serialize the current view into a query string (no leading `?`). */
export const serializeViewParams = (
  year: number,
  pps: number,
  sel: Selection | null,
): string => {
  const params = new URLSearchParams();
  params.set("year", String(Math.round(year)));
  params.set("pps", String(Number(pps.toFixed(3))));
  if (sel) params.set("sel", `${sel.kind}:${sel.id}`);
  return params.toString();
};
