import type { IncomingFormValues } from "@/features/incoming/types"

/** Matches backend `IncomingGatePassCategory` enum values */
export type IncomingGatePassCategory = IncomingFormValues["category"]

/** Matches backend `GatePassStatus` — always sent as NOT_GRADED on create */
export type GatePassStatus = "NOT_GRADED" | "GRADED"

export type CreateIncomingGatePassWeightSlip = {
  slipNumber: string
  grossWeightKg: number
  tareWeightKg: number
}

export type CreateIncomingGatePassBody = {
  farmerStorageLinkId: string
  gatePassNo: number
  date: string
  variety: string
  category: IncomingGatePassCategory
  truckNumber: string
  bagsReceived: number
  status: GatePassStatus
  manualGatePassNumber?: number
  stage?: string
  weightSlip?: CreateIncomingGatePassWeightSlip
  remarks?: string
}

export type CreateIncomingGatePassResponse = {
  success: boolean
  data: Record<string, unknown> | null
  message?: string
}

export type CreateIncomingGatePassInput = {
  form: IncomingFormValues
  gatePassNo: number
}

export type UpdateIncomingGatePassWeightSlip = {
  slipNumber: string
  grossWeightKg: number
  tareWeightKg: number
}

export type UpdateIncomingGatePassBody = {
  manualGatePassNumber?: number | null
  truckNumber: string
  date: string
  farmerStorageLinkId: string
  variety: string
  category: IncomingGatePassCategory
  stage: string
  bagsReceived: number
  weightSlip: UpdateIncomingGatePassWeightSlip
  remarks?: string
}

export type UpdateIncomingGatePassResponse = {
  success: boolean
  data: Record<string, unknown> | null
  message?: string
}

export type UpdateIncomingGatePassInput = {
  id: string
  form: IncomingFormValues
}

export type IncomingGatePassFarmer = {
  _id?: string
  name: string
  mobileNumber: string
  address: string
}

export type IncomingGatePassFarmerStorageLink = {
  _id?: string
  accountNumber: number
  farmerId: IncomingGatePassFarmer
}

export type IncomingGatePassWeightSlip = {
  slipNumber: string
  grossWeightKg: number
  tareWeightKg: number
}

export type IncomingGatePass = {
  _id: string
  gatePassNo: number
  manualGatePassNumber?: number
  date: string
  variety: string
  category: string
  truckNumber: string
  bagsReceived: number
  status: GatePassStatus
  stage: string
  remarks?: string
  farmerStorageLinkId: IncomingGatePassFarmerStorageLink
  createdBy: {
    _id?: string
    name: string
    mobileNumber?: string
  }
  weightSlip?: IncomingGatePassWeightSlip
  createdAt?: string
  updatedAt?: string
}

export type IncomingGatePassPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type IncomingGatePassListResult = {
  incomingGatePasses: IncomingGatePass[]
  pagination: IncomingGatePassPagination
}

export type IncomingGatePassSortOrder = "asc" | "desc"

export type IncomingGatePassStatusFilter = "graded" | "ungraded"

export type IncomingGatePassListParams = {
  page?: number
  limit?: number
  sortOrder?: IncomingGatePassSortOrder
  gatePassNo?: number
  status?: IncomingGatePassStatusFilter
  dateFrom?: string
  dateTo?: string
}

export type GetIncomingGatePassesResponse = {
  success: boolean
  data: IncomingGatePassListResult
  message?: string
}

export type SearchIncomingGatePassBody = {
  number: number
}
