import { useState } from "react"
import { format } from "date-fns"
import {
  type ColumnFiltersState,
  type ColumnOrderState,
  type ExpandedState,
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  type GroupingState,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { ReportToolbar } from "./components/report-toolbar"
import { useIncomingGatePassReport } from "./api/use-incoming-gate-pass-report"
import type {
  IncomingGatePassReportParams,
  IncomingGatePassReportRow,
} from "./api/types"
import {
  advancedReportGlobalFilterFn,
  type AdvancedReportGlobalFilter,
  selectedValuesFilterFn,
} from "./utils/report-filter-fns"
import { reportSortingFns } from "./utils/report-sorting-fns"
import {
  DensityFeature,
  type DensityState,
} from "@/lib/tanstack-table/density-feature"

function toReportDateParam(date: Date | undefined): string | undefined {
  return date ? format(date, "yyyy-MM-dd") : undefined
}

const IncomingReportPage = () => {
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [appliedParams, setAppliedParams] =
    useState<IncomingGatePassReportParams>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([])
  const [grouping, setGrouping] = useState<GroupingState>([])
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [globalFilter, setGlobalFilter] = useState<AdvancedReportGlobalFilter>({
    logic: "AND",
    conditions: [],
  })
  const [density, setDensity] = useState<DensityState>("lg")

  const { data, error, isLoading } = useIncomingGatePassReport(appliedParams)

  const reportRows = data?.incomingGatePasses ?? []
  // TanStack Table returns stable APIs that React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<IncomingGatePassReportRow>({
    _features: [DensityFeature],
    data: reportRows,
    columns,
    defaultColumn: {
      filterFn: selectedValuesFilterFn,
    },
    filterFns: {
      selectedValues: selectedValuesFilterFn,
    },
    globalFilterFn: advancedReportGlobalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) =>
      `${row.gatePassNo}-${row.date}-${row.manualGatePassNumber}`,
    sortingFns: reportSortingFns,
    enableSortingRemoval: true,
    state: {
      density,
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      grouping,
      expanded,
      globalFilter,
    },
    onDensityChange: (updater) => {
      setDensity((previous) => functionalUpdate(updater, previous))
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
  })
  const rowCount = table.getFilteredRowModel().rows.length

  const handleApply = () => {
    const next: IncomingGatePassReportParams = {}
    const dateFrom = toReportDateParam(fromDate)
    const dateTo = toReportDateParam(toDate)
    if (dateFrom) next.dateFrom = dateFrom
    if (dateTo) next.dateTo = dateTo
    setAppliedParams(next)
  }

  const handleReset = () => {
    setFromDate(undefined)
    setToDate(undefined)
    setAppliedParams({})
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
          <div className="min-w-0 space-y-1">
            <h1 className="font-heading truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Incoming gate passes
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                "Loading report…"
              ) : (
                <>
                  <span className="tabular-nums font-medium text-foreground">
                    {rowCount.toLocaleString("en-IN")}
                  </span>{" "}
                  {rowCount === 1 ? "entry" : "entries"}
                </>
              )}
            </p>
          </div>
        </div>

        <ReportToolbar
          table={table}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onApply={handleApply}
          onReset={handleReset}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        table={table}
        isLoading={isLoading}
      />
    </div>
  )
}

export default IncomingReportPage
