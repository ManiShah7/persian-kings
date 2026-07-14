/**
 * Two non-interactive, full-viewport layers that give the scene depth:
 *
 *  - a vignette that sits behind the timeline content (above the era
 *    background, motif and atmosphere) and darkens the edges, so the sparse
 *    middle reads as framed negative space rather than an empty void;
 *  - a faint, static film grain over the whole scene for an archival,
 *    printed-plate texture that keeps flat fills from looking synthetic.
 *
 * Both are aria-hidden and pointer-events: none, so they never affect layout,
 * interaction or the accessibility tree.
 */
export function SceneDepth() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          background:
            "radial-gradient(132% 118% at 50% 30%, transparent 50%, rgba(0,0,0,0.55) 100%)," +
            "linear-gradient(to bottom, transparent 56%, rgba(0,0,0,0.42) 100%)",
        }}
      />
      <svg
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 5,
          pointerEvents: "none",
          opacity: 0.055,
          mixBlendMode: "overlay",
        }}
      >
        <filter id="scene-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#scene-grain)" />
      </svg>
    </>
  );
}
