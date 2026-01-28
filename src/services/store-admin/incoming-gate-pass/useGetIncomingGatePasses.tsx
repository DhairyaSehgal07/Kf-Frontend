import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetIncomingGatePassesApiResponse,
  IncomingGatePassWithLink,
} from '@/types/incoming-gate-pass';
import { incomingGatePassKeys } from './useCreateIncomingGatePass';

/** Query key for the list of incoming gate passes */
const incomingGatePassListKey = [...incomingGatePassKeys.all, 'list'] as const;

/** Fetcher used by queryOptions and prefetch */
async function fetchIncomingGatePasses(): Promise<IncomingGatePassWithLink[]> {
  const { data } =
    await storeAdminAxiosClient.get<GetIncomingGatePassesApiResponse>(
      '/incoming-gate-pass'
    );

  if (!data.success || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch incoming gate passes');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const incomingGatePassesQueryOptions = () =>
  queryOptions({
    queryKey: incomingGatePassListKey,
    queryFn: fetchIncomingGatePasses,
  });

/** Hook to fetch all incoming gate passes */
export function useGetIncomingGatePasses() {
  return useQuery(incomingGatePassesQueryOptions());
}

/** Prefetch incoming gate passes – e.g. on route hover or before navigation */
export function prefetchIncomingGatePasses() {
  return queryClient.prefetchQuery(incomingGatePassesQueryOptions());
}
