import { createContext, useContext } from "react";

export type ViewportApi = {
  /** Zoom to `targetPps` (clamped) and center the viewport on `year`. */
  zoomToYear: (year: number, targetPps: number) => void;
  /** Pan (keeping zoom) so `year` sits at the horizontal center of the view. */
  panToYear: (year: number) => void;
  /** Zoom by `factor` (clamped) around the viewport center. */
  zoomBy: (factor: number) => void;
};

export const ViewportContext = createContext<ViewportApi | null>(null);

export const useViewportApi = (): ViewportApi | null => useContext(ViewportContext);
