import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  UpdateFarmerStorageLinkInput,
  UpdateFarmerStorageLinkApiResponse,
} from '@/types/farmer';
import { farmerStorageLinksKeys } from './useGetAllFarmers';

/** Mutation variables: farmer-storage-link id (path) + body */
export type EditFarmerVariables = {
  id: string;
} & UpdateFarmerStorageLinkInput;

/** API error shape (400, 404, 409): { success, error: { code, message } } */
type EditFarmerApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to update farmer';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  404: 'Farmer-storage-link not found',
  409: 'Conflict - resource already exists',
};

function getEditFarmerErrorMessage(
  data: EditFarmerApiError | undefined,
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
 * Hook to update a farmer-storage-link and associated farmer.
 * PUT /store-admin/farmer-storage-link/:id
 * Body fields aligned with QuickRegisterFarmerInput: name, address, mobileNumber,
 * accountNumber, linkedById, plus optional aadharCardNumber, panCardNumber, costPerBag.
 * On success invalidates farmer-storage-links so the list refetches.
 * Handles 400, 404, 409 and shows API error message in toast.
 */
export function useEditFarmer() {
  return useMutation<
    UpdateFarmerStorageLinkApiResponse,
    AxiosError<EditFarmerApiError>,
    EditFarmerVariables
  >({
    mutationKey: ['store-admin', 'farmer-storage-link', 'update'],

    mutationFn: async ({ id, ...payload }) => {
      const { data } =
        await storeAdminAxiosClient.put<UpdateFarmerStorageLinkApiResponse>(
          `/store-admin/farmer-storage-link/${id}`,
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message ?? 'Farmer updated successfully');
        queryClient.invalidateQueries({ queryKey: farmerStorageLinksKeys.all });
      } else {
        toast.error(data.message ?? DEFAULT_ERROR_MESSAGE);
      }
    },

    onError: (error) => {
      const status = error.response?.status;
      const errMsg =
        error.response?.data !== undefined
          ? getEditFarmerErrorMessage(
              error.response.data as EditFarmerApiError,
              status
            )
          : status !== undefined && status in STATUS_ERROR_MESSAGES
            ? STATUS_ERROR_MESSAGES[status]
            : error.message || DEFAULT_ERROR_MESSAGE;
      toast.error(errMsg);
    },
  });
}
