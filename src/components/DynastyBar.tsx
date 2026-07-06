import { memo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { Dynasty } from "../types/Dynasty";
import type { King } from "../types/King";
import { ppsAtom, scrollXAtom, selectionAtom } from "../state/atoms";
import {
  DYNASTY_HEADER_HEIGHT,
  KING_NAME_MIN_WIDTH,
  KING_RANGE_MIN_WIDTH,
  KING_SEGMENTS_MIN_PPS,
  ROW_HEIGHT,
  laneY,
} from "../utils/constants";
import { yearToX } from "../utils/coords";
import { clamp } from "../utils/clamp";
import { shadeColor } from "../utils/color";
import { formatRange } from "../utils/format";

const CONTAINER_HEIGHT = ROW_HEIGHT - 4;
const REIGN_STRIP_HEIGHT = CONTAINER_HEIGHT - DYNASTY_HEADER_HEIGHT;
const SEGMENT_GAP = 1;
const KING_CHAR_PX = 6.5; // approx glyph advance at king-name font size
const LABEL_CHAR_PX = 7.5; // approx glyph advance at header-label font size

const stripParentheticals = (name: string): string =>
  name.replace(/\s*\([^)]*\)/g, "").trim();

// Fit a king name into `availWidth` px, stripping parentheticals before
// truncating with an ellipsis.
const fitKingName = (name: string, availWidth: number): string => {
  const maxChars = Math.floor((availWidth - 12) / KING_CHAR_PX);
  if (maxChars <= 0) return "";
  if (name.length <= maxChars) return name;
  const stripped = stripParentheticals(name);
  if (stripped.length <= maxChars) return stripped;
  return stripped.slice(0, Math.max(1, maxChars - 1)) + "…";
};

const fitHeaderLabel = (name: string, barWidth: number): string => {
  const maxChars = Math.floor((barWidth - 16) / LABEL_CHAR_PX);
  if (name.length <= maxChars) return name;
  return name.slice(0, Math.max(1, maxChars - 1)) + "…";
};

type Props = { dynasty: Dynasty; kings: King[] };

const DynastyBar = memo(({ dynasty, kings }: Props) => {
  const pps = useAtomValue(ppsAtom);
  const scrollX = useAtomValue(scrollXAtom);
  const setSelection = useSetAtom(selectionAtom);

  const y = laneY(dynasty.row);
  const barX = yearToX(dynasty.startYear, pps);
  const barWidth = yearToX(dynasty.endYear, pps) - barX;
  const color = dynasty.color;

  const reignStripY = y + DYNASTY_HEADER_HEIGHT;
  const showSegments = pps >= KING_SEGMENTS_MIN_PPS;

  // Sticky header label: pinned to the viewport-left edge but never escaping
  // the bar's own span.
  const labelWidth = dynasty.name.length * LABEL_CHAR_PX;
  const labelX = clamp(scrollX + 12, barX + 8, barX + barWidth - labelWidth - 8);
  const headerLabel = barWidth < 40 ? "" : fitHeaderLabel(dynasty.name, barWidth);

  const selectDynasty = () => setSelection({ kind: "dynasty", id: dynasty.id });

  return (
    <g>
      <rect
        x={barX}
        y={y}
        width={barWidth}
        height={CONTAINER_HEIGHT}
        rx={4}
        fill={color}
        fillOpacity={0.18}
        onClick={selectDynasty}
        style={{ cursor: "pointer" }}
      />
      <rect
        x={barX}
        y={y}
        width={barWidth}
        height={DYNASTY_HEADER_HEIGHT}
        rx={4}
        fill={color}
        onClick={selectDynasty}
        style={{ cursor: "pointer" }}
      />

      {showSegments &&
        kings.map((king, i) => {
          const kx = yearToX(king.startYear, pps);
          const kw = yearToX(king.endYear, pps) - kx - SEGMENT_GAP;
          if (kw <= 0) return null;
          const fill = i % 2 === 0 ? shadeColor(color, 18) : shadeColor(color, -8);
          const showName = kw >= KING_NAME_MIN_WIDTH;
          const showRange = kw >= KING_RANGE_MIN_WIDTH;
          const label = showName ? fitKingName(king.name, kw) : "";
          const range = formatRange(
            king.startYear,
            king.endYear,
            king.startYearApprox,
            king.endYearApprox,
          );
          return (
            <g
              key={king.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelection({ kind: "king", id: king.id });
              }}
              style={{ cursor: "pointer" }}
            >
              <title>{`${king.name}, ${range}`}</title>
              <rect
                className="king-segment"
                x={kx}
                y={reignStripY + 1}
                width={kw}
                height={REIGN_STRIP_HEIGHT - 2}
                rx={2}
                fill={fill}
              />
              {label && (
                <text
                  x={kx + 6}
                  y={reignStripY + (showRange ? REIGN_STRIP_HEIGHT / 2 - 4 : REIGN_STRIP_HEIGHT / 2)}
                  fontSize={11}
                  fill="rgba(0,0,0,0.78)"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {label}
                </text>
              )}
              {showRange && (
                <text
                  x={kx + 6}
                  y={reignStripY + REIGN_STRIP_HEIGHT / 2 + 9}
                  fontSize={9}
                  fill="rgba(0,0,0,0.6)"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {range}
                </text>
              )}
            </g>
          );
        })}

      {headerLabel && (
        <text
          x={labelX}
          y={y + DYNASTY_HEADER_HEIGHT / 2}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={12}
          fontWeight={700}
          fill="#fff"
          pointerEvents="none"
        >
          {headerLabel}
        </text>
      )}
    </g>
  );
});

DynastyBar.displayName = "DynastyBar";

export default DynastyBar;
