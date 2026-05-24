import type { HeaderContext } from "@tanstack/react-table"

import { SortableReportColumnHeader } from "@/features/incoming-report/components/sortable-report-column-header"

export type ReportColumnHeaderAlign = "left" | "right"

export interface ReportColumnHeaderProps {
  title: string
  /** Muted unit line under the label (e.g. kg for weight columns) */
  unit?: string
  align?: ReportColumnHeaderAlign
  numeric?: boolean
}

type HeaderOptions = Omit<ReportColumnHeaderProps, "title">

/** ColumnDef header factory with sortable label + hover icon */
export function reportColumnHeader<TData>(
  title: string,
  options?: HeaderOptions,
) {
  return ({ column }: HeaderContext<TData, unknown>) => (
    <SortableReportColumnHeader
      column={column}
      sorted={column.getIsSorted()}
      title={title}
      {...options}
    />
  )
}
