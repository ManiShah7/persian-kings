import type { Dynasty } from "../types/Dynasty";
import { dynasties } from "../data";
import { color, font, text } from "../theme/tokens";
import { GEO_BOX, projectCapital } from "../utils/geo";

const W = 300;
const H = 180;

/** Abstract equirectangular plot of all dynasty capitals, highlighting one. */
const CapitalMap = ({ dynasty, accent }: { dynasty: Dynasty; accent: string }) => {
  const selected = projectCapital(dynasty.capital.lat, dynasty.capital.lng, W, H);

  const lngLines: number[] = [];
  for (let lng = GEO_BOX.lngMin; lng <= GEO_BOX.lngMax; lng += 5) lngLines.push(lng);
  const latLines: number[] = [];
  for (let lat = GEO_BOX.latMin; lat <= GEO_BOX.latMax; lat += 5) latLines.push(lat);

  return (
    <div style={{ marginBottom: 12 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`Map locating ${dynasty.capital.name}`}
        style={{ display: "block", borderRadius: 6, background: "rgba(0,0,0,0.2)" }}
      >
        {lngLines.map((lng) => {
          const { x } = projectCapital(0, lng, W, H);
          return <line key={`v${lng}`} x1={x} x2={x} y1={0} y2={H} stroke={color.line} />;
        })}
        {latLines.map((lat) => {
          const { y } = projectCapital(lat, 0, W, H);
          return <line key={`h${lat}`} x1={0} x2={W} y1={y} y2={y} stroke={color.line} />;
        })}

        {dynasties.map((d) => {
          const p = projectCapital(d.capital.lat, d.capital.lng, W, H);
          return <circle key={d.id} cx={p.x} cy={p.y} r={2} fill={color.inkFaint} />;
        })}

        <circle cx={selected.x} cy={selected.y} r={5} fill={accent} stroke="#0c0a08" strokeWidth={1} />
        <text
          x={selected.x}
          y={selected.y - 9}
          textAnchor="middle"
          fontFamily={font.ui}
          fontSize={text.xs}
          fill={color.ink}
        >
          {dynasty.capital.name}
        </text>
      </svg>
    </div>
  );
};

export default CapitalMap;
