import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetGradingGatePassesApiResponse,
  GradingGatePass,
} from '@/types/grading-gate-pass';

/** Query key prefix for grading gate pass – use for invalidation */
export const gradingGatePassKeys = {
  all: ['store-admin', 'grading-gate-pass'] as const,
};

/** Query key for the list of grading gate passes */
const gradingGatePassListKey = [...gradingGatePassKeys.all, 'list'] as const;

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
async function fetchGradingGatePasses(): Promise<GradingGatePass[]> {
  try {
    const { data } = await storeAdminAxiosClient.get<
      GetGradingGatePassesApiResponse | GetGradingGatePassesError
    >('/grading-gate-pass');

    if (!data.success || !('data' in data) || data.data == null) {
      throw new Error(getFetchErrorMessage(data));
    }

    return data.data;
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
export const gradingGatePassesQueryOptions = () =>
  queryOptions({
    queryKey: gradingGatePassListKey,
    queryFn: fetchGradingGatePasses,
  });

/** Hook to fetch all grading gate passes */
export function useGetGradingGatePasses() {
  return useQuery(gradingGatePassesQueryOptions());
}

/** Prefetch grading gate passes – e.g. on route hover or before navigation */
export function prefetchGradingGatePasses() {
  return queryClient.prefetchQuery(gradingGatePassesQueryOptions());
}
