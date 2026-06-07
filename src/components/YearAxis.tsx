import { useAtom } from "jotai";
import {
  APP_WIDTH,
  MAX_YEAR,
  MIN_YEAR,
  PIXELS_PER_YEAR,
} from "../utils/constants";
import { xToYear, yearToX } from "../utils/coords";
import { activeYearAtom } from "../state/atoms";
import YearTick from "./YearTick";

const YearAxis = () => {
  const yearStep = 100;
  const lastTick = Math.trunc(MAX_YEAR / 100) * 100;
  const firstTick = Math.trunc(MIN_YEAR / 100) * 100;
  const totalYears = Math.round((lastTick - firstTick) / yearStep + 1);
  const firstYearX = yearToX(MIN_YEAR, PIXELS_PER_YEAR);
  const lastYearX = yearToX(MAX_YEAR, PIXELS_PER_YEAR);

  const [activeYear, setActiveYear] = useAtom(activeYearAtom);

  const ticks = Array.from({ length: totalYears }, (_, i) => {
    const year = firstTick + i * yearStep;
    return { year, x: yearToX(year, PIXELS_PER_YEAR) };
  });

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = xToYear(Number(e.target.value), PIXELS_PER_YEAR);

    setActiveYear(Math.round(year));
  };

  const playheadX = 300;

  const maxOffset = APP_WIDTH - window.innerWidth;
  const svgOffsetX = Math.min(
    Math.max(0, yearToX(activeYear, PIXELS_PER_YEAR) - playheadX),
    maxOffset,
  );

  return (
    <>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "40px",
        }}
      >
        <div
          style={{
            transform: `translate(${-svgOffsetX}px)`,
            width: `${APP_WIDTH}px`,

            backgroundColor: "black",
            height: "1px",
            marginTop: "5px",
          }}
        >
          {activeYear}

          <YearTick x={firstYearX} year={MIN_YEAR} />

          {ticks.map((tick) => (
            <YearTick key={tick.year} x={tick.x} year={tick.year} />
          ))}

          <YearTick x={lastYearX} year={MAX_YEAR} />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          marginTop: "50px",
        }}
      >
        <input
          type="range"
          min={firstYearX}
          max={lastYearX}
          value={yearToX(activeYear, PIXELS_PER_YEAR)}
          style={{ width: "100%", marginTop: "20px" }}
          onChange={handleRangeChange}
        />
      </div>
    </>
  );
};

export default YearAxis;
