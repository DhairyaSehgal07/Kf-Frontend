import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  CreateRentalIncomingGatePassInput,
  CreateRentalIncomingGatePassApiResponse,
} from '@/types/rental-incoming-gate-pass';
import { rentalIncomingGatePassKeys } from './useGetRentalIncomingGatePasses';

/** API error shape (400, 404, 409): { success, error: { code, message } } */
type RentalIncomingGatePassApiError = {
  message?: string;
  error?: { code?: string; message?: string };
};

function getRentalIncomingGatePassErrorMessage(
  data: RentalIncomingGatePassApiError | undefined
): string {
  return (
    data?.error?.message ??
    data?.message ??
    'Failed to create rental incoming gate pass'
  );
}

/**
 * Hook to create a rental incoming gate pass.
 * POST /rental-storage-gate-pass
 * Body: farmerStorageLinkId, date, variety, bagSizes (name, initialQuantity, currentQuantity, location).
 */
export function useCreateRentalIncomingGatePass() {
  return useMutation<
    CreateRentalIncomingGatePassApiResponse,
    AxiosError<RentalIncomingGatePassApiError>,
    CreateRentalIncomingGatePassInput
  >({
    mutationKey: [...rentalIncomingGatePassKeys.all, 'create'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<CreateRentalIncomingGatePassApiResponse>(
          '/rental-storage-gate-pass',
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          data.message ?? 'Rental incoming gate pass created successfully'
        );
        queryClient.invalidateQueries({
          queryKey: rentalIncomingGatePassKeys.all,
        });
      } else {
        toast.error(
          data.message ?? 'Failed to create rental incoming gate pass'
        );
      }
    },

    onError: (error) => {
      const errMsg =
        error.response?.data !== undefined
          ? getRentalIncomingGatePassErrorMessage(error.response.data)
          : (error.message ?? 'Failed to create rental incoming gate pass');
      toast.error(errMsg);
    },
  });
}
