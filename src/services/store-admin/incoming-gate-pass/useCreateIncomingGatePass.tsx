import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  CreateIncomingGatePassInput,
  CreateIncomingGatePassApiResponse,
} from '@/types/incoming-gate-pass';

/** Query key prefix for incoming gate pass – use for invalidation */
export const incomingGatePassKeys = {
  all: ['store-admin', 'incoming-gate-pass'] as const,
};

/**
 * Hook to create an incoming gate pass.
 * POST /incoming-gate-pass
 */
export function useCreateIncomingGatePass() {
  return useMutation<
    CreateIncomingGatePassApiResponse,
    AxiosError<{ message?: string }>,
    CreateIncomingGatePassInput
  >({
    mutationKey: [...incomingGatePassKeys.all, 'create'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<CreateIncomingGatePassApiResponse>(
          '/incoming-gate-pass',
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          data.message ?? 'Incoming gate pass created successfully'
        );
        queryClient.invalidateQueries({ queryKey: incomingGatePassKeys.all });
      } else {
        toast.error(data.message ?? 'Failed to create incoming gate pass');
      }
    },

    onError: (error) => {
      const errMsg =
        error.response?.data?.message ??
        error.message ??
        'Failed to create incoming gate pass';
      toast.error(errMsg);
    },
  });
}
