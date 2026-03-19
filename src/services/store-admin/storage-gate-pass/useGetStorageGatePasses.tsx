import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetStorageGatePassesApiResponse,
  GetStorageGatePassesListData,
  GetStorageGatePassesParams,
  StorageGatePassPagination,
  StorageGatePassWithLink,
} from '@/types/storage-gate-pass';

/** Query key prefix for storage gate pass – use for invalidation */
export const storageGatePassKeys = {
  all: ['store-admin', 'storage-gate-pass'] as const,
};

/** Query key for the list of storage gate passes */
const storageGatePassListKey = [...storageGatePassKeys.all, 'list'] as const;

function listKey(params: GetStorageGatePassesParams = {}) {
  return [
    ...storageGatePassListKey,
    params.page,
    params.limit,
    params.sortOrder,
    params.sortBy ?? '',
    params.gatePassNo ?? '',
    params.dateFrom ?? '',
    params.dateTo ?? '',
    params.variety ?? '',
  ] as const;
}

export interface StorageGatePassesResult {
  list: StorageGatePassWithLink[];
  pagination: StorageGatePassPagination;
}

/** Default pagination when API returns only a list */
function defaultPagination(
  list: StorageGatePassWithLink[]
): StorageGatePassPagination {
  return {
    page: 1,
    limit: list.length,
    total: list.length,
    totalPages: 1,
  };
}

/** GET error shape (e.g. 401): { success, error: { code, message } } */
type GetStorageGatePassesError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

function getFetchErrorMessage(
  data: GetStorageGatePassesError | undefined
): string {
  return (
    data?.error?.message ??
    data?.message ??
    'Failed to fetch storage gate passes'
  );
}

/** Fetcher used by queryOptions and prefetch */
async function fetchStorageGatePasses(
  params: GetStorageGatePassesParams = {}
): Promise<StorageGatePassesResult> {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.sortOrder != null) searchParams.set('sortOrder', params.sortOrder);
  if (params.sortBy != null) searchParams.set('sortBy', params.sortBy);
  if (params.gatePassNo != null)
    searchParams.set('gatePassNo', String(params.gatePassNo));
  if (params.dateFrom != null) searchParams.set('dateFrom', params.dateFrom);
  if (params.dateTo != null) searchParams.set('dateTo', params.dateTo);
  if (params.variety != null && params.variety !== '')
    searchParams.set('variety', params.variety);

  const queryString = searchParams.toString();
  const url = queryString
    ? `/storage-gate-pass?${queryString}`
    : '/storage-gate-pass';

  try {
    const { data } = await storeAdminAxiosClient.get<
      GetStorageGatePassesApiResponse | GetStorageGatePassesError
    >(url);

    if (!data.success || !('data' in data) || data.data == null) {
      throw new Error(getFetchErrorMessage(data));
    }

    const payload = data.data;

    if (Array.isArray(payload)) {
      return { list: payload, pagination: defaultPagination(payload) };
    }

    if (payload && typeof payload === 'object') {
      const obj = payload as Record<string, unknown> &
        Partial<GetStorageGatePassesListData>;
      const rawList =
        obj.storageGatePasses ??
        (Array.isArray(obj.data) ? obj.data : undefined);
      if (Array.isArray(rawList)) {
        const arr = rawList as StorageGatePassWithLink[];
        const pagination =
          obj.pagination &&
          typeof obj.pagination === 'object' &&
          'totalPages' in obj.pagination
            ? (obj.pagination as StorageGatePassPagination)
            : defaultPagination(arr);
        return { list: arr, pagination };
      }
    }

    return { list: [], pagination: defaultPagination([]) };
  } catch (err) {
    const responseData =
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { data?: GetStorageGatePassesError } }).response
        ?.data;
    if (responseData && typeof responseData === 'object') {
      throw new Error(getFetchErrorMessage(responseData));
    }
    throw err;
  }
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const storageGatePassesQueryOptions = (
  params: GetStorageGatePassesParams = {}
) =>
  queryOptions({
    queryKey: listKey(params),
    queryFn: () => fetchStorageGatePasses(params),
  });

/** Hook to fetch storage gate passes with optional pagination and filters */
export function useGetStorageGatePasses(
  params: GetStorageGatePassesParams = {}
) {
  return useQuery(storageGatePassesQueryOptions(params));
}

/** Prefetch storage gate passes – e.g. on route hover or before navigation */
export function prefetchStorageGatePasses(
  params: GetStorageGatePassesParams = {}
) {
  return queryClient.prefetchQuery(storageGatePassesQueryOptions(params));
}
