import apiClient, { getApiErrorMessage } from "@/lib/api-client"

import type { AddFarmerPayload } from "../schemas/add-farmer-form-schema"
import type { FarmerStorageLink } from "../types"

export type QuickRegisterFarmerBody = AddFarmerPayload & {
  coldStorageId: string
  linkedById: string
}

export interface QuickRegisterFarmerResponse {
  success: boolean
  data: FarmerStorageLink | null
  message: string
}

export type QuickRegisterFarmerAuth = {
  coldStorageId: string
  linkedById: string
}

export function toQuickRegisterFarmerBody(
  payload: AddFarmerPayload,
  auth: QuickRegisterFarmerAuth,
): QuickRegisterFarmerBody {
  return {
    ...payload,
    coldStorageId: auth.coldStorageId,
    linkedById: auth.linkedById,
  }
}

export async function quickRegisterFarmer(
  payload: AddFarmerPayload,
  auth: QuickRegisterFarmerAuth,
): Promise<QuickRegisterFarmerResponse> {
  try {
    const { data } = await apiClient.post<QuickRegisterFarmerResponse>(
      "/farmer-storage-link/quick-register-farmer",
      toQuickRegisterFarmerBody(payload, auth),
    )

    if (!data.success) {
      throw new Error(data.message ?? "Failed to add farmer")
    }

    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to add farmer"), {
      cause: error,
    })
  }
}
