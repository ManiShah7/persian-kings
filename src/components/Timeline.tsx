import {
  CATEGORY_META,
  CATEGORY_ORDER,
  EVENT_BAND_TOP,
  EVENT_LANE_HEIGHT,
  TIMELINE_HEIGHT,
  timelineWidth,
} from "../utils/constants";
import { useAtomValue } from "jotai";
import { ppsAtom, scrollXAtom, visibleRangeAtom } from "../state/atoms";
import { dynasties, kingsByDynasty } from "../data";
import DynastyBar from "./DynastyBar";
import Events from "./Events";

const Timeline = () => {
  const pps = useAtomValue(ppsAtom);
  const scrollX = useAtomValue(scrollXAtom);
  const { startYear, endYear } = useAtomValue(visibleRangeAtom);
  const width = timelineWidth(pps);

  const visibleDynasties = dynasties.filter(
    (d) => d.endYear >= startYear && d.startYear <= endYear,
  );

  return (
    <svg width={width} height={TIMELINE_HEIGHT} style={{ display: "block" }}>
      {visibleDynasties.map((dynasty) => (
        <DynastyBar
          key={dynasty.id}
          dynasty={dynasty}
          kings={kingsByDynasty.get(dynasty.id) ?? []}
        />
      ))}

      <Events />

      {/* Category labels pinned to the viewport's left edge. */}
      {CATEGORY_ORDER.map((category, i) => {
        const y = EVENT_BAND_TOP + i * EVENT_LANE_HEIGHT;
        return (
          <g key={category} transform={`translate(${scrollX},0)`}>
            <rect x={0} y={y - 13} width={150} height={22} rx={4} fill="white" opacity={0.85} />
            <text
              x={8}
              y={y}
              fontSize="12"
              fontWeight="600"
              fill={CATEGORY_META[category].color}
              dominantBaseline="middle"
            >
              {CATEGORY_META[category].label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default Timeline;
