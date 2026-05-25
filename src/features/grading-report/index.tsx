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

function parseReportNumber(value: unknown): number {
  if (value == null || value === '') return 0;

  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatIndianNumber(value: number, maximumFractionDigits = 3): string {
  return value.toLocaleString('en-IN', { maximumFractionDigits });
}

function average(values: number[]): number {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
    () => {
      const wastageValues: number[] = [];
      const wastagePercentageValues: number[] = [];
      const totals = reportRows.reduce(
        (totals, gatePass) => {
          gatePass.orderDetails.forEach((detail) => {
            totals.gradingBags += detail.quantity;
          });

          gatePass.incomingGatePassIds.forEach((incomingGatePass) => {
            if (typeof incomingGatePass === 'string') return;

            totals.incomingBags += parseReportNumber(incomingGatePass.bagsReceived);
          });

          totals.incomingNetWeight += parseReportNumber(gatePass.incomingNetWeightKg);
          totals.gradingNetWeight += parseReportNumber(gatePass.netWeightKg);

          wastageValues.push(parseReportNumber(gatePass.wastageKg));
          wastagePercentageValues.push(parseReportNumber(gatePass.wastagePercentage));

          return totals;
        },
        {
          incomingBags: 0,
          incomingNetWeight: 0,
          gradingBags: 0,
          gradingNetWeight: 0,
        },
      );

      return {
        ...totals,
        averageWastageKg: average(wastageValues),
        averageWastagePercentage: average(wastagePercentageValues),
      };
    },
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
                    <span className="hidden sm:inline"> linked to incoming gate passes</span>
                  </>
                )}
              </p>
            </div>

            <Badge
              variant="secondary"
              className="border-border/60 bg-background/80 text-foreground w-fit gap-1.5"
            >
              <span className="bg-primary size-1.5 rounded-full" aria-hidden />
              {isFetching ? 'Refreshing' : 'Live API'}
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
                  disabled={isFetching}
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
                  disabled={isFetching}
                  className="w-full min-w-0 sm:w-[150px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                <Button
                  type="button"
                  className="min-w-0"
                  disabled={isFetching}
                  onClick={handleApply}
                >
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
                disabled={isLoading}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Incoming bags</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianNumber(reportTotals.incomingBags, 0)}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Incoming net</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianNumber(reportTotals.incomingNetWeight)}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Grading bags</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianNumber(reportTotals.gradingBags, 0)}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Grading net</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianNumber(reportTotals.gradingNetWeight)}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Avg wastage</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianNumber(reportTotals.averageWastageKg)}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Avg wastage %</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianNumber(reportTotals.averageWastagePercentage, 2)}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">%</span>
            ) : null}
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error.message}
        </p>
      ) : null}

      <DataTable columns={tableColumns} data={reportRows} isLoading={isLoading} />
    </div>
  );
};

export default GradingReportPage;
