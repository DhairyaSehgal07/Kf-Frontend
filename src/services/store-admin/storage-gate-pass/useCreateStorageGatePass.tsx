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
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to create storage gate pass';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  404: 'Grading gate pass not found',
  409: 'Gate pass number already exists',
};

function getStorageGatePassErrorMessage(
  data: StorageGatePassApiError | undefined,
  status?: number
): string {
  const fromBody =
    data?.error?.message ??
    data?.message ??
    (status !== undefined && status in STATUS_ERROR_MESSAGES
      ? STATUS_ERROR_MESSAGES[status]
      : null);
  return fromBody ?? DEFAULT_ERROR_MESSAGE;
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
        toast.error(data.message ?? DEFAULT_ERROR_MESSAGE);
      }
    },

    onError: (error) => {
      const status = error.response?.status;
      const errMsg =
        error.response?.data !== undefined
          ? getStorageGatePassErrorMessage(
              error.response.data as StorageGatePassApiError,
              status
            )
          : status !== undefined && status in STATUS_ERROR_MESSAGES
            ? STATUS_ERROR_MESSAGES[status]
            : error.message || DEFAULT_ERROR_MESSAGE;
      toast.error(errMsg);
    },
  });
}
