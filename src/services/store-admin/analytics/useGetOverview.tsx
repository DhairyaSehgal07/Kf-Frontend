import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetAnalyticsOverviewApiResponse,
  AnalyticsOverviewData,
} from '@/types/analytics';

export type AnalyticsOverviewParams =
  | { dateFrom: string; dateTo: string }
  | Record<string, never>;

/** Query key prefix for analytics overview */
export const analyticsOverviewKeys = {
  all: ['store-admin', 'analytics', 'overview'] as const,
};

function overviewQueryKey(params: AnalyticsOverviewParams = {}) {
  return [
    ...analyticsOverviewKeys.all,
    'dateFrom' in params ? params.dateFrom : '',
    'dateTo' in params ? params.dateTo : '',
  ] as const;
}

/**
 * Fetcher for analytics overview.
 * Calls GET {baseURL}/analytics/overview with optional dateFrom/dateTo query params.
 */
async function fetchAnalyticsOverview(
  params: AnalyticsOverviewParams = {}
): Promise<AnalyticsOverviewData> {
  const searchParams = new URLSearchParams();
  if ('dateFrom' in params && params.dateFrom)
    searchParams.set('dateFrom', params.dateFrom);
  if ('dateTo' in params && params.dateTo)
    searchParams.set('dateTo', params.dateTo);
  const queryString = searchParams.toString();
  const url = queryString
    ? `/analytics/overview?${queryString}`
    : '/analytics/overview';

  const { data } =
    await storeAdminAxiosClient.get<GetAnalyticsOverviewApiResponse>(url);

  if (!data.success || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch analytics overview');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const analyticsOverviewQueryOptions = (
  params: AnalyticsOverviewParams = {}
) =>
  queryOptions({
    queryKey: overviewQueryKey(params),
    queryFn: () => fetchAnalyticsOverview(params),
  });

/** Hook to fetch analytics overview */
export function useGetOverview(params: AnalyticsOverviewParams = {}) {
  return useQuery(analyticsOverviewQueryOptions(params));
}

/** Prefetch analytics overview – e.g. on route hover or before navigation */
export function prefetchAnalyticsOverview(
  params: AnalyticsOverviewParams = {}
) {
  return queryClient.prefetchQuery(analyticsOverviewQueryOptions(params));
}
