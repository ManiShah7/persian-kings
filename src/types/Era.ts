export type Era = {
  id: string;
  name: string; // e.g. "The Achaemenid Empire"
  nameFa: string;
  startYear: number; // inclusive
  endYear: number; // exclusive — eras tile the full range with no gaps
  background: { from: string; to: string }; // vertical gradient stops
  accent: string; // HUD underline / highlight color
};
