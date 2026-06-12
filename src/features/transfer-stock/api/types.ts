import type { TransferStockFormValues } from "@/features/transfer-stock/types"
import type { TransferStockItem } from "@/features/transfer-stock/types/storage-gate-pass"

export type CreateTransferStockAllocation = {
  size: string
  quantityToAllocate: number
  chamber: string
  floor: string
  row: string
}

export type CreateTransferStockStorageGatePass = {
  storageGatePassId: string
  allocations: CreateTransferStockAllocation[]
}

export type CreateTransferStockBody = {
  fromFarmerStorageLinkId: string
  toFarmerStorageLinkId: string
  gatePassNo: number
  outgoingGatePassNo: number
  destinationStorageGatePassNo: number
  date: string
  variety: string
  category: string
  from: string
  to: string
  truckNumber: string
  storageGatePasses: CreateTransferStockStorageGatePass[]
  remarks?: string
  idempotencyKey?: string
}

export type CreateTransferStockResponse = {
  status: "Success" | "error"
  message?: string
  data: Record<string, unknown> | null
}

export type CreateTransferStockInput = {
  form: TransferStockFormValues
  gatePassNo: number
  outgoingGatePassNo: number
  destinationStorageGatePassNo: number
  fromLabel: string
  toLabel: string
  items: TransferStockItem[]
}
