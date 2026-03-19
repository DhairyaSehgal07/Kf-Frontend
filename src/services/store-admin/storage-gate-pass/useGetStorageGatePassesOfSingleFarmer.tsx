import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetStorageGatePassesByFarmerData,
  StorageGatePassWithLink,
} from '@/types/storage-gate-pass';
import { storageGatePassKeys } from './useGetStorageGatePasses';

/** Query key for storage gate passes of a single farmer (by farmer-storage-link id) */
export const storageGatePassesByFarmerKey = (farmerStorageLinkId: string) =>
  [
    ...storageGatePassKeys.all,
    'farmer-storage-link',
    farmerStorageLinkId,
  ] as const;

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
    'Failed to fetch storage gate passes for farmer'
  );
}

/** Fetcher used by queryOptions and prefetch */
async function fetchStorageGatePassesByFarmer(
  farmerStorageLinkId: string
): Promise<StorageGatePassWithLink[]> {
  try {
    const { data } = await storeAdminAxiosClient.get<
      | { success: true; data: GetStorageGatePassesByFarmerData }
      | GetStorageGatePassesError
    >(`/storage-gate-pass/farmer-storage-link/${farmerStorageLinkId}`);

    if (!data.success || !('data' in data) || data.data == null) {
      throw new Error(getFetchErrorMessage(data));
    }

    return data.data.storageGatePasses;
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
export function storageGatePassesByFarmerQueryOptions(
  farmerStorageLinkId: string
) {
  return queryOptions({
    queryKey: storageGatePassesByFarmerKey(farmerStorageLinkId),
    queryFn: () => fetchStorageGatePassesByFarmer(farmerStorageLinkId),
    enabled: Boolean(farmerStorageLinkId),
    refetchOnMount: 'always',
  });
}

/** Hook to fetch storage gate passes for a single farmer (by farmer-storage-link id) */
export function useGetStorageGatePassesOfSingleFarmer(
  farmerStorageLinkId: string
) {
  return useQuery(storageGatePassesByFarmerQueryOptions(farmerStorageLinkId));
}

/** Prefetch storage gate passes for a farmer – e.g. before opening storage form */
export function prefetchStorageGatePassesOfSingleFarmer(
  farmerStorageLinkId: string
) {
  return queryClient.prefetchQuery(
    storageGatePassesByFarmerQueryOptions(farmerStorageLinkId)
  );
}
