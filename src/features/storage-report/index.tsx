import { useCallback, useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { StorageGatePass } from "@/features/storage/api/types"

import {
  useStorageGatePassReport,
  type StorageGatePassReportParams,
} from "./api/use-storage-gate-pass-report"
import {
  getStorageReportColumns,
  type StorageQuantityMode,
} from "./components/columns"
import { DataTable } from "./components/data-table"
import { ReportToolbar } from "./components/report-toolbar"

const DEFAULT_REPORT_PARAMS = {} satisfies StorageGatePassReportParams

function matchesSearch(value: unknown, query: string): boolean {
  return (JSON.stringify(value) ?? "").toLowerCase().includes(query)
}

const StorageReportPage = () => {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [reportTable, setReportTable] =
    useState<TanStackTable<StorageGatePass> | null>(null)
  const [quantityMode, setQuantityMode] =
    useState<StorageQuantityMode>("current")
  const [appliedParams, setAppliedParams] =
    useState<StorageGatePassReportParams>(DEFAULT_REPORT_PARAMS)

  const { data, error, isFetching, isLoading, refetch } =
    useStorageGatePassReport(appliedParams)

  const reportRows = useMemo(
    () => data?.data.storageGatePasses ?? [],
    [data?.data.storageGatePasses],
  )
  const displayedRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return reportRows

    return reportRows.filter((row) => matchesSearch(row, query))
  }, [reportRows, searchQuery])
  const tableColumns = useMemo(
    () => getStorageReportColumns(displayedRows, quantityMode),
    [quantityMode, displayedRows],
  )

  const handleTableReady = useCallback(
    (table: TanStackTable<StorageGatePass>) => {
      setReportTable((current) => (current === table ? current : table))
    },
    [],
  )

  const handleApply = () => {
    const next: StorageGatePassReportParams = {}
    if (dateFrom) next.dateFrom = dateFrom
    if (dateTo) next.dateTo = dateTo

    setAppliedParams(next)
  }

  const handleReset = () => {
    setDateFrom("")
    setDateTo("")
    setSearchQuery("")
    setAppliedParams(DEFAULT_REPORT_PARAMS)
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="font-heading truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Storage report
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  "Loading report..."
                ) : (
                  <>
                    <span className="tabular-nums font-medium text-foreground">
                      {displayedRows.length.toLocaleString("en-IN")}
                    </span>{" "}
                    {displayedRows.length === 1
                      ? "storage gate pass"
                      : "storage gate passes"}
                  </>
                )}
              </p>
            </div>

            <Badge
              variant="secondary"
              className="w-fit gap-1.5 border-border/60 bg-background/80 text-foreground"
            >
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {isFetching ? "Refreshing" : "Live API"}
            </Badge>
          </div>
        </div>

        <ReportToolbar
          table={reportTable}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onApply={handleApply}
          onReset={handleReset}
          onRefresh={() => void refetch()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          isRefreshing={isFetching}
        />
      </div>

      {error ? (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border/60 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 space-y-1">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Storage gate passes
            </h2>
            <p className="text-sm text-muted-foreground">
              A simple table for the selected date range.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Tabs
              value={quantityMode}
              onValueChange={(value) =>
                setQuantityMode(value as StorageQuantityMode)
              }
            >
              <TabsList aria-label="Quantity view">
                <TabsTrigger value="current">Current Qty</TabsTrigger>
                <TabsTrigger value="initial">Initial Qty</TabsTrigger>
              </TabsList>
            </Tabs>

            <Badge variant="outline" className="w-fit gap-1.5">
              <span className="tabular-nums">{displayedRows.length}</span>
              rows
            </Badge>
          </div>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading storage report...
            </div>
          ) : data ? (
            <div className="min-w-0">
              <DataTable
                columns={tableColumns}
                data={displayedRows}
                quantityMode={quantityMode}
                onTableReady={handleTableReady}
              />
            </div>
          ) : (
            <div className="flex min-h-56 items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Apply filters to load the storage report.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StorageReportPage