import { useQuery, queryOptions } from '@tanstack/react-query';
import type { SizeDistributionVarietyItem } from '@/types/analytics';

export type GradingSizeWiseParams =
  | { dateFrom: string; dateTo: string }
  | Record<string, never>;

const key = [
  'store-admin',
  'grading-gate-pass',
  'size-wise-distribution',
] as const;

function queryKey(params: GradingSizeWiseParams = {}) {
  return [
    ...key,
    'dateFrom' in params ? params.dateFrom : '',
    'dateTo' in params ? params.dateTo : '',
  ] as const;
}

/** Stub: returns empty data. Replace with real GET /analytics/size-distribution when available. */
export const gradingSizeWiseDistributionQueryOptions = (
  params: GradingSizeWiseParams = {}
) =>
  queryOptions({
    queryKey: queryKey(params),
    queryFn: async (): Promise<{ data: SizeDistributionVarietyItem[] }> => ({
      data: [],
    }),
  });

export function useGetGradingSizeWiseDistribution(
  params: GradingSizeWiseParams = {}
) {
  return useQuery(gradingSizeWiseDistributionQueryOptions(params));
}
