export type EventCategory = "politics-wars" | "culture-religion" | "science";

export type HistoricalEvent = {
  id: string;
  year: number;
  yearApprox: boolean;
  category: EventCategory;
  title: string;
  titleFa: string;
  fact: string;
};
