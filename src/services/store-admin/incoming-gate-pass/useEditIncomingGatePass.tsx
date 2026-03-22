import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  EditIncomingGatePassInput,
  EditIncomingGatePassApiResponse,
} from '@/types/incoming-gate-pass';
import { daybookKeys } from '../grading-gate-pass/useGetDaybook';
import { incomingGatePassKeys } from './useCreateIncomingGatePass';

/** API error shape (400, 404, 409): { success, error: { code, message } } */
type IncomingGatePassApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to update incoming gate pass';

function getIncomingGatePassErrorMessage(
  data: IncomingGatePassApiError | undefined
): string {
  return data?.error?.message ?? data?.message ?? DEFAULT_ERROR_MESSAGE;
}

/** Variables for the edit mutation: id + body fields */
export type EditIncomingGatePassVariables = {
  incomingGatePassId: string;
} & EditIncomingGatePassInput;

/**
 * Hook to edit an incoming gate pass.
 * PUT /incoming-gate-pass/:id
 */
export function useEditIncomingGatePass() {
  return useMutation<
    EditIncomingGatePassApiResponse,
    AxiosError<IncomingGatePassApiError>,
    EditIncomingGatePassVariables
  >({
    mutationKey: [...incomingGatePassKeys.all, 'edit'],

    mutationFn: async ({ incomingGatePassId, ...payload }) => {
      const { data } =
        await storeAdminAxiosClient.put<EditIncomingGatePassApiResponse>(
          `/incoming-gate-pass/${incomingGatePassId}`,
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      const isSuccess = data.success !== false;
      if (isSuccess) {
        toast.success(
          data.message ?? 'Incoming gate pass updated successfully'
        );
        queryClient.invalidateQueries({ queryKey: daybookKeys.all });
        queryClient.invalidateQueries({ queryKey: incomingGatePassKeys.all });
      } else {
        toast.error(data.message ?? DEFAULT_ERROR_MESSAGE);
      }
    },

    onError: (error) => {
      const errMsg =
        error.response?.data !== undefined
          ? getIncomingGatePassErrorMessage(error.response.data)
          : error.message || DEFAULT_ERROR_MESSAGE;
      toast.error(errMsg);
    },
  });
}
