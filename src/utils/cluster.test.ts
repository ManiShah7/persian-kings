import { describe, expect, it } from "vitest";
import { clusterEvents } from "./cluster";
import { yearToX } from "./coords";
import type { HistoricalEvent } from "../types/Event";

const ev = (id: string, year: number): HistoricalEvent => ({
  id,
  year,
  yearApprox: false,
  category: "politics-wars",
  title: id,
  titleFa: id,
  fact: "",
});

describe("clusterEvents", () => {
  it("merges points closer than the gap and preserves every event", () => {
    const events = [ev("a", 0), ev("b", 2), ev("c", 100)];
    // pps=1 → a,b are 2px apart (< 16 gap) and merge; c stands alone.
    const clusters = clusterEvents(events, 1, 16);
    expect(clusters).toHaveLength(2);
    expect(clusters[0].events.map((e) => e.id)).toEqual(["a", "b"]);
    expect(clusters[1].events.map((e) => e.id)).toEqual(["c"]);
    const total = clusters.reduce((n, c) => n + c.events.length, 0);
    expect(total).toBe(events.length);
  });

  it("separates all points once zoomed in enough", () => {
    const events = [ev("a", 0), ev("b", 2), ev("c", 100)];
    const clusters = clusterEvents(events, 20, 16); // 2px * 20pps = 40px apart
    expect(clusters).toHaveLength(3);
  });

  it("anchors a cluster at its earliest event", () => {
    const [cluster] = clusterEvents([ev("late", 5), ev("early", 0)], 1, 16);
    expect(cluster.year).toBe(0);
    expect(cluster.x).toBe(yearToX(0, 1));
  });
});
