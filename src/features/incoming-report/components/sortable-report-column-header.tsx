import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import type { ReportColumnHeaderAlign } from "@/features/incoming-report/components/column-header"
import { cn } from "@/lib/utils"

export interface SortableReportColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  /** Passed explicitly so React Compiler re-renders when sort state changes */
  sorted: false | "asc" | "desc"
  title: string
  unit?: string
  align?: ReportColumnHeaderAlign
  numeric?: boolean
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "desc") {
    return <ArrowDown className="size-3.5 shrink-0" aria-hidden />
  }

  if (sorted === "asc") {
    return <ArrowUp className="size-3.5 shrink-0" aria-hidden />
  }

  return <ArrowUpDown className="size-3.5 shrink-0" aria-hidden />
}

export function SortableReportColumnHeader<TData, TValue>({
  column,
  sorted,
  title,
  unit,
  align = "left",
  numeric = false,
}: SortableReportColumnHeaderProps<TData, TValue>) {
  const isActive = sorted !== false

  return (
    <button
      type="button"
      className={cn(
        "flex w-full min-w-0 items-center gap-1.5 rounded-md text-inherit transition-colors",
        "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        align === "right" ? "justify-end text-right" : "justify-between text-left",
      )}
      onClick={column.getToggleSortingHandler()}
    >
      {unit ? (
        <span
          className={cn(
            "flex min-w-0 flex-col gap-0.5",
            align === "right" && "items-end text-right",
          )}
        >
          <span
            className={cn(
              "text-sm font-medium leading-tight",
              numeric && "tabular-nums",
            )}
          >
            {title}
          </span>
          <span className="text-xs font-normal opacity-70">{unit}</span>
        </span>
      ) : (
        <span
          className={cn(
            "min-w-0 truncate text-sm font-medium leading-tight",
            numeric && "tabular-nums",
          )}
        >
          {title}
        </span>
      )}

      <span
        className={cn(
          "shrink-0 text-muted-foreground transition-opacity",
          isActive
            ? "opacity-100"
            : "opacity-0 group-hover/head:opacity-70",
        )}
      >
        <SortIcon sorted={sorted} />
      </span>
    </button>
  )
}
