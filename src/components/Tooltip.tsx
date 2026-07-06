import { createPortal } from "react-dom";
import { useAtomValue } from "jotai";
import { tooltipAtom } from "../state/atoms";
import { color, font, radius, text, z } from "../theme/tokens";

const OFFSET = 14;

/** Single reusable hover card, rendered in a portal at the pointer. */
const Tooltip = () => {
  const tip = useAtomValue(tooltipAtom);
  if (!tip) return null;

  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        left: tip.x + OFFSET,
        top: tip.y + OFFSET,
        maxWidth: 260,
        pointerEvents: "none",
        background: color.panelBg,
        border: `1px solid ${color.line}`,
        borderRadius: radius.md,
        padding: "8px 10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        color: color.ink,
        fontFamily: font.ui,
        fontSize: text.xs,
        lineHeight: 1.45,
        zIndex: z.panel + 10,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: text.sm }}>{tip.content.title}</div>
      {tip.content.titleFa && (
        <div dir="rtl" className="fa" style={{ color: color.inkDim }}>
          {tip.content.titleFa}
        </div>
      )}
      {tip.content.lines.map((line, i) => (
        <div key={i} style={{ color: color.inkDim, marginTop: 2 }}>
          {line}
        </div>
      ))}
    </div>,
    document.body,
  );
};

export default Tooltip;
