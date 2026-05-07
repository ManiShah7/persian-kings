import { MIN_YEAR } from "./constants";

export const yearToX = (year: number, pps: number): number => {
  return (year - MIN_YEAR) * pps;
};

export const xToYear = (x: number, pps: number): number => {
  return x / pps + MIN_YEAR;
};
