import * as z from "zod"
import { bookingQuantitiesSchema } from "@/features/booking/schemas/booking-quantities-schema"

export const objectId = z
  .string()
  .length(24, "Select a valid record from the list.")

const bookingBaseSchema = z.object({
  dispatchLedgerId: objectId,
  variety: z.string().min(1, "Select a variety."),
  storeName: z.string().min(1, "Enter a store name."),
  remarks: z.string(),
})

export const bookingFormSchema = bookingBaseSchema.merge(bookingQuantitiesSchema)

export type BookingFormValues = z.infer<typeof bookingFormSchema>

export {
  bookingQuantitiesSchema,
  createDefaultBookingQuantities,
  createEmptyBookingQuantityRow,
  type BookingQuantityRow,
} from "@/features/booking/schemas/booking-quantities-schema"
