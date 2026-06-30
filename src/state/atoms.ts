import { atom } from "jotai";
import { MIN_YEAR } from "../utils/constants";

export const activeYearAtom = atom<number>(MIN_YEAR);

export type Selection =
  | { kind: "dynasty"; id: string }
  | { kind: "king"; id: string }
  | { kind: "event"; id: string };

export const selectionAtom = atom<Selection | null>(null);
