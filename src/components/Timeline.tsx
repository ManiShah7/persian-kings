import dynastiesData from "../data/dynasties.json";
import kingsData from "../data/kings.json";
import type { Dynasty } from "../types/Dynasty";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  EVENT_BAND_TOP,
  EVENT_LANE_HEIGHT,
  ROW_HEIGHT,
  TIMELINE_HEIGHT,
  laneY,
  timelineWidth,
} from "../utils/constants";
import type { King } from "../types/King";
import { yearToX } from "../utils/coords";
import { useAtomValue, useSetAtom } from "jotai";
import { ppsAtom, scrollXAtom, selectionAtom, visibleRangeAtom } from "../state/atoms";
import { Fragment } from "react";
import Events from "./Events";

const dynasties = dynastiesData as Dynasty[];
const kings = kingsData as King[];

const Timeline = () => {
  const pps = useAtomValue(ppsAtom);
  const scrollX = useAtomValue(scrollXAtom);
  const { startYear, endYear } = useAtomValue(visibleRangeAtom);
  const setSelection = useSetAtom(selectionAtom);
  const width = timelineWidth(pps);

  const visibleDynasties = dynasties.filter(
    (d) => d.endYear >= startYear && d.startYear <= endYear,
  );

  return (
    <svg width={width} height={TIMELINE_HEIGHT} style={{ display: "block" }}>
      {visibleDynasties.map((dynasty) => {
        const y = laneY(dynasty.row);
        const x = yearToX(dynasty.startYear, pps);
        const w = yearToX(dynasty.endYear, pps) - x;
        const dynastyKings = kings
          .filter((king) => king.dynastyId === dynasty.id)
          .map((king) => king.name);
        return (
          <Fragment key={dynasty.id}>
            <rect
              onClick={() => setSelection({ kind: "dynasty", id: dynasty.id })}
              style={{ cursor: "pointer" }}
              x={x}
              y={y}
              width={w}
              height={ROW_HEIGHT - 4}
              rx={4}
              fill={dynasty.color}
            />
            <text
              x={x + w / 2}
              y={y + ROW_HEIGHT / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="black"
              fontSize="16"
              fontWeight="700"
              pointerEvents="none"
            >
              {dynastyKings.join(", ")}
            </text>
            <text
              x={x + w / 2}
              y={y + (ROW_HEIGHT + 8)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="black"
              fontSize="14"
              fontWeight="700"
              pointerEvents="none"
            >
              {dynasty.name}
            </text>
          </Fragment>
        );
      })}

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
