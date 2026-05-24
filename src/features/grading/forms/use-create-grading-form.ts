import { useForm } from "@tanstack/react-form"
import {
  createDefaultQuantities,
  gradingFormSchema,
  type GradingFormValues,
} from "@/features/grading/schemas/grading-form-schema"
import {
  defaultGradingSubmitMeta,
  type GradingSubmitMeta,
} from "@/features/grading/types"

export type { GradingFormValues }

type UseCreateGradingFormOptions = {
  onOpenReview?: () => void
  onCreate?: (values: GradingFormValues) => Promise<void>
}

export function useCreateGradingForm(options: UseCreateGradingFormOptions = {}) {
  const todayIso = new Date().toISOString()

  return useForm({
    defaultValues: {
      farmerStorageLinkId: "",
      variety: "",
      selectedIncomingGatePassIds: [] as string[],
      manualGatePassNumber: undefined as number | undefined,
      date: todayIso,
      quantities: createDefaultQuantities(),
      remarks: "",
    },
    validators: {
      onChange: gradingFormSchema,
      onSubmit: gradingFormSchema,
    },
    onSubmitMeta: defaultGradingSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = gradingFormSchema.parse(value)

      if ((meta as GradingSubmitMeta).submitAction === "review") {
        options.onOpenReview?.()
        return
      }

      await options.onCreate?.(parsed)
    },
  })
}

export type CreateGradingFormApi = ReturnType<typeof useCreateGradingForm>
