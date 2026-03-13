'use client';

import { useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  useGetGradingGatePasses,
  gradingGatePassesQueryOptions,
} from '@/services/store-admin/grading-gate-pass/useGetGradingGatePasses';
import type { GradingGatePass } from '@/types/grading-gate-pass';
import { columns, type GradingReportRow } from './columns';
import { GRADING_COLUMN_LABELS, GRADING_TOTAL_COLUMN_IDS } from './constants';
import {
  DataTable,
  type GradingReportDataTableRef,
  type GradingReportPdfSnapshot,
} from './data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/forms/date-picker';
import { Button } from '@/components/ui/button';
import { formatDateToYYYYMMDD } from '@/lib/helpers';
import { queryClient } from '@/lib/queryClient';
import { useStore } from '@/stores/store';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    const d = parseISO(iso);
    return format(d, 'yyyy-MM-dd');
  } catch {
    return iso;
  }
}

/** Map grading gate passes to table rows. One row per incoming gate pass when a grading pass references multiple; shared columns (farmer, variety, GP no., date, graded bags, etc.) span. */
function mapGradingGatePassesToRows(
  gatePasses: GradingGatePass[]
): GradingReportRow[] {
  const rows: GradingReportRow[] = [];
  for (const pass of gatePasses) {
    const incomingRefs =
      pass.weightSlipDetails?.incomingGatePassIds?.length &&
      pass.weightSlipDetails.incomingGatePassIds.length > 0
        ? pass.weightSlipDetails.incomingGatePassIds
        : (pass.incomingGatePassIds ?? []);
    const farmerName = pass.farmerStorageLinkId?.farmerId?.name ?? '—';
    const accountNumber = pass.farmerStorageLinkId?.accountNumber ?? '—';
    const variety = pass.variety ?? '—';
    const gatePassNo = pass.gatePassNo ?? '—';
    const date = formatDate(pass.date);
    const grader = pass.createdBy?.name ?? pass.grader ?? '—';
    const remarks = pass.remarks ?? '—';

    const orderDetails = pass.orderDetails ?? [];
    const totalGradedBags = orderDetails.reduce(
      (sum, od) => sum + (od.initialQuantity ?? od.currentQuantity ?? 0),
      0
    );
    const totalGradedWeightKg =
      orderDetails.reduce(
        (sum, od) => sum + (od.initialQuantity ?? 0) * (od.weightPerBagKg ?? 0),
        0
      ) || 0;

    if (incomingRefs.length === 0) {
      const firstIncoming = pass.incomingGatePassIds?.[0];
      const weightSlip =
        firstIncoming?.weightSlip ??
        pass.weightSlipDetails?.incomingGatePassIds?.[0]?.weightSlip;
      const grossKg = weightSlip?.grossWeightKg;
      const tareKg = weightSlip?.tareWeightKg;
      const netProductKg =
        grossKg != null &&
        tareKg != null &&
        !Number.isNaN(grossKg) &&
        !Number.isNaN(tareKg)
          ? grossKg - tareKg
          : '—';
      const netProductNum =
        typeof netProductKg === 'number' ? netProductKg : Number(netProductKg);
      const wastagePass =
        !Number.isNaN(netProductNum) && netProductNum > 0
          ? netProductNum - totalGradedWeightKg
          : '—';
      rows.push({
        id: `${pass._id}-0`,
        gradingPassGroupSize: 1,
        farmerName,
        accountNumber,
        farmerMobile: '—',
        farmerAddress: '—',
        incomingGatePassNo: firstIncoming?.gatePassNo ?? '—',
        incomingManualNo: firstIncoming?.manualGatePassNumber ?? '—',
        incomingGatePassDate: firstIncoming?.date
          ? formatDate(firstIncoming.date)
          : '—',
        incomingTruckNumber: firstIncoming?.truckNumber ?? '—',
        variety,
        bagsReceived: firstIncoming?.bagsReceived ?? '—',
        netProductKg,
        gatePassNo,
        manualGatePassNumber: pass.manualGatePassNumber ?? '—',
        date,
        totalGradedBags,
        totalGradedWeightKg,
        wastageKg: wastagePass,
        grader,
        remarks,
        grossWeightKg: (weightSlip?.grossWeightKg as number | string) ?? '—',
        netWeightKg:
          typeof netProductKg === 'number' ? netProductKg : netProductKg,
      });
      continue;
    }

    const netProductKgTotal =
      incomingRefs.reduce((sum, ref) => {
        const ws = ref.weightSlip;
        if (
          ws?.grossWeightKg != null &&
          ws?.tareWeightKg != null &&
          !Number.isNaN(ws.grossWeightKg) &&
          !Number.isNaN(ws.tareWeightKg)
        )
          return sum + (ws.grossWeightKg - ws.tareWeightKg);
        return sum;
      }, 0) || 0;
    const wastagePass =
      netProductKgTotal > 0 ? netProductKgTotal - totalGradedWeightKg : '—';
    const groupSize = incomingRefs.length;

    for (let i = 0; i < incomingRefs.length; i++) {
      const ref = incomingRefs[i]!;
      const weightSlip = ref.weightSlip;
      const grossKg = weightSlip?.grossWeightKg;
      const tareKg = weightSlip?.tareWeightKg;
      const netProductKg =
        grossKg != null &&
        tareKg != null &&
        !Number.isNaN(grossKg) &&
        !Number.isNaN(tareKg)
          ? grossKg - tareKg
          : '—';
      rows.push({
        id: `${pass._id}-${i}`,
        gradingPassGroupSize: groupSize,
        farmerName,
        accountNumber,
        farmerMobile: '—',
        farmerAddress: '—',
        incomingGatePassNo: ref.gatePassNo ?? '—',
        incomingManualNo: ref.manualGatePassNumber ?? '—',
        incomingGatePassDate: ref.date ? formatDate(ref.date) : '—',
        incomingTruckNumber: ref.truckNumber ?? '—',
        variety,
        bagsReceived: ref.bagsReceived ?? '—',
        netProductKg,
        gatePassNo,
        manualGatePassNumber: pass.manualGatePassNumber ?? '—',
        date,
        totalGradedBags,
        totalGradedWeightKg,
        wastageKg: wastagePass,
        grader,
        remarks,
        grossWeightKg: (grossKg as number | string) ?? '—',
        netWeightKg:
          typeof netProductKg === 'number' ? netProductKg : netProductKg,
      });
    }
  }
  return rows;
}

const GradingReportTable = () => {
  const coldStorage = useStore((s) => s.coldStorage);
  const tableRef = useRef<GradingReportDataTableRef<GradingReportRow>>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [appliedRange, setAppliedRange] = useState<{
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const { data, isLoading, error } = useGetGradingGatePasses({
    limit: 5000,
    dateFrom: appliedRange.dateFrom,
    dateTo: appliedRange.dateTo,
  });

  const rows = useMemo((): GradingReportRow[] => {
    if (!data?.list) return [];
    return mapGradingGatePassesToRows(data.list);
  }, [data]);

  const handleApplyDates = () => {
    if (!fromDate && !toDate) return;
    if (fromDate && toDate) {
      const fromStr = formatDateToYYYYMMDD(fromDate);
      const toStr = formatDateToYYYYMMDD(toDate);
      if (toStr < fromStr) {
        toast.error('Invalid date range', {
          description: '"To" date must not be before "From" date.',
        });
        return;
      }
    }
    const params = {
      limit: 5000,
      dateFrom: fromDate ? formatDateToYYYYMMDD(fromDate) : undefined,
      dateTo: toDate ? formatDateToYYYYMMDD(toDate) : undefined,
    };
    const fetchPromise = queryClient.fetchQuery(
      gradingGatePassesQueryOptions(params)
    );
    toast.promise(fetchPromise, {
      loading: 'Applying date filters…',
      success: 'Date filters applied. Report updated.',
      error: 'Failed to load report for the selected dates.',
    });
    fetchPromise
      .then(() => {
        setAppliedRange({
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        });
        requestAnimationFrame(() => {
          reportContentRef.current?.focus({ preventScroll: true });
        });
      })
      .catch(() => {});
  };

  const handleClearDates = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setAppliedRange({});
    toast.success('Date filters cleared. Report updated.');
  };

  const getDateRangeLabel = () => {
    if (appliedRange.dateFrom && appliedRange.dateTo) {
      return `${appliedRange.dateFrom} to ${appliedRange.dateTo}`;
    }
    if (appliedRange.dateFrom) return `From ${appliedRange.dateFrom}`;
    if (appliedRange.dateTo) return `To ${appliedRange.dateTo}`;
    return 'All dates';
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const snapshot: GradingReportPdfSnapshot<GradingReportRow> | null =
        tableRef.current?.getPdfSnapshot() ?? null;
      const [{ pdf }, { GradingReportTablePdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/analytics/grading-report-table-pdf'),
      ]);
      const blob = await pdf(
        <GradingReportTablePdf
          companyName={coldStorage?.name ?? 'Cold Storage'}
          dateRangeLabel={getDateRangeLabel()}
          reportTitle="Grading Report"
          rows={rows}
          tableSnapshot={snapshot}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast.success('PDF opened in new tab', {
        description: 'Grading report is ready to view or print.',
      });
    } catch {
      toast.error('Could not generate PDF', {
        description: 'Please try again.',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
        <div className="space-y-6">
          <Skeleton className="font-custom h-8 w-48 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
        <div className="space-y-6">
          <h2 className="font-custom text-2xl font-semibold text-[#333]">
            Grading Report
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="font-custom text-destructive">
                {error instanceof Error
                  ? error.message
                  : 'Failed to load grading report.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div
        ref={reportContentRef}
        className="space-y-6"
        tabIndex={-1}
        aria-label="Grading report content"
      >
        <h2 className="font-custom text-2xl font-semibold text-[#333]">
          Grading Report
        </h2>
        <DataTable
          ref={tableRef}
          columns={columns}
          data={rows}
          totalColumnIds={GRADING_TOTAL_COLUMN_IDS}
          columnLabels={GRADING_COLUMN_LABELS}
          toolbarLeftContent={
            <>
              <DatePicker
                id="grading-report-from"
                label="From"
                value={fromDate}
                onChange={setFromDate}
              />
              <DatePicker
                id="grading-report-to"
                label="To"
                value={toDate}
                onChange={setToDate}
              />
              <Button
                variant="default"
                size="sm"
                className="font-custom focus-visible:ring-primary h-10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={handleApplyDates}
                disabled={!fromDate && !toDate}
              >
                Apply
              </Button>
              {(fromDate ||
                toDate ||
                appliedRange.dateFrom ||
                appliedRange.dateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="font-custom focus-visible:ring-primary h-10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  onClick={handleClearDates}
                >
                  Clear
                </Button>
              )}
            </>
          }
          toolbarRightContent={
            <Button
              className="font-custom focus-visible:ring-primary h-10 w-full shrink-0 gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isLoading}
              aria-label={
                isGeneratingPdf
                  ? 'Generating PDF…'
                  : isLoading
                    ? 'Loading report…'
                    : 'View report'
              }
            >
              <FileDown className="h-4 w-4 shrink-0" />
              {isGeneratingPdf ? 'Generating…' : 'View Report'}
            </Button>
          }
        />
      </div>
    </main>
  );
};

export default GradingReportTable;
