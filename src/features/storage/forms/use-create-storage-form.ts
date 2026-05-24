import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { useAuthStore } from "@/features/auth/store/use-auth-store"
import {
  createDefaultStorageQuantities,
  storageFormSchema,
  type StorageFormValues,
} from "@/features/storage/schemas/storage-form-schema"
import { defaultSubmitMeta, type StorageSubmitMeta } from "@/features/storage/types"
import { voucherNumberKeys } from "@/hooks/use-get-voucher-number"
import { queryClient } from "@/lib/queryClient"

export type { StorageFormValues }

type UseCreateStorageFormOptions = {
  onOpenReview?: () => void
  onCloseReview?: () => void
}

export function useCreateStorageForm(options: UseCreateStorageFormOptions = {}) {
  const userId = useAuthStore((s) => s.user?._id ?? "")
  const todayIso = new Date().toISOString()

  return useForm({
    defaultValues: {
      manualGatePassNumber: undefined as number | undefined,
      farmerStorageLinkId: "",
      createdBy: userId,
      variety: "",
      category: "",
      date: todayIso,
      quantities: createDefaultStorageQuantities(),
      remarks: "",
    },
    validators: {
      onChange: storageFormSchema,
      onSubmit: storageFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = storageFormSchema.parse(value)

      if ((meta as StorageSubmitMeta).submitAction === "review") {
        options.onOpenReview?.()
        return
      }

      const gatePassNo = queryClient.getQueryData<number>(
        voucherNumberKeys.detail("storage-gate-pass"),
      )

      if (gatePassNo == null) {
        toast.error("Gate pass number is unavailable. Refresh and try again.", {
          position: "bottom-right",
        })
        return
      }

      console.log({ form: parsed, gatePassNo })
      options.onCloseReview?.()
    },
  })
}

export type CreateStorageFormApi = ReturnType<typeof useCreateStorageForm>
