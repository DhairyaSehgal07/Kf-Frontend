/** Report types for analytics reports route (?report=) */
export const ANALYTICS_REPORT_TYPES = [
  'incoming',
  'ungraded',
  'grading',
  'stored',
  'dispatch',
  'outgoing',
] as const;

export type AnalyticsReportType = (typeof ANALYTICS_REPORT_TYPES)[number];

/** Grading bags summary (initial vs current quantity) */
export interface AnalyticsOverviewGradingBags {
  initialQuantity: number;
  currentQuantity: number;
}

/** Overview stats returned by GET /analytics/overview */
export interface AnalyticsOverviewData {
  totalIncomingBags: number;
  totalIncomingWeight: number;
  totalUngradedBags: number;
  totalUngradedWeight: number;
  totalGradingBags: AnalyticsOverviewGradingBags;
  totalGradingWeight: number;
  totalBagsStored: number;
  totalBagsDispatched: number;
  totalOutgoingBags: number;
}

/** API response for GET /analytics/overview */
export interface GetAnalyticsOverviewApiResponse {
  success: boolean;
  data: AnalyticsOverviewData;
  message?: string;
}

/** Chart / breakdown types (for when backend adds these endpoints) */
export interface VarietyDistributionChartItem {
  name: string;
  value: number;
  color?: string;
}

export interface SizeDistributionSizeItem {
  size: string;
  count: number;
}

export interface SizeDistributionVarietyItem {
  variety: string;
  sizes: SizeDistributionSizeItem[];
}

export interface AreaWiseVarietyItem {
  variety: string;
  areas: AreaWiseAreaItem[];
}

export interface AreaWiseAreaItem {
  area: string;
  sizes: Record<string, number>;
}

export interface DailyTrendChartItem {
  date: string;
  bags: number;
}

export interface MonthlyTrendChartItem {
  month: string;
  bags: number;
}
