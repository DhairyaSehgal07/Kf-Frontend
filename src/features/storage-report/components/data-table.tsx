import { useCallback, useEffect, useRef, useState } from "react"
import {
  type ColumnDef,
  type SortingFn,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { StorageGatePass } from "@/features/storage/api/types"
import { cn } from "@/lib/utils"

import type { StorageQuantityMode } from "./columns"
import {
  getStorageReportFooterContent,
  ReportTotalLabel,
  storageReportFooterCellClassName,
} from "./report-totals-footer"

const noopSortingFn: SortingFn<unknown> = () => 0

const TABLE_GRID_CLASS = cn(
  "border-collapse",
  "[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r",
  "[&_th]:border-border/50 [&_td]:border-border/35",
  "[&_th:first-child]:border-l [&_td:first-child]:border-l",
  "[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60",
  "[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0",
)

type ColumnMeta = NonNullable<ColumnDef<unknown, unknown>["meta"]>

function getColumnAlign(meta: ColumnMeta | undefined): "left" | "right" {
  return meta?.align ?? "left"
}

function getHeadClassName(
  meta: ColumnMeta | undefined,
  isHeaderScrolled: boolean,
) {
  const align = getColumnAlign(meta)

  return cn(
    "h-11 px-3 py-2 align-middle text-sm font-semibold transition-[background-color,color] duration-200",
    isHeaderScrolled
      ? "bg-muted/60 text-foreground backdrop-blur-sm supports-[backdrop-filter]:bg-muted/55"
      : "bg-secondary text-secondary-foreground",
    "whitespace-nowrap",
    meta?.groupStart === true && "border-l-2 border-l-border/70",
    meta?.numeric === true && "tabular-nums",
    meta?.wrap === true && "min-w-[14rem] whitespace-normal",
    align === "right" && "text-right",
  )
}

function getCellClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta)

  return cn(
    "px-3 py-3 align-top text-sm leading-normal text-foreground",
    meta?.groupStart === true && "border-l-2 border-l-border/55",
    meta?.numeric === true && "tabular-nums font-medium",
    meta?.mono === true && "font-mono",
    meta?.emphasize === true && "font-medium",
    meta?.wrap === true
      ? "min-w-[14rem] max-w-[22rem] whitespace-normal break-words leading-relaxed"
      : "whitespace-nowrap",
    align === "right" && "text-right",
  )
}

function getFooterClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta)

  return cn(
    storageReportFooterCellClassName,
    meta?.groupStart === true && "border-l-2 border-l-border/55",
    meta?.numeric === true && "tabular-nums",
    meta?.wrap === true
      ? "min-w-[14rem] max-w-[22rem] whitespace-normal"
      : "whitespace-nowrap",
    align === "right" && "text-right",
  )
}

interface DataTableProps<TValue> {
  columns: ColumnDef<StorageGatePass, TValue>[]
  data: StorageGatePass[]
  quantityMode: StorageQuantityMode
}

export function DataTable<TValue>({
  columns,
  data,
  quantityMode,
}: DataTableProps<TValue>) {
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const [isFooterElevated, setIsFooterElevated] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    sortingFns: {
      reportNumeric: noopSortingFn,
      reportDate: noopSortingFn,
    },
  })
  const rows = table.getRowModel().rows
  const hasDataRows = rows.length > 0

  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    setIsHeaderScrolled(el.scrollTop > 0)
    setIsFooterElevated(
      el.scrollTop + el.clientHeight < el.scrollHeight - 1,
    )
  }, [])

  useEffect(() => {
    handleTableScroll()
  }, [handleTableScroll, rows.length])

  return (
    <div className="min-w-0 overflow-hidden">
      <div
        ref={scrollContainerRef}
        onScroll={handleTableScroll}
        className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible"
      >
        <Table className={TABLE_GRID_CLASS}>
          <TableHeader
            className={cn(
              "sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent",
              isHeaderScrolled && "shadow-[0_1px_0_0] shadow-border/80",
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={getHeadClassName(
                        header.column.columnDef.meta,
                        isHeaderScrolled,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-0">
            {hasDataRows ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-0 even:bg-muted/20 hover:bg-muted/40"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={getCellClassName(cell.column.columnDef.meta)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No storage gate passes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {hasDataRows ? (
            <TableFooter
              className={cn(
                "sticky bottom-0 z-10 border-0 bg-transparent [&>tr]:border-0",
                isFooterElevated && "shadow-[0_-1px_0_0] shadow-border/80",
              )}
            >
              <TableRow className="border-0 hover:bg-transparent">
                {table.getVisibleLeafColumns().map((column, columnIndex) => {
                  const footerContent =
                    columnIndex === 0 ? (
                      <ReportTotalLabel />
                    ) : (
                      getStorageReportFooterContent(
                        column.id,
                        rows,
                        quantityMode,
                      )
                    )

                  if (columnIndex === 0) {
                    return (
                      <TableHead
                        key={`footer-${column.id}`}
                        scope="row"
                        className={getFooterClassName(column.columnDef.meta)}
                      >
                        {footerContent}
                      </TableHead>
                    )
                  }

                  return (
                    <TableCell
                      key={`footer-${column.id}`}
                      className={getFooterClassName(column.columnDef.meta)}
                      aria-label={footerContent ? "column total" : undefined}
                    >
                      {footerContent}
                    </TableCell>
                  )
                })}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>
    </div>
  )
}