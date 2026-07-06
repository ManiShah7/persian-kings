import dynastiesData from "./dynasties.json";
import kingsData from "./kings.json";
import eventsData from "./events.json";
import type { Dynasty } from "../types/Dynasty";
import type { King } from "../types/King";
import type { HistoricalEvent } from "../types/Event";

export const dynasties = dynastiesData as Dynasty[];
export const kings = kingsData as King[];
export const events = eventsData as HistoricalEvent[];

// Kings grouped by their dynasty, each list sorted chronologically.
export const kingsByDynasty: Map<string, King[]> = (() => {
  const map = new Map<string, King[]>();
  for (const king of kings) {
    const list = map.get(king.dynastyId);
    if (list) list.push(king);
    else map.set(king.dynastyId, [king]);
  }
  for (const list of map.values()) list.sort((a, b) => a.startYear - b.startYear);
  return map;
})();
