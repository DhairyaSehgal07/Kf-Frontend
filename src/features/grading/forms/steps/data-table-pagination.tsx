import { type PaginationState, type Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pagination: PaginationState
  className?: string
}

export function DataTablePagination<TData>({
  table,
  pagination,
  className,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = pagination
  const filteredTotal = table.getFilteredRowModel().rows.length
  const pageCount = Math.max(table.getPageCount(), 1)
  const canPreviousPage = pageIndex > 0
  const canNextPage = pageIndex < pageCount - 1
  const rangeStart =
    filteredTotal === 0 ? 0 : pageIndex * pageSize + 1
  const rangeEnd =
    filteredTotal === 0
      ? 0
      : Math.min((pageIndex + 1) * pageSize, filteredTotal)

  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-0.5 text-sm text-muted-foreground tabular-nums">
        <p>
          Showing{" "}
          <span className="font-medium text-foreground">
            {rangeStart.toLocaleString("en-IN")}–
            {rangeEnd.toLocaleString("en-IN")}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {filteredTotal.toLocaleString("en-IN")}
          </span>
        </p>
        <p>
          <span className="font-medium text-foreground">
            {table
              .getFilteredSelectedRowModel()
              .rows.length.toLocaleString("en-IN")}
          </span>{" "}
          selected
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-9 w-[4.5rem]">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium tabular-nums text-foreground sm:w-[7rem]">
          Page {pageIndex + 1} of {pageCount}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-9 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={() => table.previousPage()}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={() => table.nextPage()}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-9 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
