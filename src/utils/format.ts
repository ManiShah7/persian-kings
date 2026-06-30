export const formatYear = (year: number, approx = false): string => {
  const label = year < 0 ? `${Math.abs(year)} BC` : `${year}`;
  return approx ? `c. ${label}` : label;
};

export const formatRange = (
  startYear: number,
  endYear: number,
  startApprox = false,
  endApprox = false,
): string => `${formatYear(startYear, startApprox)} – ${formatYear(endYear, endApprox)}`;
