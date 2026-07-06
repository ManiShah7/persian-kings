import type { HistoricalEvent } from "../types/Event";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  EVENT_BAND_TOP,
  EVENT_CLUSTER_GAP,
  EVENT_CLUSTER_ZOOM,
  EVENT_LABEL_MIN_PPS,
  EVENT_LANE_HEIGHT,
  EVENT_STEM_HEIGHT,
  MAX_PPS,
  timelineWidth,
} from "../utils/constants";
import { color, font, text } from "../theme/tokens";
import { useAtomValue, useSetAtom } from "jotai";
import { ppsAtom, selectionAtom, tooltipAtom, visibleRangeAtom } from "../state/atoms";
import { events } from "../data";
import { clusterEvents } from "../utils/cluster";
import { formatYear } from "../utils/format";
import { useViewportApi } from "../state/viewportContext";

const laneY = (category: HistoricalEvent["category"]) =>
  EVENT_BAND_TOP + CATEGORY_ORDER.indexOf(category) * EVENT_LANE_HEIGHT;

const eventLines = (event: HistoricalEvent): string[] => [
  formatYear(event.year, event.yearApprox),
];

const Events = () => {
  const pps = useAtomValue(ppsAtom);
  const { startYear, endYear } = useAtomValue(visibleRangeAtom);
  const setSelection = useSetAtom(selectionAtom);
  const setTooltip = useSetAtom(tooltipAtom);
  const viewport = useViewportApi();
  const width = timelineWidth(pps);
  const showLabels = pps >= EVENT_LABEL_MIN_PPS;

  const visibleEvents = events.filter(
    (event) => event.year >= startYear && event.year <= endYear,
  );

  return (
    <g>
      {CATEGORY_ORDER.map((category) => (
        <line
          key={`lane-${category}`}
          x1={0}
          x2={width}
          y1={laneY(category)}
          y2={laneY(category)}
          stroke={CATEGORY_META[category].color}
          strokeOpacity={0.25}
        />
      ))}

      {CATEGORY_ORDER.map((category) => {
        const laneEvents = visibleEvents.filter((e) => e.category === category);
        const clusters = clusterEvents(laneEvents, pps, EVENT_CLUSTER_GAP);
        const y = laneY(category);
        const dotY = y - EVENT_STEM_HEIGHT;
        const cat = CATEGORY_META[category];

        return (
          <g key={`events-${category}`}>
            {clusters.map((cluster) => {
              if (cluster.events.length > 1) {
                return (
                  <g
                    key={`cluster-${category}-${cluster.year}`}
                    style={{ cursor: "zoom-in" }}
                    onClick={() =>
                      viewport?.zoomToYear(cluster.year, Math.min(pps * EVENT_CLUSTER_ZOOM, MAX_PPS))
                    }
                  >
                    <circle cx={cluster.x} cy={dotY} r={9} fill={cat.color} />
                    <text
                      x={cluster.x}
                      y={dotY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={9}
                      fontFamily={font.ui}
                      fontWeight={700}
                      fill="#fff"
                      pointerEvents="none"
                    >
                      {cluster.events.length}
                    </text>
                  </g>
                );
              }

              const event = cluster.events[0];
              const x = cluster.x;
              return (
                <g
                  key={event.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelection({ kind: "event", id: event.id })}
                  onPointerEnter={(e) =>
                    setTooltip({
                      content: { title: event.title, titleFa: event.titleFa, lines: eventLines(event) },
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onPointerMove={(e) =>
                    setTooltip({
                      content: { title: event.title, titleFa: event.titleFa, lines: eventLines(event) },
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onPointerLeave={() => setTooltip(null)}
                >
                  <line x1={x} x2={x} y1={y} y2={dotY} stroke={cat.color} />
                  <circle cx={x} cy={dotY} r={4} fill={cat.color} />
                  <circle cx={x} cy={dotY} r={10} fill="transparent" />
                  {showLabels && (
                    <text
                      x={x}
                      y={dotY - 8}
                      textAnchor="middle"
                      fontSize={text.xs}
                      fontFamily={font.ui}
                      fill={color.inkDim}
                      pointerEvents="none"
                    >
                      {event.title}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

export default Events;
