import { useCallback, useRef, useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ClipboardList } from "lucide-react"

import {
  DensityFeature,
  type DensityState,
} from "@/lib/tanstack-table/density-feature"
import {
  getDensityCellClasses,
  getDensityHeadClasses,
} from "@/lib/tanstack-table/density-classes"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const SKELETON_ROW_COUNT = 8

const NUMERIC_COLUMN_IDS = new Set([
  "manualGatePassNumber",
  "gatePassNo",
  "bags",
  "grossWeightKg",
  "tareWeightKg",
  "bardanaWeightKg",
  "netWeightKg",
])

const MONO_COLUMN_IDS = new Set([
  "manualGatePassNumber",
  "gatePassNo",
  "slipNumber",
  "truckNumber",
])

/** Slightly stronger vertical rule between logical column groups */
const GROUP_START_COLUMN_IDS = new Set([
  "manualGatePassNumber",
  "date",
  "bags",
  "grossWeightKg",
  "status",
  "remarks",
])

const TABLE_GRID_CLASS = cn(
  "border-collapse",
  "[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r",
  "[&_th]:border-border/50 [&_td]:border-border/35",
  "[&_th:first-child]:border-l [&_td:first-child]:border-l",
  "[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60",
  "[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0",
)

type ColumnMeta = {
  align?: "left" | "right"
}

function getColumnAlign(meta: ColumnMeta | undefined): "left" | "right" {
  return meta?.align ?? "left"
}

function getGridCellClasses(
  columnId: string,
  variant: "head" | "body",
  isHeaderScrolled = false,
) {
  return cn(
    variant === "head" &&
      (isHeaderScrolled
        ? "bg-muted/60 text-foreground supports-backdrop-filter:bg-muted/55 backdrop-blur-sm"
        : "bg-secondary text-secondary-foreground"),
    GROUP_START_COLUMN_IDS.has(columnId) &&
      (variant === "head"
        ? "border-l-2 border-l-border/70"
        : "border-l-2 border-l-border/55"),
  )
}

function getHeadClassName(
  columnId: string,
  align: "left" | "right",
  density: DensityState,
  isHeaderScrolled: boolean,
) {
  return cn(
    getDensityHeadClasses(density),
    getGridCellClasses(columnId, "head", isHeaderScrolled),
    "align-middle transition-[padding,background-color,color] duration-200",
    align === "right" && "text-right",
    NUMERIC_COLUMN_IDS.has(columnId) && "tabular-nums",
    columnId === "netWeightKg" && "font-semibold",
  )
}

function getBodyCellClassName(
  columnId: string,
  align: "left" | "right",
  isEmpty: boolean,
  density: DensityState,
) {
  return cn(
    getDensityCellClasses(density),
    getGridCellClasses(columnId, "body"),
    "text-sm transition-[padding] duration-200",
    align === "right" && "text-right",
    NUMERIC_COLUMN_IDS.has(columnId) &&
      !isEmpty &&
      "tabular-nums font-medium text-foreground",
    MONO_COLUMN_IDS.has(columnId) && !isEmpty && "font-mono",
    columnId === "netWeightKg" && !isEmpty && "text-foreground",
    (columnId === "remarks" || columnId === "address") &&
      "max-w-[11rem] sm:max-w-[14rem]",
  )
}

function getValueSpanClassName(
  columnId: string,
  align: "left" | "right",
  isEmpty: boolean,
) {
  if (isEmpty) {
    return "text-muted-foreground"
  }

  return cn(
    "block min-w-0 truncate text-foreground",
    align === "right" && "ml-auto max-w-none",
    columnId === "remarks" && "max-w-[16rem]",
    columnId === "address" && "max-w-[11rem] sm:max-w-[14rem]",
    columnId === "name" && "max-w-[10rem] font-medium sm:max-w-[12rem]",
    NUMERIC_COLUMN_IDS.has(columnId) && "tabular-nums",
    MONO_COLUMN_IDS.has(columnId) && "font-mono text-sm",
    columnId === "netWeightKg" && "font-semibold",
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  getRowId?: (row: TData) => string
  /** Table row/cell padding — defaults to `lg` for easier reading on reports */
  density?: DensityState
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  getRowId,
  density: densityProp = "lg",
}: DataTableProps<TData, TValue>) {
  const [density, setDensity] = useState<DensityState>(densityProp)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    setIsHeaderScrolled(el.scrollTop > 0)
  }, [])

  const table = useReactTable({
    _features: [DensityFeature],
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    state: { density },
    onDensityChange: setDensity,
  })

  const tableDensity = table.getState().density
  const columnCount = columns.length

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div
        ref={scrollContainerRef}
        onScroll={handleTableScroll}
        className="max-h-[min(70vh,42rem)] overflow-auto [&_[data-slot=table-container]]:overflow-visible"
      >
        <Table className={TABLE_GRID_CLASS}>
          <TableHeader
            className={cn(
              "sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent",
              isHeaderScrolled &&
                "shadow-[0_1px_0_0] shadow-border/80",
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id
                  const align = getColumnAlign(
                    header.column.columnDef.meta as ColumnMeta | undefined,
                  )

                  return (
                    <TableHead
                      key={header.id}
                      className={getHeadClassName(
                        columnId,
                        align,
                        tableDensity,
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
            {isLoading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                <TableRow
                  key={`skeleton-row-${rowIndex}`}
                  className="border-0 even:bg-muted/15"
                >
                  {columns.map((column, colIndex) => {
                    const columnId =
                      "accessorKey" in column && column.accessorKey
                        ? String(column.accessorKey)
                        : `col-${colIndex}`
                    const align = getColumnAlign(
                      column.meta as ColumnMeta | undefined,
                    )
                    const isHeaderNumeric =
                      NUMERIC_COLUMN_IDS.has(columnId) ||
                      MONO_COLUMN_IDS.has(columnId)

                    return (
                      <TableCell
                        key={`skeleton-${rowIndex}-${colIndex}`}
                        className={cn(
                          getDensityCellClasses(tableDensity),
                          getGridCellClasses(columnId, "body"),
                          "transition-[padding] duration-200",
                          align === "right" && "text-right",
                        )}
                      >
                        <Skeleton
                          className={cn(
                            "h-5 rounded-md",
                            align === "right" || isHeaderNumeric
                              ? "ml-auto w-16"
                              : "w-full max-w-36",
                          )}
                        />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-0 even:bg-muted/20">
                  {row.getVisibleCells().map((cell) => {
                    const columnId = cell.column.id
                    const align = getColumnAlign(
                      cell.column.columnDef.meta as ColumnMeta | undefined,
                    )
                    const isStatusColumn = columnId === "status"
                    const value = cell.getValue()
                    const isEmpty = value == null || value === ""
                    const display = isEmpty ? "—" : String(value)

                    return (
                      <TableCell
                        key={cell.id}
                        className={getBodyCellClassName(
                          columnId,
                          align,
                          isEmpty,
                          tableDensity,
                        )}
                      >
                        {isStatusColumn ? (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        ) : isEmpty ? (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        ) : (
                          <span
                            className={getValueSpanClassName(
                              columnId,
                              align,
                              isEmpty,
                            )}
                            title={display}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell
                  colSpan={columnCount}
                  className="border-0 p-0 last:border-r-0"
                >
                  <Empty className="rounded-none border-0 bg-muted/20 py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ClipboardList />
                      </EmptyMedia>
                      <EmptyTitle>No gate passes in this range</EmptyTitle>
                      <EmptyDescription>
                        Adjust the date filters above or reset to load the full
                        report.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
