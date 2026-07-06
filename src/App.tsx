import { useAtomValue } from "jotai";
import Timeline from "./components/Timeline";
import YearAxis from "./components/YearAxis";
import DetailPanel from "./components/DetailPanel";
import { centerYearAtom, ppsAtom } from "./state/atoms";
import { useTimelineViewport } from "./hooks/useTimelineViewport";
import { TIMELINE_HEIGHT, timelineWidth } from "./utils/constants";
import { formatYear } from "./utils/format";

function App() {
  const { containerRef } = useTimelineViewport();
  const centerYear = useAtomValue(centerYearAtom);
  const pps = useAtomValue(ppsAtom);

  return (
    <>
      {/* Placeholder header — replaced by HeaderHUD in Phase 3. */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "red",
          padding: "4px 10px",
          zIndex: 5,
        }}
      >
        <h2 style={{ margin: 0 }}>Year: {formatYear(centerYear)}</h2>
      </div>

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
