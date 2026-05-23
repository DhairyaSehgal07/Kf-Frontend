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
