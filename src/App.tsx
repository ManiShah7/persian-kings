import { useMemo } from "react";
import { useAtomValue } from "jotai";
import Timeline from "./components/Timeline";
import YearAxis from "./components/YearAxis";
import DetailPanel from "./components/DetailPanel";
import EraBackground from "./components/EraBackground";
import EventAtmosphere from "./components/EventAtmosphere";
import HeaderHUD from "./components/HeaderHUD";
import Tooltip from "./components/Tooltip";
import { ppsAtom, viewportWidthAtom } from "./state/atoms";
import { useTimelineViewport } from "./hooks/useTimelineViewport";
import { ViewportContext } from "./state/viewportContext";
import { HUD_HEIGHT, TIMELINE_HEIGHT, timelineWidth } from "./utils/constants";

function App() {
  const { containerRef, zoomToYear } = useTimelineViewport();
  const pps = useAtomValue(ppsAtom);
  const viewportWidth = useAtomValue(viewportWidthAtom);
  const viewportApi = useMemo(() => ({ zoomToYear }), [zoomToYear]);

  return (
    <ViewportContext.Provider value={viewportApi}>
      <EraBackground />
      <EventAtmosphere />
      <HeaderHUD />

      <div
        ref={containerRef}
        className="scroll-container"
        tabIndex={0}
        role="region"
        aria-label="Timeline of Iranian history"
        style={{ overflowX: "auto", overflowY: "hidden", height: "100vh" }}
      >
        <div
          className="scroll-content"
          style={{
            position: "relative",
            width: timelineWidth(pps) + viewportWidth,
            height: TIMELINE_HEIGHT,
            paddingTop: HUD_HEIGHT,
          }}
        >
          <YearAxis />
          <Timeline />
        </div>
      </div>

      <DetailPanel />
      <Tooltip />
    </ViewportContext.Provider>
  );
}

export default App;
