import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  CreateStorageGatePassInput,
  CreateStorageGatePassApiResponse,
} from '@/types/storage-gate-pass';
import { storageGatePassKeys } from './useGetStorageGatePasses';

/** API error shape (400, 404, 409): { success, error: { code, message } } */
type StorageGatePassApiError = {
  message?: string;
  error?: { code?: string; message?: string };
};

function getStorageGatePassErrorMessage(
  data: StorageGatePassApiError | undefined
): string {
  return (
    data?.error?.message ??
    data?.message ??
    'Failed to create storage gate pass'
  );
}

/**
 * Hook to create a storage gate pass.
 * POST /storage-gate-pass
 */
export function useCreateStorageGatePass() {
  return useMutation<
    CreateStorageGatePassApiResponse,
    AxiosError<StorageGatePassApiError>,
    CreateStorageGatePassInput
  >({
    mutationKey: [...storageGatePassKeys.all, 'create'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<CreateStorageGatePassApiResponse>(
          '/storage-gate-pass',
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message ?? 'Storage gate pass created successfully');
        queryClient.invalidateQueries({ queryKey: storageGatePassKeys.all });
      } else {
        toast.error(data.message ?? 'Failed to create storage gate pass');
      }
    },

    onError: (error) => {
      const errMsg = error.response?.data
        ? getStorageGatePassErrorMessage(error.response.data)
        : error.message || 'Failed to create storage gate pass';
      toast.error(errMsg);
    },
  });
}
