export type Dynasty = {
  id: string;
  name: string;
  nameFa: string;
  startYear: number;
  endYear: number;
  startYearApprox: boolean;
  endYearApprox: boolean;
  row: number;
  color: string;
  capital: Capital;
  foreignRule: boolean;
  facts: string[];
};

type Capital = {
  name: string;
  lat: number;
  lng: number;
};
