import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetIncomingGatePassesApiResponse,
  GetIncomingGatePassesParams,
  IncomingGatePassWithLink,
} from '@/types/incoming-gate-pass';
import { incomingGatePassKeys } from './useCreateIncomingGatePass';

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
  ] as const;
}

/** Fetcher used by queryOptions and prefetch */
async function fetchIncomingGatePasses(
  params: GetIncomingGatePassesParams = {}
): Promise<IncomingGatePassWithLink[]> {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.sortOrder != null) searchParams.set('sortOrder', params.sortOrder);
  if (params.gatePassNo != null)
    searchParams.set('gatePassNo', String(params.gatePassNo));
  if (params.status != null) searchParams.set('status', params.status);

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
  if (Array.isArray(payload)) return payload;
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
    if (Array.isArray(list)) return list as IncomingGatePassWithLink[];
    if (list && typeof list === 'object' && !Array.isArray(list)) {
      const inner = list as Record<string, unknown>;
      list =
        inner.data ??
        inner.results ??
        inner.docs ??
        inner.items ??
        inner.document ??
        inner.list;
      if (Array.isArray(list)) return list as IncomingGatePassWithLink[];
    }
  }
  return [];
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
