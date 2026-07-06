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
import { color, font, radius, text } from "../theme/tokens";
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
      <defs>
        {/* Foreign-rule marker: shared diagonal hatch overlaid on the header. */}
        <pattern
          id="foreign-hatch"
          patternUnits="userSpaceOnUse"
          width={6}
          height={6}
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={6} stroke="rgba(0,0,0,0.28)" strokeWidth={2} />
        </pattern>
      </defs>

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
          <g key={category} transform={`translate(${scrollX + 12},0)`}>
            <rect
              x={0}
              y={y - 13}
              width={158}
              height={24}
              rx={radius.md}
              fill={color.panelBg}
              opacity={0.82}
              stroke={color.line}
            />
            <circle cx={14} cy={y - 1} r={4} fill={CATEGORY_META[category].color} />
            <text
              x={26}
              y={y}
              fontSize={text.sm}
              fontFamily={font.ui}
              fontWeight={600}
              fill={color.ink}
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
