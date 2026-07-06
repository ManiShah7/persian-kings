import { useAtomValue } from "jotai";
import { centerYearAtom, currentEraAtom } from "../state/atoms";
import { HUD_HEIGHT } from "../utils/constants";
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
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        color: "#e8e4dc",
        zIndex: 20,
      }}
    >
      <div
        style={{
          flex: 1,
          fontSize: 13,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: "#c9c3b8",
        }}
      >
        Kings of Persia
      </div>

      <div
        style={{
          textAlign: "center",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          borderBottom: `2px solid ${era.accent}`,
          paddingBottom: 4,
          transition: "border-color 400ms ease",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
          {formatYear(centerYear)}
        </div>
        <div
          style={{
            fontSize: 12,
            color: era.accent,
            transition: "color 400ms ease",
            display: "flex",
            gap: 8,
            alignItems: "baseline",
          }}
        >
          <span>{era.name}</span>
          <span dir="rtl" className="fa" style={{ color: "#a39d92" }}>
            {era.nameFa}
          </span>
        </div>
      </div>

      <div style={{ flex: 1 }} aria-hidden />
    </header>
  );
};

export default HeaderHUD;
