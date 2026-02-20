import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  CreateTemperatureReadingInput,
  CreateTemperatureReadingApiResponse,
} from '@/types/temperature';
import { temperatureKeys } from './useGetTemperatureReadings';

/** API error shape (400, 401, 404): { success, error?: { code, message } } */
type CreateTemperatureApiError = {
  message?: string;
  error?: { code?: string; message?: string };
};

function getCreateTemperatureErrorMessage(
  data: CreateTemperatureApiError | undefined
): string {
  return (
    data?.error?.message ??
    data?.message ??
    'Failed to create temperature reading'
  );
}

/**
 * Hook to create a temperature reading.
 * POST /temperature
 * Body: { date, temperatureReading: [{ chamber, value }, ...] }
 */
export function useCreateTemperatureReading() {
  return useMutation<
    CreateTemperatureReadingApiResponse,
    AxiosError<CreateTemperatureApiError>,
    CreateTemperatureReadingInput
  >({
    mutationKey: [...temperatureKeys.all, 'create'],

    mutationFn: async (payload) => {
      const { data } =
        await storeAdminAxiosClient.post<CreateTemperatureReadingApiResponse>(
          '/temperature',
          payload
        );
      return data;
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          data.message ?? 'Temperature reading created successfully'
        );
        queryClient.invalidateQueries({ queryKey: temperatureKeys.all });
      } else {
        toast.error(data.message ?? 'Failed to create temperature reading');
      }
    },

    onError: (error) => {
      const errMsg = error.response?.data
        ? getCreateTemperatureErrorMessage(error.response.data)
        : error.message || 'Failed to create temperature reading';
      toast.error(errMsg);
    },
  });
}
