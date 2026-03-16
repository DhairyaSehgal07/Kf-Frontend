import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  EditStorageGatePassInput,
  EditStorageGatePassApiResponse,
} from '@/types/storage-gate-pass';
import { storageGatePassKeys } from './useGetStorageGatePasses';
import { daybookKeys } from '../grading-gate-pass/useGetDaybook';
import { gradingGatePassKeys } from '../grading-gate-pass/useGetGradingGatePasses';

/** API error shape (400, 404, 409): { success, error: { code, message } } */
type StorageGatePassApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to update storage gate pass';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  404: 'Storage gate pass not found',
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

/** Variables for the edit mutation: id + body fields */
export type EditStorageGatePassVariables = {
  storageGatePassId: string;
} & EditStorageGatePassInput;

/**
 * Hook to edit a storage gate pass.
 * PUT /storage-gate-pass/:id
 * Payload may include optional manualGatePassNumber, storageCategory, and date.
 */
export function useEditStorageGatePass() {
  return useMutation<
    EditStorageGatePassApiResponse,
    AxiosError<StorageGatePassApiError>,
    EditStorageGatePassVariables
  >({
    mutationKey: [...storageGatePassKeys.all, 'edit'],

    mutationFn: async ({ storageGatePassId, ...payload }) => {
      const { data } =
        await storeAdminAxiosClient.put<EditStorageGatePassApiResponse>(
          `/storage-gate-pass/${storageGatePassId}`,
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      const isSuccess = data.success !== false;
      if (isSuccess) {
        toast.success('Storage gate pass updated successfully');
        queryClient.invalidateQueries({ queryKey: daybookKeys.all });
        queryClient.invalidateQueries({ queryKey: storageGatePassKeys.all });
        queryClient.invalidateQueries({ queryKey: gradingGatePassKeys.all });
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
