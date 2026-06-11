import { useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  type SortingFn,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { useTransferStockReport } from "./api/use-transfer-stock-report"
import type { TransferStockReportRow } from "./api/types"

const noopSortingFn: SortingFn<unknown> = () => 0

const NUMERIC_COLUMNS = new Set([
  "gatePassNo",
  "fromAccountNumber",
  "toAccountNumber",
  "outgoingGatePassNo",
  "destinationStorageGatePassNo",
  "totalBags",
])

const TransferStockReportPage = () => {
  const { data, isLoading, error } = useTransferStockReport({})

  const columns = useMemo(
    () =>
      (data?.data.columns ?? []).map((col) => ({
        accessorKey: col.accessorKey,
        header: col.header,
      })),
    [data?.data.columns],
  )

  const rows = data?.data.transferStockGatePasses ?? []

  const table = useReactTable<TransferStockReportRow>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id,
    sortingFns: {
      reportNumeric: noopSortingFn,
      reportDate: noopSortingFn,
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading transfer stock report…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Failed to load transfer stock report"}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-muted-foreground">
        No transfer stock records found.
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-auto rounded-lg border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-10 px-3 font-medium text-muted-foreground"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "px-3 py-2.5 text-sm text-foreground",
                    NUMERIC_COLUMNS.has(cell.column.id) && "tabular-nums",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TransferStockReportPage
