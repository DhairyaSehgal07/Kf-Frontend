import type { StorageFormValues } from "@/features/storage/types"
import type { BagType } from "@/lib/constants"

export type StorageGatePassBagSize = {
  size: string
  bagType: BagType | string
  currentQuantity: number
  initialQuantity: number
  chamber: string
  floor: string
  row: string
}

export type StorageGatePassFarmer = {
  _id?: string
  name: string
  mobileNumber?: string
  address?: string
}

export type StorageGatePassLinkedBy = {
  _id?: string
  name: string
}

export type StorageGatePassFarmerStorageLink = {
  _id?: string
  accountNumber: number | string
  farmerId: StorageGatePassFarmer
  linkedById?: StorageGatePassLinkedBy
}

export type StorageGatePassCreatedBy = {
  _id?: string
  name: string
  mobileNumber?: string
}

export type StorageGatePass = {
  _id: string
  gatePassNo: number
  manualGatePassNumber?: number
  date: string
  variety: string
  storageCategory: string
  bagSizes: StorageGatePassBagSize[]
  remarks?: string
  farmerStorageLinkId: StorageGatePassFarmerStorageLink
  createdBy?: StorageGatePassCreatedBy
  createdAt?: string
  updatedAt?: string
}

export type StorageGatePassPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type StorageGatePassListResult = {
  storageGatePasses: StorageGatePass[]
  pagination: StorageGatePassPagination
}

export type StorageGatePassSortOrder = "asc" | "desc"

export type StorageGatePassStatusFilter = "graded" | "ungraded"

export type StorageGatePassListParams = {
  page?: number
  limit?: number
  sortOrder?: StorageGatePassSortOrder
  gatePassNo?: number
  status?: StorageGatePassStatusFilter
  dateFrom?: string
  dateTo?: string
}

export type StorageGatePassesByFarmerParams = {
  sortOrder?: StorageGatePassSortOrder
  status?: StorageGatePassStatusFilter
}

export type GetStorageGatePassesResponse = {
  success: boolean
  data: StorageGatePassListResult
  message?: string
}

export type SearchStorageGatePassResult = {
  storageGatePasses: StorageGatePass[]
}

export type SearchStorageGatePassesResponse = {
  success: boolean
  data: SearchStorageGatePassResult
  message?: string
}

export type SearchStorageGatePassBody = {
  number: number
}

export type CreateStorageGatePassBody = {
  farmerStorageLinkId: string
  gatePassNo: number
  date: string
  variety: string
  storageCategory: string
  bagSizes: StorageGatePassBagSize[]
  manualGatePassNumber?: number
  remarks?: string
  idempotencyKey?: string
}

export type CreateStorageGatePassResponse = {
  success?: boolean
  status?: string
  data?: Record<string, unknown>
  message?: string
}

export type CreateStorageGatePassInput = {
  form: StorageFormValues
  gatePassNo: number
}
