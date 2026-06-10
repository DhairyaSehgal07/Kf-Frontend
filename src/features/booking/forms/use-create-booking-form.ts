import { useForm } from "@tanstack/react-form"

import {
  bookingFormSchema,
  createDefaultBookingQuantities,
  type BookingFormValues,
} from "@/features/booking/schemas/booking-form-schema"
import {
  defaultSubmitMeta,
  type BookingSubmitMeta,
} from "@/features/booking/types"

export type CreateBookingFormApi = ReturnType<
  typeof useCreateBookingForm
>["form"]

type UseCreateBookingFormOptions = {
  defaultValues?: BookingFormValues
  onOpenReview?: () => void
  onCreate?: (values: BookingFormValues) => Promise<void>
}

export function useCreateBookingForm(
  options: UseCreateBookingFormOptions = {},
) {
  const todayIso = new Date().toISOString()

  const form = useForm({
    defaultValues: options.defaultValues ?? {
      manualGatePassNumber: undefined as number | undefined,
      dispatchLedgerId: "",
      date: todayIso,
      variety: "",
      quantities: createDefaultBookingQuantities(),
      remarks: "",
    },
    validators: {
      onBlur: bookingFormSchema,
      onSubmit: bookingFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = bookingFormSchema.parse(value)

      if ((meta as BookingSubmitMeta).submitAction === "review") {
        options.onOpenReview?.()
        return
      }

      await options.onCreate?.(parsed)
    },
  })

  return { form }
}
