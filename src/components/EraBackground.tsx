import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { currentEraAtom } from "../state/atoms";
import type { Era } from "../types/Era";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const CROSSFADE_MS = 800;

const gradient = (era: Era): string =>
  `linear-gradient(180deg, ${era.background.from}, ${era.background.to})`;

const layerStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: -1,
};

/**
 * Full-viewport background that crossfades between era gradients as the
 * centered year moves. Two stacked layers: `base` is fully shown, `overlay`
 * fades in on top and is promoted to base once the transition completes.
 */
const EraBackground = () => {
  const era = useAtomValue(currentEraAtom);
  const reducedMotion = usePrefersReducedMotion();

  const [base, setBase] = useState<Era>(era);
  const [overlay, setOverlay] = useState<Era | null>(null);
  const [overlayOn, setOverlayOn] = useState(false);
  const [lastEraId, setLastEraId] = useState(era.id);

  // React to era changes during render (endorsed "adjust state on prop change"
  // pattern) so the transition flip stays out of an effect body.
  if (era.id !== lastEraId) {
    setLastEraId(era.id);
    if (reducedMotion) {
      setBase(era);
      setOverlay(null);
      setOverlayOn(false);
    } else if (era.id === base.id) {
      // Scrubbed back onto the base era mid-fade → drop the pending overlay.
      setOverlay(null);
      setOverlayOn(false);
    } else {
      setOverlay(era); // mounts at opacity 0; the effect below flips it on
      setOverlayOn(false);
    }
  }

  // Flip the freshly-mounted overlay to opacity 1 next frame to animate it.
  useEffect(() => {
    if (!overlay || overlayOn) return;
    const raf = requestAnimationFrame(() => setOverlayOn(true));
    return () => cancelAnimationFrame(raf);
  }, [overlay, overlayOn]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "opacity" || !overlay) return;
    setBase(overlay);
    setOverlay(null);
    setOverlayOn(false);
  };

  return (
    <>
      <div aria-hidden style={{ ...layerStyle, backgroundImage: gradient(base) }} />
      {overlay && (
        <div
          aria-hidden
          onTransitionEnd={handleTransitionEnd}
          style={{
            ...layerStyle,
            backgroundImage: gradient(overlay),
            opacity: overlayOn ? 1 : 0,
            transition: `opacity ${CROSSFADE_MS}ms ease`,
          }}
        />
      )}
    </>
  );
};

export default EraBackground;
