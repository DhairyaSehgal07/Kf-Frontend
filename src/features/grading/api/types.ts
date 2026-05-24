import type { BagType } from "@/lib/constants"
import type { GradingFormValues } from "@/features/grading/schemas/grading-form-schema"

export type GradingOrderDetail = {
  size: string
  bagType: BagType
  quantity: number
  weightPerBagKg: number
}

export type CreateGradingGatePassBody = {
  farmerStorageLinkId: string
  incomingGatePassIds: string[]
  gatePassNo: number
  date: string
  variety: string
  orderDetails: GradingOrderDetail[]
  manualGatePassNumber?: number
  remarks?: string
}

export type CreateGradingGatePassResponse = {
  success: boolean
  data: Record<string, unknown> | null
  message?: string
}

export type CreateGradingGatePassInput = {
  form: GradingFormValues
  gatePassNo: number
}

export type GradingGatePassIncomingRef = {
  gatePassNo: number
  manualGatePassNumber?: number
  bagsReceived: number
  grossWeightKg: number
  tareWeightKg: number
}

export type GradingGatePassFarmer = {
  _id?: string
  name: string
}

export type GradingGatePassFarmerStorageLink = {
  _id?: string
  accountNumber: number
  farmerId: GradingGatePassFarmer
}

export type GradingGatePassCreatedBy = {
  _id?: string
  name: string
  mobileNumber?: string
}

export type GradingGatePass = {
  _id: string
  farmerStorageLinkId: GradingGatePassFarmerStorageLink
  incomingGatePassIds: GradingGatePassIncomingRef[]
  createdBy: GradingGatePassCreatedBy
  gatePassNo: number
  manualGatePassNumber?: number
  date: string
  variety: string
  orderDetails: GradingOrderDetail[]
  remarks?: string
  createdAt?: string
  updatedAt?: string
}

export type GradingGatePassPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type GradingGatePassListResult = {
  gradingGatePasses: GradingGatePass[]
  pagination: GradingGatePassPagination
}

export type GradingGatePassSortOrder = "asc" | "desc"

export type GradingGatePassListParams = {
  page?: number
  limit?: number
  sortOrder?: GradingGatePassSortOrder
}

export type GetGradingGatePassesResponse = {
  success: boolean
  data: GradingGatePassListResult
  message?: string
}

export type SearchGradingGatePassBody = {
  number: number
}
