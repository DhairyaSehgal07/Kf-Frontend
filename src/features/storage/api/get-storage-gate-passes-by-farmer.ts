import apiClient, { getApiErrorMessage } from "@/lib/api-client"
import { getHttpStatusFromError } from "@/lib/http-error"

import type {
  GetStorageGatePassesResponse,
  StorageGatePassesByFarmerParams,
  StorageGatePassListResult,
} from "./types"

const EMPTY_RESULT: StorageGatePassListResult = {
  storageGatePasses: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

export function buildStorageGatePassesByFarmerParams(
  params: StorageGatePassesByFarmerParams,
): Record<string, string> {
  const query: Record<string, string> = {}

  if (params.sortOrder) query.sortOrder = params.sortOrder
  if (params.status) query.status = params.status

  return query
}

export async function getStorageGatePassesByFarmer(
  farmerStorageLinkId: string,
  params: StorageGatePassesByFarmerParams = {},
): Promise<StorageGatePassListResult> {
  try {
    const { data } = await apiClient.get<GetStorageGatePassesResponse>(
      `/storage-gate-pass/farmer-storage-link/${farmerStorageLinkId}`,
      { params: buildStorageGatePassesByFarmerParams(params) },
    )

    if (!data.success) {
      throw new Error(
        data.message ?? "Failed to load storage gate passes for farmer",
      )
    }

    return data.data
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return EMPTY_RESULT
    }

    throw new Error(
      getApiErrorMessage(error, "Failed to load storage gate passes for farmer"),
      { cause: error },
    )
  }
}
