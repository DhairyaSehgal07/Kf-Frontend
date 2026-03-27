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
 * Payload supports:
 * - farmerStorageLinkId (optional, for relinking to a different farmer-storage account)
 * - gatePassNo, manualGatePassNumber, date, storageCategory, variety
 * - bagSizes[] entries: { size, bagType, currentQuantity, initialQuantity, chamber, floor, row }
 * - remarks and reason (both optional)
 *
 * Example:
 * curl -X PUT "http://localhost:3000/api/v1/storage-gate-pass/<STORAGE_GATE_PASS_ID>" \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
 *   -d '{
 *     "farmerStorageLinkId": "<NEW_FARMER_STORAGE_LINK_ID>",
 *     "gatePassNo": 1234,
 *     "manualGatePassNumber": 5678,
 *     "date": "2026-03-27T10:30:00.000Z",
 *     "storageCategory": "Cold Storage",
 *     "variety": "Kufri Jyoti",
 *     "bagSizes": [
 *       {
 *         "size": "50kg",
 *         "bagType": "JUTE",
 *         "currentQuantity": 100,
 *         "initialQuantity": 120,
 *         "chamber": "C1",
 *         "floor": "F1",
 *         "row": "R1"
 *       },
 *       {
 *         "size": "25kg",
 *         "bagType": "LENO",
 *         "currentQuantity": 40,
 *         "initialQuantity": 50,
 *         "chamber": "C2",
 *         "floor": "F1",
 *         "row": "R3"
 *       }
 *     ],
 *     "remarks": "Updated bag type, location, and link",
 *     "reason": "Corrected mapping to proper farmer storage link"
 *   }'
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
