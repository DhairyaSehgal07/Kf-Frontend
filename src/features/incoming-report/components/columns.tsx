import type { CellContext, ColumnDef } from "@tanstack/react-table"
import { format, isValid, parse, parseISO } from "date-fns"

import { Badge } from "@/components/ui/badge"
import type { IncomingGatePassReportRow } from "@/features/incoming-report/api/types"
import { reportColumnHeader } from "@/features/incoming-report/components/column-header"
import {
  createReportTotalFooter,
  ReportTotalLabel,
} from "@/features/incoming-report/components/report-totals-footer"
import {
  formatIndianInteger,
  formatIndianWeight,
} from "@/features/incoming-report/utils/report-formatters"
import { cn } from "@/lib/utils"

function formatReportDate(value: unknown): string | null {
  if (value == null || value === "") return null

  const raw = String(value).trim()
  if (raw.length === 0) return null

  const parsed =
    /^\d{4}-\d{2}-\d{2}$/.test(raw)
      ? parse(raw, "yyyy-MM-dd", new Date())
      : parseISO(raw)

  if (!isValid(parsed)) return raw

  return format(parsed, "do MMMM yyyy")
}

function reportDateCell({ getValue }: CellContext<IncomingGatePassReportRow, unknown>) {
  const formatted = formatReportDate(getValue())

  if (formatted == null) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  return <span className="whitespace-nowrap">{formatted}</span>
}

function indianNumberCell(
  format: "integer" | "weight",
  options?: { emphasize?: boolean },
) {
  return ({ getValue }: CellContext<IncomingGatePassReportRow, unknown>) => {
    const formatted =
      format === "integer"
        ? formatIndianInteger(getValue())
        : formatIndianWeight(getValue())

    if (formatted == null) {
      return <span className="text-sm text-muted-foreground">—</span>
    }

    return (
      <span
        className={cn(
          "tabular-nums",
          options?.emphasize && "font-semibold",
        )}
      >
        {formatted}
      </span>
    )
  }
}

const STATUS_LABELS: Record<string, string> = {
  NOT_GRADED: "Not graded",
  GRADED: "Graded",
}

function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ")
}

const sortText = { sortingFn: "text" as const, sortUndefined: "last" as const }
const sortNumeric = {
  sortingFn: "reportNumeric" as const,
  sortUndefined: "last" as const,
}
const sortDate = { sortingFn: "reportDate" as const, sortUndefined: "last" as const }

export const columns: ColumnDef<IncomingGatePassReportRow>[] = [
  {
    accessorKey: "name",
    header: reportColumnHeader("Name"),
    footer: ReportTotalLabel,
    ...sortText,
  },
  {
    accessorKey: "address",
    header: reportColumnHeader("Address"),
    ...sortText,
  },
  {
    accessorKey: "manualGatePassNumber",
    header: reportColumnHeader("Manual GP", { align: "right", numeric: true }),
    meta: { align: "right" },
    ...sortNumeric,
  },
  {
    accessorKey: "gatePassNo",
    header: reportColumnHeader("Gate pass", { align: "right", numeric: true }),
    meta: { align: "right" },
    ...sortNumeric,
  },
  {
    accessorKey: "date",
    header: reportColumnHeader("Date"),
    cell: reportDateCell,
    ...sortDate,
  },
  {
    accessorKey: "variety",
    header: reportColumnHeader("Variety"),
    ...sortText,
  },
  {
    accessorKey: "stage",
    header: reportColumnHeader("Stage"),
    ...sortText,
  },
  {
    accessorKey: "truckNumber",
    header: reportColumnHeader("Truck", { numeric: true }),
    ...sortNumeric,
  },
  {
    accessorKey: "bags",
    header: reportColumnHeader("Bags", { align: "right", numeric: true }),
    meta: { align: "right" },
    cell: indianNumberCell("integer"),
    footer: createReportTotalFooter("bags", "integer"),
    ...sortNumeric,
  },
  {
    accessorKey: "slipNumber",
    header: reportColumnHeader("Slip no.", { numeric: true }),
    ...sortNumeric,
  },
  {
    accessorKey: "grossWeightKg",
    header: reportColumnHeader("Gross", {
      unit: "kg",
      align: "right",
      numeric: true,
    }),
    meta: { align: "right" },
    cell: indianNumberCell("weight"),
    footer: createReportTotalFooter("grossWeightKg", "weight"),
    ...sortNumeric,
  },
  {
    accessorKey: "tareWeightKg",
    header: reportColumnHeader("Tare", {
      unit: "kg",
      align: "right",
      numeric: true,
    }),
    meta: { align: "right" },
    cell: indianNumberCell("weight"),
    footer: createReportTotalFooter("tareWeightKg", "weight"),
    ...sortNumeric,
  },
  {
    accessorKey: "bardanaWeightKg",
    header: reportColumnHeader("Bardana", {
      unit: "kg",
      align: "right",
      numeric: true,
    }),
    meta: { align: "right" },
    cell: indianNumberCell("weight"),
    footer: createReportTotalFooter("bardanaWeightKg", "weight"),
    ...sortNumeric,
  },
  {
    accessorKey: "netWeightKg",
    header: reportColumnHeader("Net", {
      unit: "kg",
      align: "right",
      numeric: true,
    }),
    meta: { align: "right" },
    cell: indianNumberCell("weight", { emphasize: true }),
    footer: createReportTotalFooter("netWeightKg", "weight", {
      emphasize: true,
    }),
    ...sortNumeric,
  },
  {
    accessorKey: "status",
    header: reportColumnHeader("Status"),
    ...sortText,
    cell: ({ row }) => {
      const status = row.getValue<string>("status")
      if (!status) {
        return <span className="text-sm text-muted-foreground">—</span>
      }

      const isNotGraded = status === "NOT_GRADED"

      return (
        <Badge
          variant={isNotGraded ? "secondary" : "default"}
          className={cn(
            "text-xs font-medium",
            !isNotGraded &&
              "border-transparent bg-primary/10 text-primary hover:bg-primary/15",
          )}
        >
          {getStatusLabel(status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdBy",
    header: reportColumnHeader("Created by"),
    ...sortText,
  },
  {
    accessorKey: "remarks",
    header: reportColumnHeader("Remarks"),
    meta: { wrap: true },
    ...sortText,
  },
]

export type { IncomingGatePassReportRow }
