import { useAtomValue } from "jotai";
import { centerYearAtom, currentEraAtom } from "../state/atoms";
import { HUD_HEIGHT } from "../utils/constants";
import { color, font, text, z } from "../theme/tokens";
import { formatYear } from "../utils/format";

const HeaderHUD = () => {
  const centerYear = useAtomValue(centerYearAtom);
  const era = useAtomValue(currentEraAtom);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: HUD_HEIGHT,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        boxSizing: "border-box",
        background: "rgba(10,10,12,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: `1px solid ${color.line}`,
        color: color.ink,
        zIndex: z.hud,
      }}
    >
      <div
        className="hud-title"
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontFamily: font.latin,
          fontSize: text.md,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: color.inkDim,
        }}
      >
        Kings of Persia
      </div>

      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          borderBottom: `2px solid ${era.accent}`,
          paddingBottom: 4,
          transition: "border-color 400ms ease",
        }}
      >
        <div
          style={{
            fontFamily: font.ui,
            fontSize: text.hud,
            fontWeight: 700,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatYear(centerYear)}
        </div>
        <div
          style={{
            fontSize: text.sm,
            display: "flex",
            gap: 8,
            alignItems: "baseline",
            transition: "color 400ms ease",
          }}
        >
          <span style={{ color: era.accent }}>{era.name}</span>
          <span dir="rtl" className="fa" style={{ color: color.inkDim }}>
            {era.nameFa}
          </span>
        </div>
      </div>

      <div style={{ flex: 1 }} aria-hidden />
    </header>
  );
};

export default HeaderHUD;
