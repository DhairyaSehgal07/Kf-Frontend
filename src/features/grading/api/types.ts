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
