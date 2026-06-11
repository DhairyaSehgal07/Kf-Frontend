import { createFileRoute } from '@tanstack/react-router'
import CreateTransferStock from '@/features/transfer-stock/forms/create-transfer-stock'
import { prefetchVoucherNumber } from '@/hooks/use-get-voucher-number'

export const Route = createFileRoute('/_authenticated/transfer/')({
  loader: () =>
    Promise.all([
      prefetchVoucherNumber('transfer-stock-gate-pass'),
      prefetchVoucherNumber('outgoing-gate-pass'),
      prefetchVoucherNumber('storage-gate-pass'),
    ]),
  component: CreateTransferStock,
})
