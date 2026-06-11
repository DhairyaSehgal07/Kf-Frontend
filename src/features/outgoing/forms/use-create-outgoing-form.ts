import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useAuthStore } from "@/features/auth/store/use-auth-store"
import { useCreateOutgoingGatePass } from "@/features/outgoing/api/use-create-outgoing-gate-pass"
import {
  outgoingFormSchema,
  type OutgoingFormValues,
} from "@/features/outgoing/schemas/outgoing-form-schema"
import {
  defaultSubmitMeta,
  type OutgoingSubmitMeta,
} from "@/features/outgoing/types"
import { storageGatePassesByFarmerQueryOptions } from "@/features/storage/api/use-storage-gate-passes-by-farmer"
import { buildTransferItems } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { toTransferStorageGatePass } from "@/features/transfer-stock/utils/to-transfer-storage-gate-pass"
import {
  useGetReceiptVoucherNumber,
  voucherNumberKeys,
} from "@/hooks/use-get-voucher-number"

export type { OutgoingFormValues }

type UseCreateOutgoingFormOptions = {
  onOpenReview?: () => void
  onCloseReview?: () => void
  onResetComboboxState?: () => void
}

export function useCreateOutgoingForm(
  options: UseCreateOutgoingFormOptions = {},
) {
  const queryClient = useQueryClient()
  const coldStorageName = useAuthStore(
    (state) => state.user?.coldStorageId.name ?? "",
  )
  const todayIso = new Date().toISOString()
  const { mutateAsync: createOutgoingGatePass } = useCreateOutgoingGatePass()
  const {
    isLoading: isLoadingVoucherNumber,
    isError: isVoucherNumberError,
    data: nextVoucherNumber,
  } = useGetReceiptVoucherNumber("outgoing-gate-pass")

  const isGatePassNumberReady =
    !isLoadingVoucherNumber &&
    !isVoucherNumberError &&
    nextVoucherNumber != null

  const defaultValues: OutgoingFormValues = {
    farmerStorageLinkId: "",
    date: todayIso,
    manualGatePassNumber: undefined as number | undefined,
    from: coldStorageName,
    to: "",
    truckNumber: "",
    remarks: "",
    allocations: {},
  }

  const form = useForm({
    defaultValues,
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

      if (!isGatePassNumberReady) {
        toast.error(
          isLoadingVoucherNumber
            ? "Loading gate pass number, please wait…"
            : "Gate pass number unavailable. Refresh and try again.",
          { position: "bottom-right" },
        )
        return
      }

      const gatePassNo = queryClient.getQueryData<number>(
        voucherNumberKeys.detail("outgoing-gate-pass"),
      )

      if (gatePassNo == null) {
        toast.error("Gate pass number is unavailable. Refresh and try again.", {
          position: "bottom-right",
        })
        return
      }

      const result = await queryClient.fetchQuery(
        storageGatePassesByFarmerQueryOptions(parsed.farmerStorageLinkId),
      )
      const passes = result.storageGatePasses.map(toTransferStorageGatePass)
      const items = buildTransferItems(parsed.allocations, passes)

      try {
        const { message } = await createOutgoingGatePass({
          form: parsed,
          gatePassNo,
          items,
        })

        toast.success(message ?? "Outgoing gate pass created.", {
          position: "bottom-right",
        })
        options.onCloseReview?.()
        form.reset({
          ...defaultValues,
          from: coldStorageName,
          date: new Date().toISOString(),
        })
        options.onResetComboboxState?.()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to create outgoing gate pass",
          { position: "bottom-right" },
        )
      }
    },
  })

  return {
    form,
    nextVoucherNumber,
    isLoadingVoucherNumber,
    isVoucherNumberError,
    isGatePassNumberReady,
  }
}

export type CreateOutgoingFormApi = ReturnType<
  typeof useCreateOutgoingForm
>["form"]
