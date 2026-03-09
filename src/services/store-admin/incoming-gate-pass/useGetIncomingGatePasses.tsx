import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetIncomingGatePassesApiResponse,
  GetIncomingGatePassesParams,
  IncomingGatePassPagination,
  IncomingGatePassWithLink,
} from '@/types/incoming-gate-pass';
import { incomingGatePassKeys } from './useCreateIncomingGatePass';

export interface IncomingGatePassesResult {
  list: IncomingGatePassWithLink[];
  pagination: IncomingGatePassPagination;
}

/** Query key for the list of incoming gate passes */
const incomingGatePassListKey = [...incomingGatePassKeys.all, 'list'] as const;

function listKey(params: GetIncomingGatePassesParams = {}) {
  return [
    ...incomingGatePassListKey,
    params.page,
    params.limit,
    params.sortOrder,
    params.gatePassNo ?? '',
    params.status ?? '',
    params.dateFrom ?? '',
    params.dateTo ?? '',
  ] as const;
}

/** Default pagination when API returns only a list */
function defaultPagination(
  list: IncomingGatePassWithLink[]
): IncomingGatePassPagination {
  return {
    page: 1,
    limit: list.length,
    total: list.length,
    totalPages: 1,
  };
}

/** Fetcher used by queryOptions and prefetch */
async function fetchIncomingGatePasses(
  params: GetIncomingGatePassesParams = {}
): Promise<IncomingGatePassesResult> {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.sortOrder != null) searchParams.set('sortOrder', params.sortOrder);
  if (params.gatePassNo != null)
    searchParams.set('gatePassNo', String(params.gatePassNo));
  if (params.status != null) searchParams.set('status', params.status);
  if (params.dateFrom != null) searchParams.set('dateFrom', params.dateFrom);
  if (params.dateTo != null) searchParams.set('dateTo', params.dateTo);

  const queryString = searchParams.toString();
  const url = queryString
    ? `/incoming-gate-pass?${queryString}`
    : '/incoming-gate-pass';

  const { data } =
    await storeAdminAxiosClient.get<GetIncomingGatePassesApiResponse>(url);

  if (!data.success || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch incoming gate passes');
  }

  const payload = data.data;
  if (Array.isArray(payload)) {
    return { list: payload, pagination: defaultPagination(payload) };
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    let list: unknown =
      obj.incomingGatePasses ??
      obj.data ??
      obj.results ??
      obj.docs ??
      obj.items ??
      obj.document ??
      obj.list;
    if (Array.isArray(list)) {
      const arr = list as IncomingGatePassWithLink[];
      const pagination =
        obj.pagination &&
        typeof obj.pagination === 'object' &&
        'total' in (obj.pagination as object)
          ? (obj.pagination as IncomingGatePassPagination)
          : defaultPagination(arr);
      return { list: arr, pagination };
    }
    if (list && typeof list === 'object' && !Array.isArray(list)) {
      const inner = list as Record<string, unknown>;
      list =
        inner.data ??
        inner.results ??
        inner.docs ??
        inner.items ??
        inner.document ??
        inner.list;
      if (Array.isArray(list)) {
        const arr = list as IncomingGatePassWithLink[];
        return { list: arr, pagination: defaultPagination(arr) };
      }
    }
  }
  return { list: [], pagination: defaultPagination([]) };
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const incomingGatePassesQueryOptions = (
  params: GetIncomingGatePassesParams = {}
) =>
  queryOptions({
    queryKey: listKey(params),
    queryFn: () => fetchIncomingGatePasses(params),
  });

/** Hook to fetch incoming gate passes with optional pagination and search */
export function useGetIncomingGatePasses(
  params: GetIncomingGatePassesParams = {}
) {
  return useQuery(incomingGatePassesQueryOptions(params));
}

/** Prefetch incoming gate passes – e.g. on route hover or before navigation */
export function prefetchIncomingGatePasses(
  params: GetIncomingGatePassesParams = {}
) {
  return queryClient.prefetchQuery(incomingGatePassesQueryOptions(params));
}
