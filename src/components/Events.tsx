import eventsData from "../data/events.json";
import type { HistoricalEvent } from "../types/Event";
import {
  APP_WIDTH,
  CATEGORY_META,
  CATEGORY_ORDER,
  EVENT_BAND_TOP,
  EVENT_LANE_HEIGHT,
  EVENT_STEM_HEIGHT,
  PIXELS_PER_YEAR,
} from "../utils/constants";
import { yearToX } from "../utils/coords";
import { useSetAtom } from "jotai";
import { selectionAtom } from "../state/atoms";

const laneY = (category: HistoricalEvent["category"]) =>
  EVENT_BAND_TOP + CATEGORY_ORDER.indexOf(category) * EVENT_LANE_HEIGHT;

const Events = () => {
  const events: HistoricalEvent[] = eventsData as HistoricalEvent[];
  const setSelection = useSetAtom(selectionAtom);

  return (
    <g>
      {CATEGORY_ORDER.map((category) => (
        <line
          key={category}
          x1={0}
          x2={APP_WIDTH}
          y1={laneY(category)}
          y2={laneY(category)}
          stroke={CATEGORY_META[category].color}
          strokeOpacity={0.25}
        />
      ))}

      {events.map((event) => {
        const x = yearToX(event.year, PIXELS_PER_YEAR);
        const y = laneY(event.category);
        const color = CATEGORY_META[event.category].color;
        return (
          <g
            key={event.id}
            onClick={() => setSelection({ kind: "event", id: event.id })}
            style={{ cursor: "pointer" }}
          >
            <line
              x1={x}
              x2={x}
              y1={y}
              y2={y - EVENT_STEM_HEIGHT}
              stroke={color}
            />
            <circle cx={x} cy={y - EVENT_STEM_HEIGHT} r={4} fill={color} />
            <circle cx={x} cy={y - EVENT_STEM_HEIGHT} r={10} fill="transparent" />
            <text
              x={x + 8}
              y={y - EVENT_STEM_HEIGHT - 2}
              transform={`rotate(-40 ${x + 8} ${y - EVENT_STEM_HEIGHT - 2})`}
              fontSize="11"
              fill="#333"
            >
              {event.yearApprox ? `c. ${event.title}` : event.title}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default Events;
