import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

import {
  bookingFormSchema,
  createDefaultBookingQuantities,
  type BookingFormValues,
} from "@/features/booking/schemas/booking-form-schema"

export type CreateBookingFormApi = ReturnType<typeof useCreateBookingForm>["form"]

export function useCreateBookingForm() {
  const form = useForm({
    defaultValues: {
      dispatchLedgerId: "",
      variety: "",
      storeName: "",
      quantities: createDefaultBookingQuantities(),
      remarks: "",
    } satisfies BookingFormValues,
    validators: {
      onBlur: bookingFormSchema,
      onSubmit: bookingFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = bookingFormSchema.parse(value)

      toast.success("Booking details captured.", {
        position: "bottom-right",
        description:
          "API integration for booking gate passes will be connected next.",
      })

      return parsed
    },
  })

  return { form }
}
