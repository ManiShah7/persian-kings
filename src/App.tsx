import { useAtomValue } from "jotai";
import Timeline from "./components/Timeline";
import YearAxis from "./components/YearAxis";
import DetailPanel from "./components/DetailPanel";
import { activeYearAtom } from "./state/atoms";

function App() {
  const activeYear = useAtomValue(activeYearAtom);

  return (
    <div
      style={{
        padding: "75px 0",
        position: "relative",
      }}
    >
      <div style={{ position: "fixed", top: 0, backgroundColor: "red" }}>
        <h2>Year: {activeYear}</h2>
      </div>
      <Timeline />
      <YearAxis />
      <DetailPanel />
    </div>
  );
}

export default App;
