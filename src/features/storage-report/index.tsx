import { type FormEvent, useMemo, useState } from "react"
import { FileJson2, Loader2, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  useStorageGatePassReport,
  type StorageGatePassReportParams,
} from "./api/use-storage-gate-pass-report"

const DEFAULT_REPORT_PARAMS = {} satisfies StorageGatePassReportParams

const StorageReportPage = () => {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [appliedParams, setAppliedParams] =
    useState<StorageGatePassReportParams>(DEFAULT_REPORT_PARAMS)

  const { data, error, isFetching, isLoading, refetch } =
    useStorageGatePassReport(appliedParams)

  const reportRows = data?.data.storageGatePasses ?? []
  const formattedResponse = useMemo(
    () => (data ? JSON.stringify(data, null, 2) : ""),
    [data],
  )

  const handleApply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: StorageGatePassReportParams = {}
    if (dateFrom) next.dateFrom = dateFrom
    if (dateTo) next.dateTo = dateTo

    setAppliedParams(next)
  }

  const handleReset = () => {
    setDateFrom("")
    setDateTo("")
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
                      {reportRows.length.toLocaleString("en-IN")}
                    </span>{" "}
                    {reportRows.length === 1
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

        <form
          className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end sm:px-6"
          onSubmit={handleApply}
        >
          <label className="grid min-w-0 gap-1.5">
            <span className="text-sm font-medium text-foreground">
              From date
            </span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-11"
            />
          </label>

          <label className="grid min-w-0 gap-1.5">
            <span className="text-sm font-medium text-foreground">
              To date
            </span>
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="h-11"
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              className="h-11 w-full sm:w-auto"
              disabled={isFetching}
            >
              {isFetching ? <Loader2 className="size-4 animate-spin" /> : null}
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full sm:w-auto"
              onClick={handleReset}
              disabled={isFetching}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="hidden sm:inline-flex"
              onClick={() => void refetch()}
              disabled={isFetching}
              aria-label="Refresh storage report"
            >
              <RefreshCw className={isFetching ? "animate-spin" : undefined} />
            </Button>
          </div>
        </form>
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
              JSON response
            </h2>
            <p className="text-sm text-muted-foreground">
              GET /storage-gate-pass/report with the selected date range.
            </p>
          </div>

          <Badge variant="outline" className="w-fit gap-1.5">
            <FileJson2 className="size-3" />
            JSON.stringify
          </Badge>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading storage report...
            </div>
          ) : formattedResponse ? (
            <pre className="max-h-[640px] min-h-56 overflow-auto p-4 font-mono text-sm leading-relaxed text-foreground sm:p-6">
              {formattedResponse}
            </pre>
          ) : (
            <div className="flex min-h-56 items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Apply filters to load the storage report response.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StorageReportPage