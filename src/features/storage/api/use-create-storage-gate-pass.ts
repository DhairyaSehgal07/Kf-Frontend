import { useMutation } from "@tanstack/react-query"

import { createStorageGatePass } from "@/features/storage/api/create-storage-gate-pass"
import { storageGatePassKeys } from "@/features/storage/api/query-keys"
import type { CreateStorageGatePassInput } from "@/features/storage/api/types"
import { voucherNumberKeys } from "@/hooks/use-get-voucher-number"
import { queryClient } from "@/lib/queryClient"

export function useCreateStorageGatePass() {
  return useMutation({
    mutationKey: storageGatePassKeys.create(),
    mutationFn: (input: CreateStorageGatePassInput) =>
      createStorageGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: storageGatePassKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail("storage-gate-pass"),
      })
    },
  })
}
