import apiClient, { getApiErrorMessage } from "@/lib/api-client"

import type { AnalyticsDateParams } from "../types"
import type { StorageLocationWiseData } from "../types/storage-location-wise"

type StorageLocationWiseResponse = {
  success: boolean
  data: StorageLocationWiseData
  message?: string
}

export function storageLocationWiseQueryKey(params: AnalyticsDateParams) {
  return [
    "analytics",
    "storage-location-wise",
    params.dateFrom ?? null,
    params.dateTo ?? null,
  ] as const
}

export async function getStorageLocationWise(
  params: AnalyticsDateParams = {},
): Promise<StorageLocationWiseData> {
  const query: Record<string, string> = {}
  if (params.dateFrom) query.dateFrom = params.dateFrom
  if (params.dateTo) query.dateTo = params.dateTo

  try {
    const { data } = await apiClient.get<StorageLocationWiseResponse>(
      "/analytics/storage-location-wise",
      { params: query },
    )

    if (!data.success) {
      throw new Error(data.message ?? "Failed to load storage location data")
    }

    return data.data
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to load storage location data"),
      { cause: error },
    )
  }
}

export type {
  StorageLocationChamber,
  StorageLocationFloor,
  StorageLocationRow,
  StorageLocationWiseData,
  VarietyStock,
} from "../types/storage-location-wise"
