import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { selectionAtom, viewportWidthAtom } from "../state/atoms";
import { dynasties, events, kings } from "../data";
import type { Dynasty } from "../types/Dynasty";
import type { King } from "../types/King";
import { CATEGORY_META } from "../utils/constants";
import { color, font, radius, shadow, text, z } from "../theme/tokens";
import { normalizeDynastyColor } from "../utils/color";
import { formatRange, formatYear } from "../utils/format";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import CapitalMap from "./CapitalMap";

const Field = ({ label, value }: { label: string; value: string }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={eyebrowStyle}>{label}</div>
    <div style={{ fontSize: text.md, color: color.ink }}>{value}</div>
  </div>
);

const Facts = ({ facts }: { facts: string[] }) => (
  <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: color.inkDim, lineHeight: 1.55 }}>
    {facts.map((fact, i) => (
      <li key={i} style={{ marginBottom: 6 }}>
        {fact}
      </li>
    ))}
  </ul>
);

const eyebrowStyle: React.CSSProperties = {
  fontSize: text.xs,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  color: color.inkFaint,
  fontFamily: font.ui,
};

const Header = ({
  accent,
  eyebrow,
  name,
  nameFa,
  subtitle,
}: {
  accent: string;
  eyebrow: string;
  name: string;
  nameFa: string;
  subtitle: string;
}) => (
  <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 14, marginBottom: 22 }}>
    <div style={{ ...eyebrowStyle, color: accent, fontWeight: 700, letterSpacing: 1 }}>
      {eyebrow}
    </div>
    <h2
      style={{
        margin: "5px 0 2px",
        fontFamily: font.latin,
        fontSize: text.xl,
        fontWeight: 600,
        color: color.ink,
      }}
    >
      {name}
    </h2>
    <div dir="rtl" className="fa" style={{ fontSize: text.lg, color: color.inkDim }}>
      {nameFa}
    </div>
    <div style={{ fontSize: text.md, color: color.inkDim, marginTop: 6 }}>{subtitle}</div>
  </div>
);

/** Slim track showing the king's reign within its dynasty's full span. */
const ReignBar = ({
  dynasty,
  king,
  accent,
}: {
  dynasty: Dynasty;
  king: King;
  accent: string;
}) => {
  const span = dynasty.endYear - dynasty.startYear || 1;
  const left = Math.max(0, ((king.startYear - dynasty.startYear) / span) * 100);
  const width = Math.min(100 - left, ((king.endYear - king.startYear) / span) * 100);
  return (
    <div style={{ margin: "4px 0 20px" }}>
      <div
        style={{
          position: "relative",
          height: 8,
          borderRadius: radius.sm,
          background: color.line,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${left}%`,
            width: `${Math.max(width, 1.5)}%`,
            top: 0,
            bottom: 0,
            background: accent,
            borderRadius: radius.sm,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: text.xs,
          color: color.inkFaint,
          marginTop: 4,
        }}
      >
        <span>{formatYear(dynasty.startYear, dynasty.startYearApprox)}</span>
        <span>{formatYear(dynasty.endYear, dynasty.endYearApprox)}</span>
      </div>
    </div>
  );
};

const PanelBody = () => {
  const [selection, setSelection] = useAtom(selectionAtom);
  const viewportWidth = useAtomValue(viewportWidthAtom);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [drill, setDrill] = useState<{ kingId: string; dynastyId: string } | null>(null);

  // Focus lands in the panel on open; focus is restored on close.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => restoreFocusRef.current?.focus?.();
  }, []);

  // Close on Escape and on pointer-down outside the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelection(null);
    };
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setSelection(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [setSelection]);

  if (!selection) return null;

  let body: React.ReactNode = null;

  if (selection.kind === "dynasty") {
    const dynasty = dynasties.find((d) => d.id === selection.id);
    if (dynasty) {
      const accent = normalizeDynastyColor(dynasty.color);
      const rulers = kings.filter((k) => k.dynastyId === dynasty.id);
      body = (
        <>
          <Header
            accent={accent}
            eyebrow={dynasty.foreignRule ? "Dynasty · Foreign rule" : "Dynasty"}
            name={dynasty.name}
            nameFa={dynasty.nameFa}
            subtitle={formatRange(
              dynasty.startYear,
              dynasty.endYear,
              dynasty.startYearApprox,
              dynasty.endYearApprox,
            )}
          />
          <Field label="Capital" value={dynasty.capital.name} />
          <CapitalMap dynasty={dynasty} accent={accent} />
          {rulers.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={eyebrowStyle}>Rulers</div>
              <div style={{ marginTop: 6 }}>
                {rulers.map((k) => (
                  <button
                    key={k.id}
                    className="ruler-row"
                    onClick={() => {
                      setDrill({ kingId: k.id, dynastyId: dynasty.id });
                      setSelection({ kind: "king", id: k.id });
                    }}
                  >
                    <span>{k.name}</span>
                    <span style={{ color: color.inkFaint, fontSize: text.xs }}>
                      {formatRange(k.startYear, k.endYear, k.startYearApprox, k.endYearApprox)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <Facts facts={dynasty.facts} />
        </>
      );
    }
  } else if (selection.kind === "king") {
    const king = kings.find((k) => k.id === selection.id);
    if (king) {
      const dynasty = dynasties.find((d) => d.id === king.dynastyId);
      const accent = dynasty ? normalizeDynastyColor(dynasty.color) : color.inkDim;
      const showBack = drill?.kingId === king.id && dynasty;
      body = (
        <>
          {showBack && (
            <button
              className="back-link"
              onClick={() => {
                setSelection({ kind: "dynasty", id: dynasty!.id });
                setDrill(null);
              }}
            >
              ← Back to {dynasty!.name}
            </button>
          )}
          <Header
            accent={accent}
            eyebrow={dynasty ? `Ruler · ${dynasty.name}` : "Ruler"}
            name={king.name}
            nameFa={king.nameFa}
            subtitle={formatRange(
              king.startYear,
              king.endYear,
              king.startYearApprox,
              king.endYearApprox,
            )}
          />
          {dynasty && <ReignBar dynasty={dynasty} king={king} accent={accent} />}
          <Field label="Death" value={king.deathCause} />
          <Facts facts={king.facts} />
        </>
      );
    }
  } else {
    const event = events.find((e) => e.id === selection.id);
    if (event) {
      const meta = CATEGORY_META[event.category];
      body = (
        <>
          <Header
            accent={meta.color}
            eyebrow={`Event · ${meta.label}`}
            name={event.title}
            nameFa={event.titleFa}
            subtitle={formatYear(event.year, event.yearApprox)}
          />
          <Facts facts={[event.fact]} />
        </>
      );
    }
  }

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      className={reducedMotion ? "detail-panel no-motion" : "detail-panel"}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: viewportWidth <= 560 ? "100vw" : 380,
        maxWidth: "100vw",
        background: color.panelBg,
        boxShadow: shadow.panel,
        borderLeft: `1px solid ${color.line}`,
        padding: "28px 24px 32px",
        boxSizing: "border-box",
        overflowY: "auto",
        outline: "none",
        fontFamily: font.ui,
        zIndex: z.panel,
      }}
    >
      <button
        onClick={() => setSelection(null)}
        aria-label="Close"
        className="panel-close"
      >
        ×
      </button>
      {body}
    </div>
  );
};

const DetailPanel = () => {
  const [selection] = useAtom(selectionAtom);
  if (!selection) return null;
  return <PanelBody />;
};

export default DetailPanel;
