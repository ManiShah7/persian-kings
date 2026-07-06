import type { HistoricalEvent } from "../types/Event";
import { yearToX } from "./coords";

export type EventCluster = {
  x: number; // px position of the cluster's anchor (its first event)
  year: number; // anchor year
  events: HistoricalEvent[];
};

/**
 * Greedily groups events (assumed to share a lane) whose on-screen positions
 * are closer than `minGapPx`. Adjacent events within the gap merge into one
 * cluster; the cluster anchors at its first (earliest) event.
 */
export const clusterEvents = (
  events: HistoricalEvent[],
  pps: number,
  minGapPx: number,
): EventCluster[] => {
  const sorted = [...events].sort((a, b) => a.year - b.year);
  const clusters: EventCluster[] = [];
  let prevX = -Infinity;
  for (const event of sorted) {
    const x = yearToX(event.year, pps);
    const current = clusters[clusters.length - 1];
    if (current && x - prevX < minGapPx) {
      current.events.push(event);
    } else {
      clusters.push({ x, year: event.year, events: [event] });
    }
    prevX = x;
  }
  return clusters;
};
