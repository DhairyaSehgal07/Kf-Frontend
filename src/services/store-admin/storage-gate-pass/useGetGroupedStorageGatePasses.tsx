import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetGroupedStorageGatePassesApiResponse,
  GroupedStorageGatePassGroup,
} from '@/types/storage-gate-pass';

/** Query key prefix for grouped storage gate pass – use for invalidation */
export const groupedStorageGatePassKeys = {
  all: ['store-admin', 'storage-gate-pass', 'grouped'] as const,
};

/** Query key for the grouped list */
const groupedStorageGatePassListKey = [
  ...groupedStorageGatePassKeys.all,
  'list',
] as const;

/** GET error shape (e.g. 401): { success, error: { code, message } } */
type GetGroupedStorageGatePassesError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

function getFetchErrorMessage(
  data: GetGroupedStorageGatePassesError | undefined
): string {
  return (
    data?.error?.message ??
    data?.message ??
    'Failed to fetch grouped storage gate passes'
  );
}

/** Fetcher used by queryOptions and prefetch */
async function fetchGroupedStorageGatePasses(): Promise<
  GroupedStorageGatePassGroup[]
> {
  try {
    const { data } = await storeAdminAxiosClient.get<
      GetGroupedStorageGatePassesApiResponse | GetGroupedStorageGatePassesError
    >('/storage-gate-pass/grouped');

    if (!data.success || !('data' in data) || data.data == null) {
      throw new Error(getFetchErrorMessage(data));
    }

    return data.data;
  } catch (err) {
    const responseData =
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { data?: GetGroupedStorageGatePassesError } })
        .response?.data;
    if (responseData && typeof responseData === 'object') {
      throw new Error(getFetchErrorMessage(responseData));
    }
    throw err;
  }
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const groupedStorageGatePassesQueryOptions = () =>
  queryOptions({
    queryKey: groupedStorageGatePassListKey,
    queryFn: fetchGroupedStorageGatePasses,
  });

/** Hook to fetch storage gate passes grouped by manualGatePassNumber and date */
export function useGetGroupedStorageGatePasses() {
  return useQuery(groupedStorageGatePassesQueryOptions());
}

/** Prefetch grouped storage gate passes – e.g. on route hover or before navigation */
export function prefetchGroupedStorageGatePasses() {
  return queryClient.prefetchQuery(groupedStorageGatePassesQueryOptions());
}
