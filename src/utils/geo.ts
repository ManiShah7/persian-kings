// Fixed equirectangular bounding box over the Iranian plateau and its
// historical reach: longitude 40°–70°E, latitude 24°–42°N.
export const GEO_BOX = { lngMin: 40, lngMax: 70, latMin: 24, latMax: 42 };

/** Project a lat/lng to x/y within a `w`×`h` box (equirectangular). */
export const projectCapital = (
  lat: number,
  lng: number,
  w: number,
  h: number,
): { x: number; y: number } => ({
  x: ((lng - GEO_BOX.lngMin) / (GEO_BOX.lngMax - GEO_BOX.lngMin)) * w,
  y: ((GEO_BOX.latMax - lat) / (GEO_BOX.latMax - GEO_BOX.latMin)) * h,
});
