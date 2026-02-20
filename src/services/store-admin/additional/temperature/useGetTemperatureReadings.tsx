import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import type {
  GetTemperatureReadingsApiResponse,
  TemperatureReading,
} from '@/types/temperature';

/** Query key prefix for temperature readings */
export const temperatureKeys = {
  all: ['store-admin', 'additional', 'temperature'] as const,
};

const temperatureListKey = [...temperatureKeys.all, 'list'] as const;

async function fetchTemperatureReadings(): Promise<TemperatureReading[]> {
  const { data } =
    await storeAdminAxiosClient.get<GetTemperatureReadingsApiResponse>(
      '/temperature'
    );

  if (!data.success || data.data == null) {
    throw new Error(data.message ?? 'Failed to fetch temperature readings');
  }

  return data.data;
}

/** Query options – use with useQuery, prefetchQuery, or in loaders */
export const temperatureReadingsQueryOptions = () =>
  queryOptions({
    queryKey: temperatureListKey,
    queryFn: fetchTemperatureReadings,
  });

/** Hook to fetch temperature readings */
export function useGetTemperatureReadings() {
  return useQuery(temperatureReadingsQueryOptions());
}

/** Prefetch temperature readings – e.g. on route hover or before navigation */
export function prefetchTemperatureReadings() {
  return queryClient.prefetchQuery(temperatureReadingsQueryOptions());
}
