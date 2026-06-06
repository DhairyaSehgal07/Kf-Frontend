import * as z from "zod"
import { BAG_SIZES } from "@/lib/constants"

const bookingQuantityRowSchema = z.object({
  size: z.union([z.enum(BAG_SIZES), z.literal("")]),
  isExtra: z.boolean(),
  qty: z
    .number()
    .nonnegative("Quantity cannot be negative.")
    .optional(),
})

export const bookingQuantitiesSchema = z.object({
  quantities: z
    .array(bookingQuantityRowSchema)
    .superRefine((rows, ctx) => {
      rows.forEach((row, index) => {
        if (row.isExtra && row.size === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Select a bag size.",
            path: [index, "size"],
          })
        }
      })

      const totalBags = rows.reduce((sum, row) => sum + (row.qty ?? 0), 0)
      if (totalBags <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter at least one bag quantity.",
          path: [],
        })
      }
    }),
})

export type BookingQuantitiesValues = z.infer<typeof bookingQuantitiesSchema>

export type BookingQuantityRow =
  BookingQuantitiesValues["quantities"][number]

export function createDefaultBookingQuantities(): BookingQuantityRow[] {
  return BAG_SIZES.map((size) => ({
    size,
    isExtra: false,
    qty: undefined,
  }))
}

export function createEmptyBookingQuantityRow(): BookingQuantityRow {
  return {
    size: "",
    isExtra: true,
    qty: undefined,
  }
}
