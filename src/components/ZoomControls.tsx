import { useAtomValue } from "jotai";
import { ppsAtom } from "../state/atoms";
import { MAX_PPS, MIN_PPS } from "../utils/constants";
import { z } from "../theme/tokens";
import { useViewportApi } from "../state/viewportContext";

const ZOOM_STEP = 1.4; // multiply/divide pps per tap
const EPS = 1e-6;

/** On-screen zoom in/out buttons, anchored bottom-right above the seek bar. */
const ZoomControls = () => {
  const pps = useAtomValue(ppsAtom);
  const viewport = useViewportApi();

  return (
    <div className="zoom-cluster" style={{ zIndex: z.seek }}>
      <button
        className="zoom-btn"
        aria-label="Zoom in"
        disabled={pps >= MAX_PPS - EPS}
        onClick={() => viewport?.zoomBy(ZOOM_STEP)}
      >
        +
      </button>
      <button
        className="zoom-btn"
        aria-label="Zoom out"
        disabled={pps <= MIN_PPS + EPS}
        onClick={() => viewport?.zoomBy(1 / ZOOM_STEP)}
      >
        {"−"}
      </button>
    </div>
  );
};

export default ZoomControls;
