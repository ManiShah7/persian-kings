import dynastiesData from "../data/dynasties.json";
import kingsData from "../data/kings.json";
import type { Dynasty } from "../types/Dynasty";
import {
  APP_WIDTH,
  NUM_DYNASTY_ROWS,
  PIXELS_PER_YEAR,
  ROW_HEIGHT,
  TOP_OFFSET,
} from "../utils/constants";
import type { King } from "../types/King";
import { yearToX } from "../utils/coords";
import { useAtomValue } from "jotai";
import { activeYearAtom } from "../state/atoms";
import { Fragment } from "react";

const Timeline = () => {
  const dynasties: Dynasty[] = dynastiesData;
  const kings: King[] = kingsData;

  const svgHeight = (TOP_OFFSET * NUM_DYNASTY_ROWS * ROW_HEIGHT) / 30;

  const activeYear = useAtomValue(activeYearAtom);

  const playheadX = 300;

  const maxOffset = APP_WIDTH - window.innerWidth;
  const svgOffsetX = Math.min(
    Math.max(0, yearToX(activeYear, PIXELS_PER_YEAR) - playheadX),
    maxOffset,
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={window.innerWidth}
      height={svgHeight}
      viewBox={`0 0 ${window.innerWidth} ${svgHeight}`}
    >
      <g transform={`translate(${-svgOffsetX},0)`}>
        {dynasties.map((dynasty) => {
          const y = (TOP_OFFSET * dynasty.row * ROW_HEIGHT) / 30;
          const x = yearToX(dynasty.startYear, PIXELS_PER_YEAR);
          const width =
            yearToX(dynasty.endYear, PIXELS_PER_YEAR) -
            yearToX(dynasty.startYear, PIXELS_PER_YEAR);
          const dynastyKings = kings
            .filter((king) => king.dynastyId === dynasty.id)
            .map((king) => king.name);
          return (
            <Fragment key={dynasty.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={ROW_HEIGHT - 4}
                fill={dynasty.color}
              />
              <text
                x={x + width / 2}
                y={y + ROW_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="black"
                fontSize="16"
                fontWeight="700"
              >
                {dynastyKings.join(", ")}
              </text>
              <text
                x={x + width / 2}
                y={y + (ROW_HEIGHT + 8)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="black"
                fontSize="16"
                fontWeight="700"
              >
                {dynasty.name}
              </text>
            </Fragment>
          );
        })}
      </g>
    </svg>
  );
};

export default Timeline;
