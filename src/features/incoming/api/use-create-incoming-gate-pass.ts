import { useMutation } from "@tanstack/react-query"

import { createIncomingGatePass } from "@/features/incoming/api/create-incoming-gate-pass"
import type { CreateIncomingGatePassInput } from "@/features/incoming/api/types"
import { voucherNumberKeys } from "@/hooks/use-get-voucher-number"
import { queryClient } from "@/lib/queryClient"

export const incomingGatePassKeys = {
  all: ["incoming-gate-pass"] as const,
  create: () => [...incomingGatePassKeys.all, "create"] as const,
}

export function useCreateIncomingGatePass() {
  return useMutation({
    mutationKey: incomingGatePassKeys.create(),
    mutationFn: (input: CreateIncomingGatePassInput) =>
      createIncomingGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail("incoming-gate-pass"),
      })
    },
  })
}
