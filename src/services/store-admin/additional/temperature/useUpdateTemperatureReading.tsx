import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  UpdateTemperatureReadingInput,
  UpdateTemperatureReadingApiResponse,
} from '@/types/temperature';
import { temperatureKeys } from './useGetTemperatureReadings';

/** Mutation input: id (path param) + optional body fields */
export type UpdateTemperatureReadingVariables = {
  id: string;
} & UpdateTemperatureReadingInput;

/** API error shape (400, 401, 403, 404): { success, error?: { code, message } } */
type UpdateTemperatureApiError = {
  message?: string;
  error?: { code?: string; message?: string };
};

function getUpdateTemperatureErrorMessage(
  data: UpdateTemperatureApiError | undefined
): string {
  return (
    data?.error?.message ??
    data?.message ??
    'Failed to update temperature reading'
  );
}

/**
 * Hook to update a temperature reading.
 * PUT /temperature/:id
 * Body: at least one of { chamber, runningTemperature, date }
 */
export function useUpdateTemperatureReading() {
  return useMutation<
    UpdateTemperatureReadingApiResponse,
    AxiosError<UpdateTemperatureApiError>,
    UpdateTemperatureReadingVariables
  >({
    mutationKey: [...temperatureKeys.all, 'update'],

    mutationFn: async ({ id, ...body }) => {
      const { data } =
        await storeAdminAxiosClient.put<UpdateTemperatureReadingApiResponse>(
          `/temperature/${id}`,
          body
        );
      return data;
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          data.message ?? 'Temperature reading updated successfully'
        );
        queryClient.invalidateQueries({ queryKey: temperatureKeys.all });
      } else {
        toast.error(data.message ?? 'Failed to update temperature reading');
      }
    },

    onError: (error) => {
      const errMsg = error.response?.data
        ? getUpdateTemperatureErrorMessage(error.response.data)
        : error.message || 'Failed to update temperature reading';
      toast.error(errMsg);
    },
  });
}
