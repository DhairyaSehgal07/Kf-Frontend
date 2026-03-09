import { useQuery, queryOptions } from '@tanstack/react-query';
import type {
  DailyTrendChartItem,
  MonthlyTrendChartItem,
} from '@/types/analytics';

export type IncomingTrendParams =
  | { dateFrom: string; dateTo: string }
  | Record<string, never>;

export interface IncomingTrendAnalysisData {
  daily: DailyTrendChartItem[];
  monthly: MonthlyTrendChartItem[];
}

const key = [
  'store-admin',
  'analytics',
  'incoming',
  'daily-monthly-trend',
] as const;

function queryKey(params: IncomingTrendParams = {}) {
  return [
    ...key,
    'dateFrom' in params ? params.dateFrom : '',
    'dateTo' in params ? params.dateTo : '',
  ] as const;
}

/** Stub: returns empty data. Replace with real GET /analytics/daily-monthly-trend when available. */
async function fetchIncomingTrend(
  _params: IncomingTrendParams = {}
): Promise<IncomingTrendAnalysisData> {
  return { daily: [], monthly: [] };
}

export const dailyMonthlyTrendQueryOptions = (
  params: IncomingTrendParams = {}
) =>
  queryOptions({
    queryKey: queryKey(params),
    queryFn: () => fetchIncomingTrend(params),
  });

export function useGetIncomingTrendAnalysis(params: IncomingTrendParams = {}) {
  return useQuery(dailyMonthlyTrendQueryOptions(params));
}
