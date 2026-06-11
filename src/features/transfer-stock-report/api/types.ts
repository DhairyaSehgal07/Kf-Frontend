export type TransferStockReportColumn = {
  accessorKey: string
  header: string
}

export type TransferStockReportRow = { _id: string } & Record<string, string>

export type TransferStockReportParams = {
  dateFrom?: string
  dateTo?: string
}

export type TransferStockReportResult = {
  columns: TransferStockReportColumn[]
  transferStockGatePasses: TransferStockReportRow[]
}

export type GetTransferStockReportResponse = {
  success: boolean
  message?: string
  data: TransferStockReportResult
}
