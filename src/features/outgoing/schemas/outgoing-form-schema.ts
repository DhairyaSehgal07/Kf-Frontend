import * as z from "zod"

export const objectId = z
  .string()
  .length(24, "Select a valid record from the list.")

function isPositiveIntString(value: string): boolean {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0
}

const requiredPositiveIntField = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .refine(isPositiveIntString, "Must be a whole number greater than zero")

export const outgoingAllocationSchema = z.object({
  storageGatePassId: objectId,
  bagSize: z.string().min(1, "Bag size is required"),
  bagIndex: z.number().int().min(0).default(0),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  location: z.object({
    chamber: z.string(),
    floor: z.string(),
    row: z.string(),
  }),
})

export const outgoingFormSchema = z.object({
  farmerStorageLinkId: objectId,
  date: z.string().datetime("Select a valid date."),
  manualGatePassNumber: z.union([
    z.undefined(),
    z
      .number()
      .int("Manual gate pass number must be a whole number")
      .positive("Manual gate pass number must be greater than zero"),
  ]),
  from: z.string().trim().min(1, "From is required"),
  to: z.string().trim().min(1, "To is required"),
  truckNumber: z.string().trim(),
  category: z
    .string()
    .trim()
    .min(1, "Category is required.")
    .max(100),
  billNumber: requiredPositiveIntField,
  biltiNumber: requiredPositiveIntField,
  billBook: z.string().trim().min(1, "This field is required."),
  biltiBook: z.string().trim().min(1, "This field is required."),
  remarks: z.string().max(500),
  allocations: z
    .record(z.string(), z.number().int().min(1))
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "Select at least one allocation in the gate passes table",
    }),
})

export type OutgoingFormValues = z.infer<typeof outgoingFormSchema>
export type OutgoingAllocationItem = z.infer<typeof outgoingAllocationSchema>
