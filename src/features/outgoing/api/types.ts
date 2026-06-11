import type { OutgoingFormValues } from "@/features/outgoing/types"
import type { TransferStockItem } from "@/features/transfer-stock/types/storage-gate-pass"

export type CreateOutgoingAllocation = {
  size: string
  quantityToAllocate: number
  chamber: string
  floor: string
  row: string
}

export type CreateOutgoingStorageGatePass = {
  storageGatePassId: string
  allocations: CreateOutgoingAllocation[]
}

export type CreateOutgoingGatePassBody = {
  farmerStorageLinkId: string
  gatePassNo: number
  date: string
  variety: string
  from: string
  to: string
  truckNumber: string
  storageGatePasses: CreateOutgoingStorageGatePass[]
  manualGatePassNumber?: number
  remarks?: string
  idempotencyKey?: string
}

export type CreateOutgoingGatePassResponse = {
  status: "Success" | "error"
  message?: string
  data: Record<string, unknown> | null
}

export type CreateOutgoingGatePassInput = {
  form: OutgoingFormValues
  gatePassNo: number
  items: TransferStockItem[]
}

export type CancelOutgoingGatePassBody = {
  cancellationRemarks: string
}

export type CancelOutgoingGatePassResponse = {
  status: "Success" | "error"
  message?: string
  data: Record<string, unknown> | null
}

export type CancelOutgoingGatePassInput = {
  id: string
  cancellationRemarks: string
}
