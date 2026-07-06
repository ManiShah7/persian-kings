import { createContext, useContext } from "react";

export type ViewportApi = {
  /** Zoom to `targetPps` (clamped) and center the viewport on `year`. */
  zoomToYear: (year: number, targetPps: number) => void;
};

export const ViewportContext = createContext<ViewportApi | null>(null);

export const useViewportApi = (): ViewportApi | null => useContext(ViewportContext);
