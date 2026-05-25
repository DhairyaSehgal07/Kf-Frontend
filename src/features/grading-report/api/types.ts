export type GradingGatePassReportOrderDetail = {
  size: string
  bagType: string
  quantity: number
  weightPerBagKg: number
}

export type GradingGatePassReportRow = {
  _id: string
  farmerStorageLinkId: string
  incomingGatePassIds: string[]
  createdBy: string
  gatePassNo: number
  manualGatePassNumber: number
  date: string
  variety: string
  orderDetails: GradingGatePassReportOrderDetail[]
  remarks: string
}

export type GradingGatePassReportParams = {
  dateFrom?: string
  dateTo?: string
}

export type GradingGatePassReportResult = {
  gradingGatePasses: GradingGatePassReportRow[]
}

export type GetGradingGatePassReportResponse = {
  success: boolean
  data: GradingGatePassReportResult
  message?: string
}
