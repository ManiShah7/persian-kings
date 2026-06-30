import { useAtom } from "jotai";
import { selectionAtom } from "../state/atoms";
import dynastiesData from "../data/dynasties.json";
import kingsData from "../data/kings.json";
import eventsData from "../data/events.json";
import type { Dynasty } from "../types/Dynasty";
import type { King } from "../types/King";
import type { HistoricalEvent } from "../types/Event";
import { CATEGORY_META } from "../utils/constants";
import { formatRange, formatYear } from "../utils/format";

const dynasties = dynastiesData as Dynasty[];
const kings = kingsData as King[];
const events = eventsData as HistoricalEvent[];

const Field = ({ label, value }: { label: string; value: string }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#888" }}>
      {label}
    </div>
    <div style={{ fontSize: 15, color: "#1a1a1a" }}>{value}</div>
  </div>
);

const Facts = ({ facts }: { facts: string[] }) => (
  <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "#333", lineHeight: 1.5 }}>
    {facts.map((fact, i) => (
      <li key={i} style={{ marginBottom: 6 }}>
        {fact}
      </li>
    ))}
  </ul>
);

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
  <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 12, marginBottom: 20 }}>
    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: accent, fontWeight: 700 }}>
      {eyebrow}
    </div>
    <h2 style={{ margin: "4px 0 2px", fontSize: 22, color: "#111" }}>{name}</h2>
    <div dir="rtl" style={{ fontSize: 16, color: "#666" }}>
      {nameFa}
    </div>
    <div style={{ fontSize: 14, color: "#444", marginTop: 6 }}>{subtitle}</div>
  </div>
);

const DetailPanel = () => {
  const [selection, setSelection] = useAtom(selectionAtom);
  if (!selection) return null;

  let body: React.ReactNode;

  if (selection.kind === "dynasty") {
    const dynasty = dynasties.find((d) => d.id === selection.id);
    if (!dynasty) return null;
    const rulers = kings.filter((k) => k.dynastyId === dynasty.id);
    body = (
      <>
        <Header
          accent={dynasty.color}
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
        {rulers.length > 0 && (
          <Field label="Rulers" value={rulers.map((k) => k.name).join(", ")} />
        )}
        <Facts facts={dynasty.facts} />
      </>
    );
  } else if (selection.kind === "king") {
    const king = kings.find((k) => k.id === selection.id);
    if (!king) return null;
    const dynasty = dynasties.find((d) => d.id === king.dynastyId);
    body = (
      <>
        <Header
          accent={dynasty?.color ?? "#888"}
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
        <Field label="Death" value={king.deathCause} />
        <Facts facts={king.facts} />
      </>
    );
  } else {
    const event = events.find((e) => e.id === selection.id);
    if (!event) return null;
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

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: 360,
        maxWidth: "90vw",
        background: "#fff",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
        padding: "24px 24px 32px",
        boxSizing: "border-box",
        overflowY: "auto",
        zIndex: 10,
      }}
    >
      <button
        onClick={() => setSelection(null)}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          border: "none",
          background: "transparent",
          fontSize: 22,
          lineHeight: 1,
          cursor: "pointer",
          color: "#999",
        }}
      >
        ×
      </button>
      {body}
    </div>
  );
};

export default DetailPanel;
