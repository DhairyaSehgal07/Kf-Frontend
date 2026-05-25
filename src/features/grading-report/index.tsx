import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ArrowRight, FileSpreadsheet, RefreshCw, Search } from 'lucide-react';

import { DatePickerInput } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useGradingGatePassReport,
  type GradingGatePassReportParams,
} from './api/use-grading-gate-pass-report';
import { getGradingReportColumns } from './components/grading-columns';
import { DataTable } from './components/grading-data-table';

function toReportDateParam(date: Date | undefined): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined;
}

const DEFAULT_GRADING_REPORT_PARAMS = {} satisfies GradingGatePassReportParams;

function matchesSearch(value: unknown, query: string): boolean {
  return (JSON.stringify(value) ?? '').toLowerCase().includes(query);
}

const GradingReportPage = () => {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedParams, setAppliedParams] = useState<GradingGatePassReportParams>(
    DEFAULT_GRADING_REPORT_PARAMS,
  );

  const { data, error, isFetching, isLoading, refetch } = useGradingGatePassReport(appliedParams);

  const displayedResponse = useMemo(() => {
    if (!data) return null;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return {
      ...data,
      data: {
        ...data.data,
        gradingGatePasses: data.data.gradingGatePasses.filter((gatePass) =>
          matchesSearch(gatePass, query),
        ),
      },
    };
  }, [data, searchQuery]);

  const reportRows = useMemo(
    () => displayedResponse?.data.gradingGatePasses ?? [],
    [displayedResponse],
  );
  const tableColumns = useMemo(() => getGradingReportColumns(reportRows), [reportRows]);
  const rowCount = reportRows.length;
  const reportTotals = useMemo(
    () =>
      reportRows.reduce(
        (totals, gatePass) => {
          gatePass.orderDetails.forEach((detail) => {
            totals.totalBags += detail.quantity;
            totals.totalWeight += detail.quantity * detail.weightPerBagKg;
          });

          return totals;
        },
        { totalBags: 0, totalWeight: 0 },
      ),
    [reportRows],
  );
  const handleApply = () => {
    const next: GradingGatePassReportParams = {};
    const dateFrom = toReportDateParam(fromDate);
    const dateTo = toReportDateParam(toDate);

    if (dateFrom) next.dateFrom = dateFrom;
    if (dateTo) next.dateTo = dateTo;

    setAppliedParams(next);
  };

  const handleReset = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setSearchQuery('');
    setAppliedParams(DEFAULT_GRADING_REPORT_PARAMS);
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border/60 bg-muted/20 border-b px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="font-heading text-foreground truncate text-xl font-semibold tracking-tight sm:text-2xl">
                Grading report
              </h1>
              <p className="text-muted-foreground text-sm">
                {isLoading ? (
                  'Loading report...'
                ) : (
                  <>
                    <span className="text-foreground font-medium tabular-nums">
                      {rowCount.toLocaleString('en-IN')}
                    </span>{' '}
                    {rowCount === 1 ? 'grading entry' : 'grading entries'}
                  </>
                )}
              </p>
            </div>

            <Badge variant="secondary" className="w-fit">
              Live API
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-min flex-col gap-3 sm:gap-4 lg:min-w-0 lg:flex-row lg:flex-nowrap lg:items-end lg:gap-3">
            <div className="flex min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="flex min-w-0 items-end gap-2">
                <DatePickerInput
                  id="grading-report-from"
                  label="From"
                  placeholder="dd.mm.yyyy"
                  value={fromDate}
                  onChange={setFromDate}
                  className="w-full min-w-0 sm:w-[150px]"
                />

                <span className="flex h-9 shrink-0 items-center" aria-hidden>
                  <ArrowRight className="text-muted-foreground size-4" />
                </span>

                <DatePickerInput
                  id="grading-report-to"
                  label="To"
                  placeholder="dd.mm.yyyy"
                  value={toDate}
                  onChange={setToDate}
                  className="w-full min-w-0 sm:w-[150px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                <Button type="button" className="min-w-0" onClick={handleApply}>
                  Apply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-0"
                  disabled={isFetching}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="relative min-w-0 lg:min-w-44 lg:flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search grading report..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-9"
                aria-label="Search grading report"
              />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                className="min-w-0 flex-1 gap-1.5 lg:flex-none"
                aria-label="Export grading report to Excel"
                disabled
              >
                <FileSpreadsheet className="size-4 shrink-0" aria-hidden />
                <span className="truncate">Excel</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label="Refresh grading report"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Total bags</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : reportTotals.totalBags.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Total weight</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading
              ? 'Loading...'
              : reportTotals.totalWeight.toLocaleString('en-IN', {
                  maximumFractionDigits: 3,
                })}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">API status</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : data?.success ? 'Success' : 'No data'}
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error.message}
        </p>
      ) : null}

      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border/60 border-b px-4 py-3 sm:px-6">
          <h2 className="font-heading text-foreground text-base font-semibold">
            Grading report table
          </h2>
          <p className="text-muted-foreground text-sm">
            GET /grading-gate-pass/report with the selected date range.
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <DataTable columns={tableColumns} data={isLoading ? [] : reportRows} />
        </div>
      </div>
    </div>
  );
};

export default GradingReportPage;
