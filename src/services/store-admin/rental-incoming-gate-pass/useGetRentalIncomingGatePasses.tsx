import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetRentalIncomingGatePassesApiResponse,
  RentalIncomingGatePass,
} from '@/types/rental-incoming-gate-pass';

/** Query key prefix for rental incoming gate pass – use for invalidation */
export const rentalIncomingGatePassKeys = {
  all: ['store-admin', 'rental-incoming-gate-pass'] as const,
};

const rentalIncomingGatePassListKey = [
  ...rentalIncomingGatePassKeys.all,
  'list',
] as const;

/**
 * GET /rental-storage-gate-pass response shape:
 * { success, data: RentalIncomingGatePass[] }
 */
async function fetchRentalIncomingGatePasses(): Promise<
  RentalIncomingGatePass[]
> {
  const { data } =
    await storeAdminAxiosClient.get<GetRentalIncomingGatePassesApiResponse>(
      '/rental-storage-gate-pass'
    );

  if (!data.success || data.data == null) {
    throw new Error('Failed to fetch rental storage gate passes');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const rentalIncomingGatePassesQueryOptions = () =>
  queryOptions({
    queryKey: rentalIncomingGatePassListKey,
    queryFn: fetchRentalIncomingGatePasses,
  });

/** Hook to fetch rental storage gate passes for the authenticated store */
export function useGetRentalIncomingGatePasses() {
  return useQuery(rentalIncomingGatePassesQueryOptions());
}

/** Prefetch rental storage gate passes – e.g. on route hover or before navigation */
export function prefetchRentalIncomingGatePasses() {
  return queryClient.prefetchQuery(rentalIncomingGatePassesQueryOptions());
}
