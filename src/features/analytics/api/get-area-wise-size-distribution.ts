import apiClient, { getApiErrorMessage } from "@/lib/api-client"

import type { AnalyticsDateParams } from "../types"

type AreaWiseSizeDistributionResponse = {
  success: boolean
  data: unknown
  message?: string
}

export function areaWiseSizeDistributionQueryKey(params: AnalyticsDateParams) {
  return [
    "analytics",
    "area-wise-size-distribution",
    params.dateFrom ?? null,
    params.dateTo ?? null,
  ] as const
}

export async function getAreaWiseSizeDistribution(
  params: AnalyticsDateParams = {},
): Promise<unknown> {
  const query: Record<string, string> = {}
  if (params.dateFrom) query.dateFrom = params.dateFrom
  if (params.dateTo) query.dateTo = params.dateTo

  try {
    const { data } = await apiClient.get<AreaWiseSizeDistributionResponse>(
      "/analytics/area-wise-size-distribution",
      { params: query },
    )

    if (!data.success) {
      throw new Error(
        data.message ?? "Failed to load area-wise size distribution",
      )
    }

    return data.data
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to load area-wise size distribution"),
      { cause: error },
    )
  }
}
