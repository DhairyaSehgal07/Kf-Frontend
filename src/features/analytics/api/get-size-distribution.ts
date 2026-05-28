import apiClient, { getApiErrorMessage } from "@/lib/api-client"

import type { AnalyticsDateParams } from "../types"

type SizeDistributionResponse = {
  success: boolean
  data: unknown
  message?: string
}

export function sizeDistributionQueryKey(params: AnalyticsDateParams) {
  return [
    "analytics",
    "size-distribution",
    params.dateFrom ?? null,
    params.dateTo ?? null,
  ] as const
}

export async function getSizeDistribution(
  params: AnalyticsDateParams = {},
): Promise<unknown> {
  const query: Record<string, string> = {}
  if (params.dateFrom) query.dateFrom = params.dateFrom
  if (params.dateTo) query.dateTo = params.dateTo

  try {
    const { data } = await apiClient.get<SizeDistributionResponse>(
      "/analytics/size-distribution",
      { params: query },
    )

    if (!data.success) {
      throw new Error(data.message ?? "Failed to load size distribution")
    }

    return data.data
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to load size distribution"),
      { cause: error },
    )
  }
}
