import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  CreateBulkNikasiGatePassInput,
  CreateBulkNikasiGatePassApiResponse,
} from '@/types/nikasi-gate-pass';
import { nikasiGatePassKeys } from './useGetNikasiGatePasses';
import { daybookKeys } from '../grading-gate-pass/useGetDaybook';
import { gradingGatePassKeys } from '../grading-gate-pass/useGetGradingGatePasses';
import { gradingGatePassesByFarmerKey } from '../grading-gate-pass/useGetGradingPassesOfSingleFarmer';

/** API error shape (400, 404, 409): { status, statusCode, errorCode, message } */
type BulkNikasiGatePassApiError = {
  status?: string;
  statusCode?: number;
  errorCode?: string;
  message?: string;
};

function getBulkNikasiGatePassErrorMessage(
  data: BulkNikasiGatePassApiError | undefined
): string {
  return data?.message ?? 'Failed to create nikasi gate passes';
}

/**
 * Hook to create multiple nikasi gate passes in one request.
 * POST /nikasi-gate-pass/bulk
 * Body: { passes: CreateNikasiGatePassInput[] }
 */
export function useCreateBulkNikasiGatePasses() {
  return useMutation<
    CreateBulkNikasiGatePassApiResponse,
    AxiosError<BulkNikasiGatePassApiError>,
    CreateBulkNikasiGatePassInput
  >({
    mutationKey: [...nikasiGatePassKeys.all, 'createBulk'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<CreateBulkNikasiGatePassApiResponse>(
          '/nikasi-gate-pass/bulk',
          payload
        );
      return data;
    },

    onSuccess: (data, variables) => {
      if (data.status === 'Success') {
        toast.success(
          data.message ?? 'Nikasi gate passes created successfully'
        );
        queryClient.invalidateQueries({ queryKey: daybookKeys.all });
        queryClient.invalidateQueries({ queryKey: nikasiGatePassKeys.all });
        queryClient.invalidateQueries({ queryKey: gradingGatePassKeys.all });
        const uniqueFarmerLinkIds = [
          ...new Set(variables.passes.map((p) => p.farmerStorageLinkId)),
        ];
        uniqueFarmerLinkIds.forEach((farmerStorageLinkId) => {
          queryClient.invalidateQueries({
            queryKey: gradingGatePassesByFarmerKey(farmerStorageLinkId),
          });
        });
      } else {
        toast.error(data.message ?? 'Failed to create nikasi gate passes');
      }
    },

    onError: (error) => {
      const errMsg = error.response?.data
        ? getBulkNikasiGatePassErrorMessage(error.response.data)
        : (error.message ?? 'Failed to create nikasi gate passes');
      toast.error(errMsg);
    },
  });
}
