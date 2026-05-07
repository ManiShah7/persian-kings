import { Fragment } from "react/jsx-runtime";
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

const Timeline = () => {
  const dynasties: Dynasty[] = dynastiesData;
  const kings: King[] = kingsData;

  const svgHeight = (TOP_OFFSET * NUM_DYNASTY_ROWS * ROW_HEIGHT) / 30;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={APP_WIDTH}
      height={svgHeight}
      viewBox={`0 0 ${APP_WIDTH} ${svgHeight}`}
    >
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
    </svg>
  );
};

export default Timeline;
