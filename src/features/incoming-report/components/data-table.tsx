import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  type ColumnDef,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
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
import { reportSortingFns } from "@/features/incoming-report/utils/report-sorting-fns"

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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const SKELETON_ROW_COUNT = 8

const TABLE_GRID_CLASS = cn(
  "border-collapse",
  "[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r",
  "[&_th]:border-border/50 [&_td]:border-border/35",
  "[&_th:first-child]:border-l [&_td:first-child]:border-l",
  "[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60",
  "[&_tfoot_th]:border-t-2 [&_tfoot_th]:border-t-border/60",
  "[&_tfoot_td]:border-t-2 [&_tfoot_td]:border-t-border/60",
  "[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0",
  "[&_tfoot_th:last-child]:border-r-0 [&_tfoot_td:last-child]:border-r-0",
)

type ColumnMeta = NonNullable<ColumnDef<unknown, unknown>["meta"]>

function getColId(col: ColumnDef<unknown>, index: number): string {
  if ("id" in col && col.id) return col.id
  if ("accessorKey" in col && col.accessorKey) return String(col.accessorKey)
  return `col-${index}`
}

function getColumnAlign(meta: ColumnMeta | undefined): "left" | "right" {
  return meta?.align ?? "left"
}

function isWrapColumn(meta: ColumnMeta | undefined) {
  return meta?.wrap === true
}

const REMARKS_COLUMN_WIDTH_CLASS =
  "min-w-[14rem] w-[18rem] max-w-[22rem] whitespace-normal"

const REMARKS_BODY_CELL_CLASS = cn(REMARKS_COLUMN_WIDTH_CLASS, "align-top")

function getGridCellClasses(
  meta: ColumnMeta | undefined,
  variant: "head" | "body",
  isHeaderScrolled = false,
) {
  return cn(
    variant === "head" &&
      (isHeaderScrolled
        ? "bg-muted/60 text-foreground supports-backdrop-filter:bg-muted/55 backdrop-blur-sm"
        : "bg-secondary text-secondary-foreground"),
    meta?.groupStart === true &&
      (variant === "head"
        ? "border-l-2 border-l-border/70"
        : "border-l-2 border-l-border/55"),
  )
}

function getFooterClassName(
  align: "left" | "right",
  density: DensityState,
  meta: ColumnMeta | undefined,
) {
  return cn(
    getDensityCellClasses(density),
    getGridCellClasses(meta, "body"),
    "bg-muted/60 text-sm transition-[padding,background-color] duration-200 supports-backdrop-filter:bg-muted/55 backdrop-blur-sm",
    isWrapColumn(meta) ? REMARKS_COLUMN_WIDTH_CLASS : "align-middle",
    align === "right" && "text-right",
    meta?.numeric === true && "tabular-nums",
    meta?.emphasize === true && "font-semibold",
  )
}

function getHeadClassName(
  align: "left" | "right",
  density: DensityState,
  isHeaderScrolled: boolean,
  meta: ColumnMeta | undefined,
) {
  return cn(
    getDensityHeadClasses(density),
    getGridCellClasses(meta, "head", isHeaderScrolled),
    "transition-[padding,background-color,color] duration-200",
    isWrapColumn(meta) ? REMARKS_COLUMN_WIDTH_CLASS : undefined,
    "align-middle",
    align === "right" && "text-right",
    meta?.numeric === true && "tabular-nums",
    meta?.emphasize === true && "font-semibold",
  )
}

function getBodyCellClassName(
  columnId: string,
  align: "left" | "right",
  isEmpty: boolean,
  density: DensityState,
  meta: ColumnMeta | undefined,
) {
  return cn(
    getDensityCellClasses(density),
    getGridCellClasses(meta, "body"),
    "text-sm transition-[padding] duration-200",
    isWrapColumn(meta) ? REMARKS_BODY_CELL_CLASS : "align-middle",
    align === "right" && "text-right",
    meta?.numeric === true &&
      !isEmpty &&
      "tabular-nums font-medium text-foreground",
    meta?.mono === true && !isEmpty && "font-mono",
    meta?.emphasize === true && !isEmpty && "text-foreground",
    columnId === "address" && "max-w-[11rem] sm:max-w-[14rem]",
  )
}

function getValueSpanClassName(
  columnId: string,
  align: "left" | "right",
  isEmpty: boolean,
  meta: ColumnMeta | undefined,
) {
  if (isEmpty) {
    return "text-muted-foreground"
  }

  return cn(
    "block min-w-0 text-foreground",
    !isWrapColumn(meta) && "truncate",
    isWrapColumn(meta) && "break-words leading-relaxed",
    align === "right" && "ml-auto max-w-none",
    columnId === "address" && "max-w-[11rem] sm:max-w-[14rem]",
    columnId === "name" && "max-w-[10rem] font-medium sm:max-w-[12rem]",
    meta?.numeric === true && "tabular-nums",
    meta?.mono === true && "font-mono text-sm",
    meta?.emphasize === true && "font-semibold",
  )
}

type ColumnClassEntry = {
  head: string
  cell: (isEmpty: boolean) => string
  span: string
  footer: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  getRowId?: (row: TData) => string
  /** Table row/cell padding — defaults to `lg` for easier reading on reports */
  density?: DensityState
  onDensityChange?: (density: DensityState) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  getRowId,
  density: densityProp = "lg",
  onDensityChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const [isFooterElevated, setIsFooterElevated] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    setIsHeaderScrolled(el.scrollTop > 0)
    const atBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    setIsFooterElevated(!atBottom)
  }, [])

  const table = useReactTable({
    _features: [DensityFeature],
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
    sortingFns: reportSortingFns,
    enableSortingRemoval: true,
    state: { density: densityProp, sorting },
    onDensityChange: (updater) => {
      onDensityChange?.(functionalUpdate(updater, densityProp))
    },
    onSortingChange: setSorting,
  })

  const columnCount = columns.length
  const hasDataRows = !isLoading && table.getRowModel().rows.length > 0

  const columnClassMap = useMemo(() => {
    const map = new Map<string, ColumnClassEntry>()

    columns.forEach((col, index) => {
      const columnId = getColId(col as ColumnDef<unknown>, index)
      const meta = col.meta
      const align = getColumnAlign(meta)

      map.set(columnId, {
        head: getHeadClassName(
          align,
          densityProp,
          isHeaderScrolled,
          meta,
        ),
        cell: (isEmpty) =>
          getBodyCellClassName(
            columnId,
            align,
            isEmpty,
            densityProp,
            meta,
          ),
        span: getValueSpanClassName(columnId, align, false, meta),
        footer: getFooterClassName(align, densityProp, meta),
      })
    })

    return map
  }, [densityProp, isHeaderScrolled])

  useEffect(() => {
    handleTableScroll()
  }, [data, isLoading, handleTableScroll])

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
                  const sorted = header.column.getIsSorted()
                  const columnClasses = columnClassMap.get(columnId)

                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                      }
                      className={cn("group/head", columnClasses?.head)}
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
                    const columnId = getColId(
                      column as ColumnDef<unknown>,
                      colIndex,
                    )
                    const meta = column.meta
                    const align = getColumnAlign(meta)
                    const columnClasses = columnClassMap.get(columnId)
                    const isHeaderNumeric =
                      meta?.numeric === true || meta?.mono === true

                    return (
                      <TableCell
                        key={`skeleton-${rowIndex}-${colIndex}`}
                        className={columnClasses?.cell(true)}
                      >
                        <Skeleton
                          className={cn(
                            "rounded-md",
                            isWrapColumn(meta) && "h-12 w-full",
                            !isWrapColumn(meta) &&
                              (align === "right" || isHeaderNumeric
                                ? "ml-auto h-5 w-16"
                                : "h-5 w-full max-w-36"),
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
                    const meta = cell.column.columnDef.meta
                    const isStatusColumn = columnId === "status"
                    const value = cell.getValue()
                    const isEmpty = value == null || value === ""
                    const display = isEmpty ? "—" : String(value)
                    const columnClasses = columnClassMap.get(columnId)

                    return (
                      <TableCell
                        key={cell.id}
                        className={columnClasses?.cell(isEmpty)}
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
                            className={columnClasses?.span}
                            title={
                              isWrapColumn(meta) ? undefined : display
                            }
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
          {hasDataRows ? (
            <TableFooter
              className={cn(
                "sticky bottom-0 z-10 border-0 bg-transparent [&>tr]:border-0",
                isFooterElevated &&
                  "shadow-[0_-1px_0_0] shadow-border/80",
              )}
            >
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id} className="border-0 hover:bg-transparent">
                  {footerGroup.headers.map((header, headerIndex) => {
                    const columnId = header.column.id
                    const meta = header.column.columnDef.meta
                    const columnClasses = columnClassMap.get(columnId)
                    const footerContent = header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )

                    if (headerIndex === 0) {
                      return (
                        <TableHead
                          key={header.id}
                          scope="row"
                          className={columnClasses?.footer}
                        >
                          {footerContent}
                        </TableHead>
                      )
                    }

                    return (
                      <TableCell
                        key={header.id}
                        className={columnClasses?.footer}
                        aria-label={
                          meta?.numeric === true ? "column total" : undefined
                        }
                      >
                        {footerContent}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableFooter>
          ) : null}
        </Table>
      </div>
    </div>
  )
}
