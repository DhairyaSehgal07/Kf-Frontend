import { type ColumnDef } from "@tanstack/react-table"

import type { GradingSelectIncomingGatePasses } from "../../types"

function formatGatePassDate(iso: string) {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export const columns: ColumnDef<GradingSelectIncomingGatePasses>[] = [
  {
    accessorKey: "manualGatePassNumber",
    header: "Manual",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatGatePassDate(row.getValue("date")),
  },
  {
    accessorKey: "variety",
    header: "Variety",
  },
  {
    accessorKey: "truckNumber",
    header: "Truck No.",
  },
   {
    accessorKey: "bagsReceived",
    header: "Bags Received",
  },
  {
    accessorKey: "status",
    header:"Status"
   }

]