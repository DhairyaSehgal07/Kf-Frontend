import type { Table } from "@tanstack/react-table"

import type { IncomingGatePassReportRow } from "@/features/incoming-report/api/types"
import {
  formatIndianIntegerTotal,
  formatIndianWeightTotal,
  sumReportNumericColumn,
} from "@/features/incoming-report/utils/report-formatters"
import { cn } from "@/lib/utils"

type TotalFormat = "integer" | "weight"

export function ReportTotalLabel() {
  return (
    <span className="text-sm font-semibold text-foreground">Total</span>
  )
}

export function createReportTotalFooter(
  key: keyof IncomingGatePassReportRow,
  format: TotalFormat,
  options?: { emphasize?: boolean },
) {
  return ({ table }: { table: Table<IncomingGatePassReportRow> }) => {
    const rows = table.getRowModel().rows
    if (rows.length === 0) return null

    const total = sumReportNumericColumn(rows, key)
    const formatted =
      format === "integer"
        ? formatIndianIntegerTotal(total)
        : formatIndianWeightTotal(total)

    return (
      <span
        className={cn(
          "tabular-nums font-semibold text-foreground",
          options?.emphasize && "font-bold",
        )}
      >
        {formatted}
      </span>
    )
  }
}
