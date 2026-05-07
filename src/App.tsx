import { useEffect, useRef } from "react";
import Timeline from "./components/Timeline";
import YearAxis from "./components/YearAxis";
import { MIN_YEAR } from "./utils/constants";

function App() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;

    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        overflowX: "auto",
        padding: "75px 0",
        position: "relative",
      }}
    >
      <div style={{ position: "fixed", top: 0, backgroundColor: "red" }}>
        <h2>Year: {MIN_YEAR}</h2>
      </div>
      <Timeline />
      <YearAxis />
    </div>
  );
}

export default App;
