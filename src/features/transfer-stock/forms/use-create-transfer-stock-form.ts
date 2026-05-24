import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { storageGatePassesByFarmerQueryOptions } from "@/features/storage/api/use-storage-gate-passes-by-farmer"
import {
  transferStockFormSchema,
  type TransferStockFormValues,
} from "@/features/transfer-stock/schemas/transfer-stock-form-schema"
import { buildTransferItems } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { toTransferStorageGatePass } from "@/features/transfer-stock/utils/to-transfer-storage-gate-pass"
import {
  defaultSubmitMeta,
  type TransferStockSubmitMeta,
} from "@/features/transfer-stock/types"

export type { TransferStockFormValues }

type UseCreateTransferStockFormOptions = {
  onOpenReview?: () => void
  onCloseReview?: () => void
}

export function useCreateTransferStockForm(
  options: UseCreateTransferStockFormOptions = {},
) {
  const queryClient = useQueryClient()
  const todayIso = new Date().toISOString()

  return useForm({
    defaultValues: {
      fromFarmerStorageLinkId: "",
      toFarmerStorageLinkId: "",
      date: todayIso,
      remarks: "",
      allocations: {} as Record<string, number>,
    },
    validators: {
      onChange: transferStockFormSchema,
      onSubmit: transferStockFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = transferStockFormSchema.parse(value)

      if ((meta as TransferStockSubmitMeta).submitAction === "review") {
        options.onOpenReview?.()
        return
      }

      const result = await queryClient.fetchQuery(
        storageGatePassesByFarmerQueryOptions(parsed.fromFarmerStorageLinkId),
      )
      const passes = result.storageGatePasses.map(toTransferStorageGatePass)
      const items = buildTransferItems(parsed.allocations, passes)
      console.log({ ...parsed, items })
      options.onCloseReview?.()
    },
  })
}

export type CreateTransferStockFormApi = ReturnType<
  typeof useCreateTransferStockForm
>
