import type { FilterFn } from "@tanstack/react-table"

import type { IncomingGatePassReportRow } from "@/features/incoming-report/api/types"

export type SelectedValuesFilterValue = string[]

export function getReportFilterValueKey(value: unknown): string {
  if (value == null) return ""
  return String(value)
}

export const selectedValuesFilterFn: FilterFn<IncomingGatePassReportRow> = (
  row,
  columnId,
  filterValue,
) => {
  if (!Array.isArray(filterValue)) return true

  const selectedValues = new Set(filterValue.map(String))
  const rowValueKey = getReportFilterValueKey(row.getValue(columnId))

  return selectedValues.has(rowValueKey)
}

selectedValuesFilterFn.autoRemove = (filterValue) => filterValue == null
