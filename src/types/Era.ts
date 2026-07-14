// The full set of era ids, in chronological order. Keying maps off this union
// (rather than `string`) makes coverage a compile-time guarantee: a new era
// can't be added without a matching motif, background, etc.
export type EraId =
  | "median"
  | "achaemenid"
  | "hellenistic"
  | "parthian"
  | "sasanian"
  | "conquest"
  | "intermezzo"
  | "turkic"
  | "mongol"
  | "safavid"
  | "qajar"
  | "pahlavi";

export type Era = {
  id: EraId;
  name: string; // e.g. "The Achaemenid Empire"
  nameFa: string;
  startYear: number; // inclusive
  endYear: number; // exclusive — eras tile the full range with no gaps
  background: { from: string; to: string }; // vertical gradient stops
  accent: string; // HUD underline / highlight color
};
