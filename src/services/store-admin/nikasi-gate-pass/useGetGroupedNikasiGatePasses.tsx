import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetGroupedNikasiGatePassesApiResponse,
  GroupedNikasiGatePassGroup,
} from '@/types/nikasi-gate-pass';

/** Query key prefix for grouped nikasi gate pass – use for invalidation */
export const groupedNikasiGatePassKeys = {
  all: ['store-admin', 'nikasi-gate-pass', 'grouped'] as const,
};

/** Query key for the grouped list */
const groupedNikasiGatePassListKey = [
  ...groupedNikasiGatePassKeys.all,
  'list',
] as const;

/** GET error shape (e.g. 401): { success, error: { code, message } } */
type GetGroupedNikasiGatePassesError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

function getFetchErrorMessage(
  data: GetGroupedNikasiGatePassesError | undefined
): string {
  return (
    data?.error?.message ??
    data?.message ??
    'Failed to fetch grouped nikasi gate passes'
  );
}

/** Fetcher used by queryOptions and prefetch */
async function fetchGroupedNikasiGatePasses(): Promise<
  GroupedNikasiGatePassGroup[]
> {
  try {
    const { data } = await storeAdminAxiosClient.get<
      GetGroupedNikasiGatePassesApiResponse | GetGroupedNikasiGatePassesError
    >('/nikasi-gate-pass/grouped');

    if (!data.success || !('data' in data) || data.data == null) {
      throw new Error(getFetchErrorMessage(data));
    }

    return data.data;
  } catch (err) {
    const responseData =
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { data?: GetGroupedNikasiGatePassesError } })
        .response?.data;
    if (responseData && typeof responseData === 'object') {
      throw new Error(getFetchErrorMessage(responseData));
    }
    throw err;
  }
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const groupedNikasiGatePassesQueryOptions = () =>
  queryOptions({
    queryKey: groupedNikasiGatePassListKey,
    queryFn: fetchGroupedNikasiGatePasses,
  });

/** Hook to fetch nikasi (dispatch) gate passes grouped by manualGatePassNumber and date */
export function useGetGroupedNikasiGatePasses() {
  return useQuery(groupedNikasiGatePassesQueryOptions());
}

/** Prefetch grouped nikasi gate passes – e.g. on route hover or before navigation */
export function prefetchGroupedNikasiGatePasses() {
  return queryClient.prefetchQuery(groupedNikasiGatePassesQueryOptions());
}
