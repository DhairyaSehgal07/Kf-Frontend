import { useQuery, queryOptions } from '@tanstack/react-query';
import type { VarietyDistributionChartItem } from '@/types/analytics';

export type VarietyBreakdownParams =
  | { dateFrom: string; dateTo: string }
  | Record<string, never>;

const key = [
  'store-admin',
  'analytics',
  'incoming',
  'variety-breakdown',
] as const;

function queryKey(params: VarietyBreakdownParams = {}) {
  return [
    ...key,
    'dateFrom' in params ? params.dateFrom : '',
    'dateTo' in params ? params.dateTo : '',
  ] as const;
}

/** Stub: returns empty data. Replace with real GET /analytics/variety-distribution when available. */
async function fetchVarietyBreakdown(
  _params: VarietyBreakdownParams = {}
): Promise<VarietyDistributionChartItem[]> {
  return [];
}

export const varietyDistributionQueryOptions = (
  params: VarietyBreakdownParams = {}
) =>
  queryOptions({
    queryKey: queryKey(params),
    queryFn: () => fetchVarietyBreakdown(params),
  });

export function useGetIncomingVarietyBreakdown(
  params: VarietyBreakdownParams = {}
) {
  return useQuery(varietyDistributionQueryOptions(params));
}
