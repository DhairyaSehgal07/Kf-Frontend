import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  QuickRegisterFarmerInput,
  QuickRegisterFarmerApiResponse,
} from '@/types/farmer';
import { farmerStorageLinksKeys } from './useGetAllFarmers';

/**
 * Hook to quick-register a farmer and create a farmer–storage link in one call.
 * POST /store-admin/quick-register-farmer
 * On success invalidates farmer-storage-links so the list refetches.
 */
export function useQuickAddFarmer() {
  return useMutation<
    QuickRegisterFarmerApiResponse,
    AxiosError<{ message?: string }>,
    QuickRegisterFarmerInput
  >({
    mutationKey: ['store-admin', 'quick-register-farmer'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<QuickRegisterFarmerApiResponse>(
          '/store-admin/quick-register-farmer',
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message ?? 'Farmer registered successfully');
        queryClient.invalidateQueries({ queryKey: farmerStorageLinksKeys.all });
      } else {
        toast.error(data.message ?? 'Failed to register farmer');
      }
    },

    onError: (error) => {
      const errMsg =
        error.response?.data?.message ??
        error.message ??
        'Failed to register farmer';
      toast.error(errMsg);
    },
  });
}
