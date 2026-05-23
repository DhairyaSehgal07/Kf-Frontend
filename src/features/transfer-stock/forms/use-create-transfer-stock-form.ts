import { useForm } from "@tanstack/react-form"
import { getMockStorageGatePassesForFarmer } from "@/features/transfer-stock/data/mock-storage-gate-passes"
import {
  transferStockFormSchema,
  type TransferStockFormValues,
} from "@/features/transfer-stock/schemas/transfer-stock-form-schema"
import { buildTransferItems } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
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
  options: UseCreateTransferStockFormOptions = {}
) {
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

      const passes = getMockStorageGatePassesForFarmer(
        parsed.fromFarmerStorageLinkId
      )
      const items = buildTransferItems(parsed.allocations, passes)
      console.log({ ...parsed, items })
      options.onCloseReview?.()
    },
  })
}

export type CreateTransferStockFormApi = ReturnType<
  typeof useCreateTransferStockForm
>
