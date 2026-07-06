import { useAtomValue } from "jotai";
import { centerYearAtom, ppsAtom } from "../state/atoms";
import { events } from "../data";
import { CATEGORY_META } from "../utils/constants";
import { withAlpha } from "../utils/color";

// How far (in px from screen center) an event's bloom reaches. Scaling by px
// rather than years keeps the effect consistent at every zoom level.
const GLOW_PX = 420;
const PEAK_ALPHA = 0.3;

/**
 * A fixed background layer that blooms in each event's category color as the
 * centered year scrolls past it. Multiple nearby events blend; the glow drifts
 * horizontally with the event and peaks when it reaches the screen center.
 */
const EventAtmosphere = () => {
  const centerYear = useAtomValue(centerYearAtom);
  const pps = useAtomValue(ppsAtom);

  const layers: string[] = [];
  for (const event of events) {
    const dx = (event.year - centerYear) * pps; // px offset from screen center
    if (Math.abs(dx) >= GLOW_PX) continue;
    const intensity = 1 - Math.abs(dx) / GLOW_PX;
    const tint = withAlpha(CATEGORY_META[event.category].color, PEAK_ALPHA * intensity);
    layers.push(
      `radial-gradient(55% 65% at calc(50% + ${dx.toFixed(0)}px) 68%, ${tint} 0%, transparent 70%)`,
    );
  }

  if (layers.length === 0) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        backgroundImage: layers.join(","),
      }}
    />
  );
};

export default EventAtmosphere;
