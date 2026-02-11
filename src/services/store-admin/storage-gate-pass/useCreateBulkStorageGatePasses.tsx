import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  CreateBulkStorageGatePassInput,
  CreateBulkStorageGatePassApiResponse,
} from '@/types/storage-gate-pass';
import { storageGatePassKeys } from './useGetStorageGatePasses';
import { daybookKeys } from '../grading-gate-pass/useGetDaybook';
import { gradingGatePassKeys } from '../grading-gate-pass/useGetGradingGatePasses';
import { gradingGatePassesByFarmerKey } from '../grading-gate-pass/useGetGradingPassesOfSingleFarmer';

/** API error shape (400, 404, 409): { status, statusCode, errorCode, message } */
type BulkStorageGatePassApiError = {
  status?: string;
  statusCode?: number;
  errorCode?: string;
  message?: string;
};

function getBulkStorageGatePassErrorMessage(
  data: BulkStorageGatePassApiError | undefined
): string {
  return data?.message ?? 'Failed to create storage gate passes';
}

/**
 * Hook to create multiple storage gate passes in one request.
 * POST /storage-gate-pass/bulk
 * Body: { passes: CreateStorageGatePassInput[] }
 */
export function useCreateBulkStorageGatePasses() {
  return useMutation<
    CreateBulkStorageGatePassApiResponse,
    AxiosError<BulkStorageGatePassApiError>,
    CreateBulkStorageGatePassInput
  >({
    mutationKey: [...storageGatePassKeys.all, 'createBulk'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<CreateBulkStorageGatePassApiResponse>(
          '/storage-gate-pass/bulk',
          payload
        );
      return data;
    },

    onSuccess: (data, variables) => {
      if (data.status === 'Success') {
        toast.success(
          data.message ?? 'Storage gate passes created successfully'
        );
        queryClient.invalidateQueries({ queryKey: daybookKeys.all });
        queryClient.invalidateQueries({ queryKey: storageGatePassKeys.all });
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
        toast.error(data.message ?? 'Failed to create storage gate passes');
      }
    },

    onError: (error) => {
      const errMsg = error.response?.data
        ? getBulkStorageGatePassErrorMessage(error.response.data)
        : (error.message ?? 'Failed to create storage gate passes');
      toast.error(errMsg);
    },
  });
}
