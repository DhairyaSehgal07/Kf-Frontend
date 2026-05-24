import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ClipboardList } from "lucide-react"

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
const STICKY_COLUMN_ID = "name"

type ColumnMeta = {
  align?: "left" | "right"
}

function getColumnAlign(meta: ColumnMeta | undefined): "left" | "right" {
  return meta?.align ?? "left"
}

function stickyColumnClass(isSticky: boolean, variant: "head" | "cell") {
  if (!isSticky) return undefined

  return cn(
    "sticky left-0 z-10 bg-card after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border",
    variant === "head" &&
      "z-20 bg-muted/80 backdrop-blur-sm supports-[backdrop-filter]:bg-muted/60",
    variant === "cell" &&
      "z-[1] bg-card even:bg-muted/30 group-hover:bg-muted/50",
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  getRowId?: (row: TData) => string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  })

  const columnCount = columns.length
  const rowCount = data.length

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="border-b border-border/60 bg-muted/10 px-4 py-3 sm:px-6">
        <p className="text-sm font-medium text-foreground">Incoming gate passes</p>
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Loading report…"
            : `${rowCount.toLocaleString("en-IN")} ${rowCount === 1 ? "entry" : "entries"}`}
        </p>
      </div>

      <Table className="min-w-max">
        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm supports-[backdrop-filter]:bg-muted/60 [&_tr]:border-b [&_tr]:hover:bg-transparent">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = getColumnAlign(
                  header.column.columnDef.meta as ColumnMeta | undefined,
                )
                const isSticky = header.column.id === STICKY_COLUMN_ID

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-10 px-3 font-medium text-muted-foreground",
                      align === "right" && "text-right",
                      stickyColumnClass(isSticky, "head"),
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
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
              <TableRow
                key={`skeleton-row-${rowIndex}`}
                className="even:bg-muted/20"
              >
                {columns.map((column, colIndex) => {
                  const align = getColumnAlign(
                    column.meta as ColumnMeta | undefined,
                  )
                  const columnId =
                    column.id ??
                    ("accessorKey" in column
                      ? String(column.accessorKey)
                      : `col-${colIndex}`)
                  const isSticky = columnId === STICKY_COLUMN_ID

                  return (
                    <TableCell
                      key={columnId}
                      className={cn(
                        "px-3 py-2.5",
                        align === "right" && "text-right",
                        isSticky &&
                          "sticky left-0 z-[1] bg-card after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border",
                      )}
                    >
                      <Skeleton
                        className={cn(
                          "h-5 rounded-md",
                          align === "right"
                            ? "ml-auto w-16"
                            : "w-full max-w-36",
                          colIndex === 0 && "max-w-28",
                        )}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="group even:bg-muted/20"
              >
                {row.getVisibleCells().map((cell) => {
                  const align = getColumnAlign(
                    cell.column.columnDef.meta as ColumnMeta | undefined,
                  )
                  const isSticky = cell.column.id === STICKY_COLUMN_ID
                  const isStatusColumn = cell.column.id === "status"
                  const value = cell.getValue()
                  const isEmpty = value == null || value === ""
                  const display = isEmpty ? "—" : String(value)

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-3 py-2.5",
                        align === "right" && "text-right",
                        stickyColumnClass(isSticky, "cell"),
                      )}
                    >
                      {isStatusColumn ? (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      ) : isEmpty ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={cn(
                            "block max-w-[12rem] truncate text-sm text-foreground sm:max-w-[14rem]",
                            align === "right" &&
                              "ml-auto max-w-none font-medium tabular-nums",
                            cell.column.id === "remarks" && "max-w-[16rem]",
                            cell.column.id === "address" && "max-w-[11rem]",
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
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="p-0">
                <Empty className="rounded-none border-0 border-dashed bg-muted/10 py-14">
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
  )
}
