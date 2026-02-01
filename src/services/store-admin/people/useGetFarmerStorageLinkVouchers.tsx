import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetDaybookApiResponse,
  DaybookEntry,
  DaybookPagination,
} from '@/types/daybook';

/** Query key prefix for farmer storage link vouchers */
export const farmerStorageLinkVouchersKeys = {
  all: ['store-admin', 'farmer-storage-link-vouchers'] as const,
  lists: () => [...farmerStorageLinkVouchersKeys.all, 'list'] as const,
  list: (farmerStorageLinkId: string) =>
    [...farmerStorageLinkVouchersKeys.lists(), farmerStorageLinkId] as const,
};

async function fetchFarmerStorageLinkVouchers(
  farmerStorageLinkId: string
): Promise<{ daybook: DaybookEntry[]; pagination: DaybookPagination }> {
  const url = `/store-admin/farmer-storage-links/${encodeURIComponent(farmerStorageLinkId)}/vouchers`;

  const { data } = await storeAdminAxiosClient.get<GetDaybookApiResponse>(url);

  if (!data.success || data.data == null) {
    throw new Error(
      data.message ?? 'Failed to fetch farmer storage link vouchers'
    );
  }

  return data.data;
}

export const farmerStorageLinkVouchersQueryOptions = (
  farmerStorageLinkId: string
) =>
  queryOptions({
    queryKey: farmerStorageLinkVouchersKeys.list(farmerStorageLinkId),
    queryFn: () => fetchFarmerStorageLinkVouchers(farmerStorageLinkId),
    enabled: Boolean(farmerStorageLinkId),
  });

export function useGetFarmerStorageLinkVouchers(farmerStorageLinkId: string) {
  return useQuery(farmerStorageLinkVouchersQueryOptions(farmerStorageLinkId));
}

export function prefetchFarmerStorageLinkVouchers(farmerStorageLinkId: string) {
  return queryClient.prefetchQuery(
    farmerStorageLinkVouchersQueryOptions(farmerStorageLinkId)
  );
}
