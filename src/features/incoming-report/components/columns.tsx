import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import type { IncomingGatePassReportRow } from "@/features/incoming-report/api/types"
import { reportColumnHeader } from "@/features/incoming-report/components/column-header"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  NOT_GRADED: "Not graded",
  GRADED: "Graded",
}

function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ")
}

export const columns: ColumnDef<IncomingGatePassReportRow>[] = [
  { accessorKey: "name", header: reportColumnHeader("Name") },
  { accessorKey: "address", header: reportColumnHeader("Address") },
  {
    accessorKey: "manualGatePassNumber",
    header: reportColumnHeader("Manual GP", { align: "right", numeric: true }),
    meta: { align: "right" },
  },
  {
    accessorKey: "gatePassNo",
    header: reportColumnHeader("Gate pass", { align: "right", numeric: true }),
    meta: { align: "right" },
  },
  { accessorKey: "date", header: reportColumnHeader("Date") },
  { accessorKey: "variety", header: reportColumnHeader("Variety") },
  { accessorKey: "stage", header: reportColumnHeader("Stage") },
  {
    accessorKey: "truckNumber",
    header: reportColumnHeader("Truck", { numeric: true }),
  },
  {
    accessorKey: "bags",
    header: reportColumnHeader("Bags", { align: "right", numeric: true }),
    meta: { align: "right" },
  },
  {
    accessorKey: "slipNumber",
    header: reportColumnHeader("Slip no.", { numeric: true }),
  },
  {
    accessorKey: "grossWeightKg",
    header: reportColumnHeader("Gross", {
      unit: "kg",
      align: "right",
      numeric: true,
    }),
    meta: { align: "right" },
  },
  {
    accessorKey: "tareWeightKg",
    header: reportColumnHeader("Tare", {
      unit: "kg",
      align: "right",
      numeric: true,
    }),
    meta: { align: "right" },
  },
  {
    accessorKey: "bardanaWeightKg",
    header: reportColumnHeader("Bardana", {
      unit: "kg",
      align: "right",
      numeric: true,
    }),
    meta: { align: "right" },
  },
  {
    accessorKey: "netWeightKg",
    header: reportColumnHeader("Net", {
      unit: "kg",
      align: "right",
      numeric: true,
    }),
    meta: { align: "right" },
  },
  {
    accessorKey: "status",
    header: reportColumnHeader("Status"),
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
    enableSorting: false,
  },
  { accessorKey: "createdBy", header: reportColumnHeader("Created by") },
  { accessorKey: "remarks", header: reportColumnHeader("Remarks") },
]

export type { IncomingGatePassReportRow }
