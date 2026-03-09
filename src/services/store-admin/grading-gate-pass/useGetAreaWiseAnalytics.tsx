import { useQuery, queryOptions } from '@tanstack/react-query';
import type { AreaWiseVarietyItem } from '@/types/analytics';

export type AreaWiseAnalyticsParams =
  | { dateFrom: string; dateTo: string }
  | Record<string, never>;

const key = [
  'store-admin',
  'grading-gate-pass',
  'area-wise-analytics',
] as const;

function queryKey(params: AreaWiseAnalyticsParams = {}) {
  return [
    ...key,
    'dateFrom' in params ? params.dateFrom : '',
    'dateTo' in params ? params.dateTo : '',
  ] as const;
}

/** Stub: returns empty data. Replace with real GET /analytics/area-wise-size-distribution when available. */
export const areaWiseAnalyticsQueryOptions = (
  params: AreaWiseAnalyticsParams = {}
) =>
  queryOptions({
    queryKey: queryKey(params),
    queryFn: async (): Promise<{ data: AreaWiseVarietyItem[] }> => ({
      data: [],
    }),
  });

export function useGetAreaWiseAnalytics(params: AreaWiseAnalyticsParams = {}) {
  return useQuery(areaWiseAnalyticsQueryOptions(params));
}
