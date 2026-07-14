import { useAtomValue } from "jotai";
import { eras } from "../data/eras";
import { currentEraAtom, scrollXAtom } from "../state/atoms";
import { eraMotifs } from "../theme/eraMotifs";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import styles from "./EraMotif.module.css";

const MOTIF_OPACITY = 0.12;
const PARALLAX_FACTOR = 0.15;

/**
 * A fixed, full-viewport motif layer that sits on top of EraBackground and
 * under the timeline. Every era's pattern is defined once; only opacity
 * changes as the centred year moves, so the crossfade is compositor-only. The
 * whole layer drifts as you pan for a parallax against the timeline.
 */
export function EraMotif() {
  const current = useAtomValue(currentEraAtom);
  const scrollX = useAtomValue(scrollXAtom);
  const reducedMotion = usePrefersReducedMotion();

  // Skip the drift entirely when reduced motion is requested: no transform at
  // all, rather than a frozen-but-shifted pattern.
  const patternTransform = reducedMotion
    ? undefined
    : `translate(${-scrollX * PARALLAX_FACTOR} 0)`;

  return (
    <svg className={styles.root} aria-hidden="true" focusable="false">
      <defs>
        {eras.map((era) => {
          const motif = eraMotifs[era.id];
          return (
            <pattern
              key={era.id}
              id={`era-motif-${era.id}`}
              width={motif.size}
              height={motif.size}
              patternUnits="userSpaceOnUse"
              patternTransform={patternTransform}
            >
              <g
                fill="none"
                stroke={era.accent}
                strokeWidth={1}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {motif.body}
              </g>
            </pattern>
          );
        })}
      </defs>

      {eras.map((era) => {
        const motif = eraMotifs[era.id];
        const shown = era.id === current.id;
        return (
          <rect
            key={era.id}
            className={styles.layer}
            width="100%"
            height="100%"
            fill={`url(#era-motif-${era.id})`}
            style={{ opacity: shown ? motif.opacity ?? MOTIF_OPACITY : 0 }}
          />
        );
      })}
    </svg>
  );
}
