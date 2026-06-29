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
  storageGatePasses: CreateOutgoingStorageGatePass[]
  category: string
  billNumber: number
  biltiNumber: number
  billBook: string
  biltiBook: string
  truckNumber?: string
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

export type UpdateOutgoingGatePassBody = {
  date: string
  manualGatePassNumber?: number | null
  from: string
  to: string
  truckNumber: string
  category: string
  billNumber: number
  biltiNumber: number
  billBook: number
  biltiBook: number
  remarks?: string
}

export type UpdateOutgoingGatePassResponse = {
  status: "Success" | "error"
  message?: string
  data: Record<string, unknown> | null
}

export type UpdateOutgoingGatePassInput = {
  id: string
  form: {
    date: string
    manualGatePassNumber?: number
    from: string
    to: string
    truckNumber: string
    category: string
    billNumber: string
    biltiNumber: string
    billBook: string
    biltiBook: string
    remarks: string
  }
}
