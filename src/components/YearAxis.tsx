import { useAtomValue } from "jotai";
import { ppsAtom, visibleRangeAtom } from "../state/atoms";
import { AXIS_HEIGHT, HUD_HEIGHT, MAX_YEAR, MIN_YEAR, timelineWidth } from "../utils/constants";
import { yearToX } from "../utils/coords";
import { formatYear } from "../utils/format";
import { chooseTickStep } from "../utils/ticks";

const YearAxis = () => {
  const pps = useAtomValue(ppsAtom);
  const { startYear, endYear } = useAtomValue(visibleRangeAtom);
  const step = chooseTickStep(pps);
  const width = timelineWidth(pps);

  const first = Math.ceil(Math.max(MIN_YEAR, startYear) / step) * step;
  const last = Math.min(MAX_YEAR, endYear);
  const ticks: number[] = [];
  for (let year = first; year <= last; year += step) ticks.push(year);

  return (
    <svg
      className="year-axis"
      width={width}
      height={AXIS_HEIGHT}
      style={{ position: "absolute", top: HUD_HEIGHT, left: 0 }}
    >
      <line
        x1={0}
        x2={width}
        y1={AXIS_HEIGHT - 0.5}
        y2={AXIS_HEIGHT - 0.5}
        stroke="rgba(255,255,255,0.18)"
      />
      {ticks.map((year) => {
        const x = yearToX(year, pps);
        return (
          <g key={year}>
            <line
              x1={x}
              x2={x}
              y1={AXIS_HEIGHT - 8}
              y2={AXIS_HEIGHT}
              stroke="rgba(255,255,255,0.35)"
            />
            <text
              x={x}
              y={AXIS_HEIGHT - 14}
              textAnchor="middle"
              fontSize={11}
              fill="#c9c3b8"
            >
              {formatYear(year)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default YearAxis;
