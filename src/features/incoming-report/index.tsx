import { useState } from "react"
import { format } from "date-fns"

import { DatePickerInput } from "@/components/date-picker"
import { Button } from "@/components/ui/button"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { useIncomingGatePassReport } from "./api/use-incoming-gate-pass-report"
import type { IncomingGatePassReportParams } from "./api/types"

function toReportDateParam(date: Date | undefined): string | undefined {
  return date ? format(date, "yyyy-MM-dd") : undefined
}

const IncomingReportPage = () => {
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [appliedParams, setAppliedParams] =
    useState<IncomingGatePassReportParams>({})

  const { data, error, isLoading } = useIncomingGatePassReport(appliedParams)

  const reportRows = data?.incomingGatePasses ?? []

  const handleApply = () => {
    const next: IncomingGatePassReportParams = {}
    const dateFrom = toReportDateParam(fromDate)
    const dateTo = toReportDateParam(toDate)
    if (dateFrom) next.dateFrom = dateFrom
    if (dateTo) next.dateTo = dateTo
    setAppliedParams(next)
  }

  const handleReset = () => {
    setFromDate(undefined)
    setToDate(undefined)
    setAppliedParams({})
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          <DatePickerInput
            id="incoming-report-from"
            label="From"
            placeholder="Start date"
            value={fromDate}
            onChange={setFromDate}
            className="min-w-0 sm:max-w-[220px] sm:flex-1"
          />

          <DatePickerInput
            id="incoming-report-to"
            label="To"
            placeholder="End date"
            value={toDate}
            onChange={setToDate}
            className="min-w-0 sm:max-w-[220px] sm:flex-1"
          />

          <div className="flex gap-2 sm:shrink-0">
            <Button className="flex-1 sm:flex-none" onClick={handleApply}>
              Apply
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={reportRows}
        isLoading={isLoading}
        getRowId={(row) =>
          `${row.gatePassNo}-${row.date}-${row.manualGatePassNumber}`
        }
      />
    </div>
  )
}

export default IncomingReportPage
