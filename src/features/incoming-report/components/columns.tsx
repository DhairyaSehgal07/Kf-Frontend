import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import type { IncomingGatePassReportRow } from "@/features/incoming-report/api/types"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  NOT_GRADED: "Not graded",
  GRADED: "Graded",
}

function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ")
}

export const columns: ColumnDef<IncomingGatePassReportRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "address", header: "Address" },
  {
    accessorKey: "manualGatePassNumber",
    header: "Manual GP",
    meta: { align: "right" },
  },
  {
    accessorKey: "gatePassNo",
    header: "Gate pass",
    meta: { align: "right" },
  },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "variety", header: "Variety" },
  { accessorKey: "stage", header: "Stage" },
  { accessorKey: "truckNumber", header: "Truck" },
  {
    accessorKey: "bags",
    header: "Bags",
    meta: { align: "right" },
  },
  { accessorKey: "slipNumber", header: "Slip no." },
  {
    accessorKey: "grossWeightKg",
    header: "Gross (kg)",
    meta: { align: "right" },
  },
  {
    accessorKey: "tareWeightKg",
    header: "Tare (kg)",
    meta: { align: "right" },
  },
  {
    accessorKey: "bardanaWeightKg",
    header: "Bardana (kg)",
    meta: { align: "right" },
  },
  {
    accessorKey: "netWeightKg",
    header: "Net (kg)",
    meta: { align: "right" },
  },
  { accessorKey: "remarks", header: "Remarks" },
  {
    accessorKey: "status",
    header: "Status",
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
            isNotGraded &&
              "bg-amber-100 text-amber-900 hover:bg-amber-100/90 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-950/60",
          )}
        >
          {getStatusLabel(status)}
        </Badge>
      )
    },
    enableSorting: false,
  },
  { accessorKey: "createdBy", header: "Created by" },
]

export type { IncomingGatePassReportRow }
