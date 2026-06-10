import type { BookingFormValues } from "@/features/booking/schemas/booking-form-schema"

export type BookingGatePassBagSize = {
  size: string
  currentQuantity: number
  initialQuantity: number
}

export type CreateBookingBody = {
  dispatchLedgerId: string
  gatePassNo: number
  date: string
  variety: string
  bagSizes: BookingGatePassBagSize[]
  manualGatePassNumber?: number
  remarks?: string
  idempotencyKey?: string
}

export type CreateBookingInput = {
  form: BookingFormValues
  gatePassNo: number
}

export type CreateBookingResponse = {
  success?: boolean
  status?: string
  data: Record<string, unknown> | null
  message?: string
}

export type BookingDispatchLedger = {
  _id: string
  name: string
  address?: string
  mobileNumber?: string
}

export type BookingCreatedBy = {
  _id?: string
  name: string
}

export type BookingEditHistoryEntry = Record<string, unknown>

export type Booking = {
  _id: string
  dispatchLedgerId: BookingDispatchLedger
  createdBy?: BookingCreatedBy
  gatePassNo: number
  manualGatePassNumber?: number
  date: string
  variety: string
  bagSizes: BookingGatePassBagSize[]
  editHistory: BookingEditHistoryEntry[]
  remarks?: string
  createdAt?: string
  updatedAt?: string
}

export type BookingPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type BookingListResult = {
  bookings: Booking[]
  pagination: BookingPagination
}

export type BookingSortOrder = "asc" | "desc"

export type BookingListParams = {
  page?: number
  limit?: number
  sortOrder?: BookingSortOrder
}

export type GetBookingsResponse = {
  success: boolean
  data: BookingListResult
  message?: string
}

export type SearchBookingBody = {
  number: number
}

export type SearchBookingsResult = {
  bookings: Booking[]
}

export type SearchBookingsResponse = {
  success: boolean
  data: SearchBookingsResult
  message?: string
}

export type UpdateBookingBody = {
  manualGatePassNumber?: number | null
  date: string
  dispatchLedgerId: string
  variety: string
  bagSizes: BookingGatePassBagSize[]
  remarks?: string
}

export type UpdateBookingInput = {
  id: string
  form: BookingFormValues
  originalBagSizes: BookingGatePassBagSize[]
}

export type UpdateBookingResponse = {
  success: boolean
  data: Booking
  message?: string
}
