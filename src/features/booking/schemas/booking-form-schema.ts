import * as z from "zod"
import { bookingQuantitiesSchema } from "@/features/booking/schemas/booking-quantities-schema"

export const objectId = z
  .string()
  .length(24, "Select a valid record from the list.")

const bookingBaseSchema = z.object({
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().positive("Enter a positive gate pass number."),
  ]),
  dispatchLedgerId: objectId,
  date: z.string().datetime("Select a valid date."),
  variety: z.string().min(1, "Select a variety."),
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
