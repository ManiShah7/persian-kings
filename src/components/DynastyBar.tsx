import { memo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { Dynasty } from "../types/Dynasty";
import type { King } from "../types/King";
import {
  ppsAtom,
  scrollXAtom,
  selectionAtom,
  tooltipAtom,
  viewportWidthAtom,
} from "../state/atoms";
import {
  DYNASTY_HEADER_HEIGHT,
  KING_NAME_MIN_WIDTH,
  KING_RANGE_MIN_WIDTH,
  KING_SEGMENTS_MIN_PPS,
  ROW_HEIGHT,
  laneY,
} from "../utils/constants";
import { color, font } from "../theme/tokens";
import { yearToX } from "../utils/coords";
import { clamp } from "../utils/clamp";
import { contrastText, normalizeDynastyColor, shadeColor } from "../utils/color";
import { formatRange } from "../utils/format";
import { onActivate } from "../utils/a11y";

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

const firstWords = (sentence: string, count: number): string => {
  const words = sentence.split(/\s+/).slice(0, count);
  return words.join(" ") + (sentence.split(/\s+/).length > count ? "…" : "");
};

type Props = { dynasty: Dynasty; kings: King[] };

const DynastyBar = memo(({ dynasty, kings }: Props) => {
  const pps = useAtomValue(ppsAtom);
  const scrollX = useAtomValue(scrollXAtom);
  const gutter = useAtomValue(viewportWidthAtom) / 2;
  const setSelection = useSetAtom(selectionAtom);
  const setTooltip = useSetAtom(tooltipAtom);

  const y = laneY(dynasty.row);
  const barX = yearToX(dynasty.startYear, pps);
  const barWidth = yearToX(dynasty.endYear, pps) - barX;
  const baseColor = normalizeDynastyColor(dynasty.color);

  const reignStripY = y + DYNASTY_HEADER_HEIGHT;
  const showSegments = pps >= KING_SEGMENTS_MIN_PPS;

  // Sticky header label pinned to the viewport-left edge, clamped to the bar.
  // scrollX - gutter is the SVG-internal x sitting at the viewport's left edge.
  const headerLabel = barWidth < 40 ? "" : fitHeaderLabel(dynasty.name, barWidth);
  // Width of the *rendered* (possibly truncated) label, so the right-hand clamp
  // bound never crosses the left one and shoves the label off its bar.
  const labelWidth = headerLabel.length * LABEL_CHAR_PX;
  const labelX = clamp(scrollX - gutter + 12, barX + 8, barX + barWidth - labelWidth - 8);

  const selectDynasty = () => setSelection({ kind: "dynasty", id: dynasty.id });

  return (
    <g>
      <rect
        x={barX}
        y={y}
        width={barWidth}
        height={CONTAINER_HEIGHT}
        rx={4}
        fill={baseColor}
        fillOpacity={0.18}
        stroke={dynasty.foreignRule ? baseColor : "none"}
        strokeDasharray={dynasty.foreignRule ? "4 3" : undefined}
        strokeWidth={dynasty.foreignRule ? 1 : undefined}
        onClick={selectDynasty}
        style={{ cursor: "pointer" }}
      />
      <rect
        className="timeline-focusable"
        x={barX}
        y={y}
        width={barWidth}
        height={DYNASTY_HEADER_HEIGHT}
        rx={4}
        fill={baseColor}
        onClick={selectDynasty}
        onKeyDown={onActivate(selectDynasty)}
        tabIndex={0}
        role="button"
        aria-label={`${dynasty.name}${dynasty.foreignRule ? ", foreign rule" : ""}, ${formatRange(
          dynasty.startYear,
          dynasty.endYear,
          dynasty.startYearApprox,
          dynasty.endYearApprox,
        )}`}
        style={{ cursor: "pointer" }}
      />
      {dynasty.foreignRule && (
        <rect
          x={barX}
          y={y}
          width={barWidth}
          height={DYNASTY_HEADER_HEIGHT}
          rx={4}
          fill="url(#foreign-hatch)"
          pointerEvents="none"
        />
      )}

      {showSegments &&
        kings.map((king, i) => {
          const kx = yearToX(king.startYear, pps);
          const kw = yearToX(king.endYear, pps) - kx - SEGMENT_GAP;
          if (kw <= 0) return null;
          const fill = i % 2 === 0 ? shadeColor(baseColor, 18) : shadeColor(baseColor, -8);
          const textColor = contrastText(fill);
          const showName = kw >= KING_NAME_MIN_WIDTH;
          const showRange = kw >= KING_RANGE_MIN_WIDTH;
          const label = showName ? fitKingName(king.name, kw) : "";
          const range = formatRange(
            king.startYear,
            king.endYear,
            king.startYearApprox,
            king.endYearApprox,
          );
          const tooltip = {
            content: {
              title: king.name,
              titleFa: king.nameFa,
              lines: [`Reigned ${range}`, firstWords(king.deathCause, 6)],
            },
          };
          const selectKing = () => setSelection({ kind: "king", id: king.id });
          return (
            <g
              key={king.id}
              className="timeline-focusable"
              tabIndex={0}
              role="button"
              aria-label={`${king.name}, reigned ${range}${
                dynasty.name ? `, ${dynasty.name} dynasty` : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                selectKing();
              }}
              onKeyDown={onActivate(selectKing)}
              onPointerEnter={(e) => setTooltip({ ...tooltip, x: e.clientX, y: e.clientY })}
              onPointerMove={(e) => setTooltip({ ...tooltip, x: e.clientX, y: e.clientY })}
              onPointerLeave={() => setTooltip(null)}
            >
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
                  fontFamily={font.ui}
                  fill={textColor}
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
                  fontFamily={font.ui}
                  fill={textColor}
                  fillOpacity={0.75}
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
          fontFamily={font.ui}
          fontWeight={700}
          fill={color.ink}
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
