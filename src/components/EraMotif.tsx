import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { eras } from "../data/eras";
import { currentEraAtom, scrollXAtom } from "../state/atoms";
import { eraMotifs } from "../theme/eraMotifs";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import styles from "./EraMotif.module.css";

const MOTIF_OPACITY = 0.12;
const PARALLAX_FACTOR = 0.15;
const SPOT_RADIUS = 190; // px reach of the cursor torch
const SPOT_OPACITY = 0.9; // strength of the revealed motif inside the torch

type Point = { x: number; y: number };

/**
 * A fixed, full-viewport motif layer that sits on top of EraBackground and
 * under the timeline. Every era's pattern is defined once; only opacity
 * changes as the centred year moves, so the crossfade is compositor-only. The
 * whole layer drifts as you pan for a parallax against the timeline.
 *
 * A cursor "torch" reveals a bolder, full-accent copy of the current era's
 * motif in a soft radial spotlight, so the ornament lights up under the
 * pointer. The torch is skipped entirely under reduced motion.
 */
export function EraMotif() {
  const current = useAtomValue(currentEraAtom);
  const scrollX = useAtomValue(scrollXAtom);
  const reducedMotion = usePrefersReducedMotion();
  const [cursor, setCursor] = useState<Point | null>(null);

  // Track the pointer at one update per frame. The layer is pointer-events:
  // none, so we listen on the window; leaving the document clears the torch.
  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let next: Point = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      next = { x: e.clientX, y: e.clientY };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setCursor(next);
      });
    };
    const onLeave = () => setCursor(null);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  // Skip the drift entirely when reduced motion is requested: no transform at
  // all, rather than a frozen-but-shifted pattern.
  const patternTransform = reducedMotion
    ? undefined
    : `translate(${-scrollX * PARALLAX_FACTOR} 0)`;

  const torch = cursor && !reducedMotion;
  const hotMotif = eraMotifs[current.id];

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

        {torch && (
          <>
            {/* Bolder, full-strength copy of the current motif, aligned to the
                base via the same parallax transform. */}
            <pattern
              id={`era-motif-hot-${current.id}`}
              width={hotMotif.size}
              height={hotMotif.size}
              patternUnits="userSpaceOnUse"
              patternTransform={patternTransform}
            >
              <g
                fill="none"
                stroke={current.accent}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {hotMotif.body}
              </g>
            </pattern>

            <radialGradient
              id="motif-torch"
              gradientUnits="userSpaceOnUse"
              cx={cursor.x}
              cy={cursor.y}
              r={SPOT_RADIUS}
              fx={cursor.x}
              fy={cursor.y}
            >
              <stop offset="0%" stopColor="#fff" stopOpacity={1} />
              <stop offset="55%" stopColor="#fff" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#fff" stopOpacity={0} />
            </radialGradient>
            <mask
              id="motif-torch-mask"
              maskUnits="userSpaceOnUse"
              x={cursor.x - SPOT_RADIUS}
              y={cursor.y - SPOT_RADIUS}
              width={SPOT_RADIUS * 2}
              height={SPOT_RADIUS * 2}
            >
              <rect
                x={cursor.x - SPOT_RADIUS}
                y={cursor.y - SPOT_RADIUS}
                width={SPOT_RADIUS * 2}
                height={SPOT_RADIUS * 2}
                fill="url(#motif-torch)"
              />
            </mask>

            <radialGradient
              id="motif-torch-glow"
              gradientUnits="userSpaceOnUse"
              cx={cursor.x}
              cy={cursor.y}
              r={SPOT_RADIUS}
            >
              <stop offset="0%" stopColor={current.accent} stopOpacity={0.16} />
              <stop offset="100%" stopColor={current.accent} stopOpacity={0} />
            </radialGradient>
          </>
        )}
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

      {torch && (
        <>
          {/* Only the torch's bounding box is painted/masked, not the whole
              viewport, so the compositor stays cheap on every pointer frame.
              Pattern and gradients are userSpaceOnUse, so the box stays
              aligned to the motif at any position. */}
          <rect
            x={cursor.x - SPOT_RADIUS}
            y={cursor.y - SPOT_RADIUS}
            width={SPOT_RADIUS * 2}
            height={SPOT_RADIUS * 2}
            fill="url(#motif-torch-glow)"
          />
          <rect
            x={cursor.x - SPOT_RADIUS}
            y={cursor.y - SPOT_RADIUS}
            width={SPOT_RADIUS * 2}
            height={SPOT_RADIUS * 2}
            fill={`url(#era-motif-hot-${current.id})`}
            mask="url(#motif-torch-mask)"
            style={{ opacity: SPOT_OPACITY }}
          />
        </>
      )}
    </svg>
  );
}
