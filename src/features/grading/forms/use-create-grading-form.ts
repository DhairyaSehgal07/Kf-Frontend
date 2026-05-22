import { useForm } from "@tanstack/react-form"
import {
  createDefaultQuantities,
  gradingFillDetailsSchema,
} from "@/features/grading/schemas/grading-fill-details-schema"

export function useCreateGradingForm() {
  const todayIso = new Date().toISOString()

  return useForm({
    defaultValues: {
      manualGatePassNumber: undefined as number | undefined,
      date: todayIso,
      quantities: createDefaultQuantities(),
      remarks: "",
    },
    validators: {
      onChange: gradingFillDetailsSchema,
      onSubmit: gradingFillDetailsSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })
}

export type CreateGradingFormApi = ReturnType<typeof useCreateGradingForm>
