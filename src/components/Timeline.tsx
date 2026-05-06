import { Fragment } from "react/jsx-runtime";
import dynastiesData from "../data/dynasties.json";
import kingsData from "../data/kings.json";
import type { Dynasty } from "../types/Dynasty";
import {
  MAX_YEAR,
  MIN_YEAR,
  PIXELS_PER_YEAR,
  ROW_HEIGHT,
  TOP_OFFSET,
} from "../utils/constants";
import type { King } from "../types/King";

const Timeline = () => {
  const dynasties: Dynasty[] = dynastiesData;
  const kings: King[] = kingsData;

  const svgWidth = (Math.abs(MIN_YEAR) + MAX_YEAR) * PIXELS_PER_YEAR;
  const svgHeight =
    ROW_HEIGHT +
    (TOP_OFFSET * Math.max(...dynasties.map((d) => d.row)) * ROW_HEIGHT) / 30;

  return (
    <div
      style={{ overflow: "auto", border: "1px solid #ccc", padding: "50px 0" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {dynasties.map((dynasty) => {
          const y = (TOP_OFFSET * dynasty.row * ROW_HEIGHT) / 30;
          const x = (dynasty.startYear - MIN_YEAR) * PIXELS_PER_YEAR;
          const width = (dynasty.endYear - dynasty.startYear) * PIXELS_PER_YEAR;
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
      </svg>
    </div>
  );
};

export default Timeline;
