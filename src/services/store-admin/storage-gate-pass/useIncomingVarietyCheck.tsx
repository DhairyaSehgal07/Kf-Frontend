import { useQuery, queryOptions } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import { storageGatePassKeys } from './useGetStorageGatePasses';

type IncomingVarietiesData = {
  varieties: string[];
};

type IncomingVarietiesApiResponse = {
  success: boolean;
  data: IncomingVarietiesData | null;
  message?: string;
};

type IncomingVarietiesApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Failed to fetch incoming varieties';

function getIncomingVarietiesErrorMessage(
  data: IncomingVarietiesApiError | undefined
): string {
  return data?.error?.message ?? data?.message ?? DEFAULT_ERROR_MESSAGE;
}

/** Query key prefix for incoming variety list */
export const incomingVarietyCheckKeys = {
  all: [...storageGatePassKeys.all, 'incoming-varieties'] as const,
};

/** Fetch incoming potato varieties from API */
async function fetchIncomingVarieties(): Promise<IncomingVarietiesData> {
  const { data } =
    await storeAdminAxiosClient.get<IncomingVarietiesApiResponse>(
      '/storage-gate-pass/incoming-varieties'
    );

  if (!data.success || data.data?.varieties == null) {
    throw new Error(getIncomingVarietiesErrorMessage(data as never));
  }

  return data.data;
}

/** Query options for incoming varieties */
export const incomingVarietiesQueryOptions = () =>
  queryOptions({
    queryKey: [...incomingVarietyCheckKeys.all] as const,
    queryFn: fetchIncomingVarieties,
  });

/**
 * Hook to fetch incoming varieties, and optionally check whether a given
 * variety exists in the incoming list.
 */
export function useIncomingVarietyCheck(
  variety?: string,
  options?: { enabled?: boolean }
) {
  const query = useQuery({
    ...incomingVarietiesQueryOptions(),
    enabled: options?.enabled ?? true,
  });

  const trimmedVariety = variety?.trim();
  const isValidVariety =
    trimmedVariety && query.data?.varieties
      ? query.data.varieties.includes(trimmedVariety)
      : undefined;

  return {
    ...query,
    varieties: query.data?.varieties ?? [],
    isValidVariety,
  };
}

/** Prefetch incoming varieties */
export function prefetchIncomingVarietyCheck() {
  return queryClient.prefetchQuery(incomingVarietiesQueryOptions());
}
