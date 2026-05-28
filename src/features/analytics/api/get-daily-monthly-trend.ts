import apiClient, { getApiErrorMessage } from "@/lib/api-client"

import type { AnalyticsDateParams } from "../types"

type DailyMonthlyTrendResponse = {
  success: boolean
  data: unknown
  message?: string
}

export function dailyMonthlyTrendQueryKey(params: AnalyticsDateParams) {
  return [
    "analytics",
    "daily-monthly-trend",
    params.dateFrom ?? null,
    params.dateTo ?? null,
  ] as const
}

export async function getDailyMonthlyTrend(
  params: AnalyticsDateParams = {},
): Promise<unknown> {
  const query: Record<string, string> = {}
  if (params.dateFrom) query.dateFrom = params.dateFrom
  if (params.dateTo) query.dateTo = params.dateTo

  try {
    const { data } = await apiClient.get<DailyMonthlyTrendResponse>(
      "/analytics/daily-monthly-trend",
      { params: query },
    )

    if (!data.success) {
      throw new Error(data.message ?? "Failed to load daily monthly trend")
    }

    return data.data
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to load daily monthly trend"),
      { cause: error },
    )
  }
}
