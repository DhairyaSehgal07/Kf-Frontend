import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { storageGatePassesByFarmerQueryOptions } from "@/features/storage/api/use-storage-gate-passes-by-farmer"
import {
  outgoingFormSchema,
  type OutgoingFormValues,
} from "@/features/outgoing/schemas/outgoing-form-schema"
import {
  defaultSubmitMeta,
  type OutgoingSubmitMeta,
} from "@/features/outgoing/types"
import { buildTransferItems } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { toTransferStorageGatePass } from "@/features/transfer-stock/utils/to-transfer-storage-gate-pass"

export type { OutgoingFormValues }

type UseCreateOutgoingFormOptions = {
  onOpenReview?: () => void
  onCloseReview?: () => void
}

export function useCreateOutgoingForm(
  options: UseCreateOutgoingFormOptions = {},
) {
  const queryClient = useQueryClient()
  const todayIso = new Date().toISOString()

  return useForm({
    defaultValues: {
      farmerStorageLinkId: "",
      date: todayIso,
      remarks: "",
      allocations: {} as Record<string, number>,
    },
    validators: {
      onChange: outgoingFormSchema,
      onSubmit: outgoingFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = outgoingFormSchema.parse(value)

      if ((meta as OutgoingSubmitMeta).submitAction === "review") {
        options.onOpenReview?.()
        return
      }

      const result = await queryClient.fetchQuery(
        storageGatePassesByFarmerQueryOptions(parsed.farmerStorageLinkId),
      )
      const passes = result.storageGatePasses.map(toTransferStorageGatePass)
      const items = buildTransferItems(parsed.allocations, passes)
      console.log({ ...parsed, items })
      options.onCloseReview?.()
    },
  })
}

export type CreateOutgoingFormApi = ReturnType<typeof useCreateOutgoingForm>
