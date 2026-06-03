import { atom } from "jotai";
import { MIN_YEAR } from "../utils/constants";

export const activeYearAtom = atom<number>(MIN_YEAR);
