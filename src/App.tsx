import { useAtomValue } from "jotai";
import Timeline from "./components/Timeline";
import YearAxis from "./components/YearAxis";
import DetailPanel from "./components/DetailPanel";
import EraBackground from "./components/EraBackground";
import HeaderHUD from "./components/HeaderHUD";
import { ppsAtom } from "./state/atoms";
import { useTimelineViewport } from "./hooks/useTimelineViewport";
import { HUD_HEIGHT, TIMELINE_HEIGHT, timelineWidth } from "./utils/constants";

function App() {
  const { containerRef } = useTimelineViewport();
  const pps = useAtomValue(ppsAtom);

  return (
    <>
      <EraBackground />
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
            width: timelineWidth(pps),
            height: TIMELINE_HEIGHT,
            paddingTop: HUD_HEIGHT,
          }}
        >
          <YearAxis />
          <Timeline />
        </div>
      </div>

      <DetailPanel />
    </>
  );
}

export default App;
