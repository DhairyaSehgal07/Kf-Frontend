import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetGradingGatePassesApiResponse,
  GetGradingGatePassesData,
  GetGradingGatePassesParams,
  GradingGatePass,
  GradingGatePassPagination,
} from '@/types/grading-gate-pass';

export interface GradingGatePassesResult {
  list: GradingGatePass[];
  pagination: GradingGatePassPagination;
}

/** Query key prefix for grading gate pass – use for invalidation */
export const gradingGatePassKeys = {
  all: ['store-admin', 'grading-gate-pass'] as const,
};

/** Query key for the list of grading gate passes */
const gradingGatePassListKey = [...gradingGatePassKeys.all, 'list'] as const;

function listKey(params: GetGradingGatePassesParams = {}) {
  return [
    ...gradingGatePassListKey,
    params.page,
    params.limit,
    params.sortOrder,
    params.sortBy ?? '',
    params.gatePassNo ?? '',
    params.dateFrom ?? '',
    params.dateTo ?? '',
  ] as const;
}

/** GET error shape (e.g. 401): { success, error: { code, message } } */
type GetGradingGatePassesError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

function getFetchErrorMessage(
  data: GetGradingGatePassesError | undefined
): string {
  return (
    data?.error?.message ??
    data?.message ??
    'Failed to fetch grading gate passes'
  );
}

/** Fetcher used by queryOptions and prefetch */
async function fetchGradingGatePasses(
  params: GetGradingGatePassesParams = {}
): Promise<GradingGatePassesResult> {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.sortOrder != null) searchParams.set('sortOrder', params.sortOrder);
  if (params.sortBy != null) searchParams.set('sortBy', params.sortBy);
  if (params.gatePassNo != null)
    searchParams.set('gatePassNo', String(params.gatePassNo));
  if (params.dateFrom != null) searchParams.set('dateFrom', params.dateFrom);
  if (params.dateTo != null) searchParams.set('dateTo', params.dateTo);

  const queryString = searchParams.toString();
  const url = queryString
    ? `/grading-gate-pass?${queryString}`
    : '/grading-gate-pass';

  try {
    const { data } = await storeAdminAxiosClient.get<
      GetGradingGatePassesApiResponse | GetGradingGatePassesError
    >(url);

    if (!data.success || !('data' in data) || data.data == null) {
      throw new Error(getFetchErrorMessage(data));
    }

    const payload = data.data as GetGradingGatePassesData;
    const list = Array.isArray(payload.gradingGatePasses)
      ? payload.gradingGatePasses
      : [];
    const pagination =
      payload.pagination &&
      typeof payload.pagination === 'object' &&
      'totalPages' in payload.pagination
        ? (payload.pagination as GradingGatePassPagination)
        : {
            page: 1,
            limit: list.length,
            total: list.length,
            totalPages: 1,
          };

    return { list, pagination };
  } catch (err) {
    const responseData =
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { data?: GetGradingGatePassesError } }).response
        ?.data;
    if (responseData && typeof responseData === 'object') {
      throw new Error(getFetchErrorMessage(responseData));
    }
    throw err;
  }
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const gradingGatePassesQueryOptions = (
  params: GetGradingGatePassesParams = {}
) =>
  queryOptions({
    queryKey: listKey(params),
    queryFn: () => fetchGradingGatePasses(params),
  });

/** Hook to fetch grading gate passes with optional pagination and search */
export function useGetGradingGatePasses(
  params: GetGradingGatePassesParams = {}
) {
  return useQuery(gradingGatePassesQueryOptions(params));
}

/** Prefetch grading gate passes – e.g. on route hover or before navigation */
export function prefetchGradingGatePasses(
  params: GetGradingGatePassesParams = {}
) {
  return queryClient.prefetchQuery(gradingGatePassesQueryOptions(params));
}
