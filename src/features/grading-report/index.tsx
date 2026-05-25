import { useCallback, useMemo, useState } from 'react';
import type { Table as TanStackTable } from '@tanstack/react-table';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import {
  useGradingGatePassReport,
  type GradingGatePassReportParams,
} from './api/use-grading-gate-pass-report';
import type { GradingGatePassReportRow } from './api/types';
import { getGradingReportColumns } from './components/columns';
import { DataTable } from './components/data-table';
import { ReportToolbar } from './components/report-toolbar';
import {
  formatIndianIntegerTotal,
  formatIndianPercentageTotal,
  formatIndianWeightTotal,
  getIncomingGatePassObjects,
  parseReportNumber,
} from './utils/report-formatters';

function toReportDateParam(date: Date | undefined): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined;
}

const DEFAULT_GRADING_REPORT_PARAMS = {} satisfies GradingGatePassReportParams;

function matchesSearch(value: unknown, query: string): boolean {
  return (JSON.stringify(value) ?? '').toLowerCase().includes(query);
}

function average(values: number[]): number {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const GradingReportPage = () => {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTable, setReportTable] =
    useState<TanStackTable<GradingGatePassReportRow> | null>(null);
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

          getIncomingGatePassObjects(gatePass).forEach((incomingGatePass) => {
            totals.incomingBags += parseReportNumber(incomingGatePass.bagsReceived) ?? 0;
          });

          totals.incomingNetWeight += parseReportNumber(gatePass.incomingNetWeightKg) ?? 0;
          totals.gradingNetWeight += parseReportNumber(gatePass.netWeightKg) ?? 0;

          wastageValues.push(parseReportNumber(gatePass.wastageKg) ?? 0);
          wastagePercentageValues.push(parseReportNumber(gatePass.wastagePercentage) ?? 0);

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
  const handleTableReady = useCallback((table: TanStackTable<GradingGatePassReportRow>) => {
    setReportTable((current) => (current === table ? current : table));
  }, []);
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

        <ReportToolbar
          table={reportTable}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onApply={handleApply}
          onReset={handleReset}
          onRefresh={() => void refetch()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          isRefreshing={isFetching}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Incoming bags</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianIntegerTotal(reportTotals.incomingBags)}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Incoming net</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianWeightTotal(reportTotals.incomingNetWeight)}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Grading bags</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianIntegerTotal(reportTotals.gradingBags)}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Grading net</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianWeightTotal(reportTotals.gradingNetWeight)}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Avg wastage</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianWeightTotal(reportTotals.averageWastageKg)}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Avg wastage %</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading
              ? 'Loading...'
              : formatIndianPercentageTotal(reportTotals.averageWastagePercentage)}
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

      <DataTable
        columns={tableColumns}
        data={reportRows}
        isLoading={isLoading}
        onTableReady={handleTableReady}
      />
    </div>
  );
};

export default GradingReportPage;
