'use client';

import { useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  useGetGradingGatePasses,
  gradingGatePassesQueryOptions,
} from '@/services/store-admin/grading-gate-pass/useGetGradingGatePasses';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  GradingGatePass,
  GradingGatePassIncomingRef,
} from '@/types/grading-gate-pass';
import {
  columns,
  type GradingReportRow,
  GRADING_REPORT_ROW_SPAN_COLUMN_IDS,
} from './columns';
import { GRADING_TOTAL_COLUMN_IDS } from './constants';
import {
  DataTable,
  type GradingReportDataTableRef,
  type GradingReportPdfSnapshot,
} from './data-table';
import type { VisibilityState } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/forms/date-picker';
import { Button } from '@/components/ui/button';
import { formatDateToYYYYMMDD } from '@/lib/helpers';
import { queryClient } from '@/lib/queryClient';
import { useStore } from '@/stores/store';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';
import {
  computeGradingOrderTotals,
  computeIncomingNetProductKg,
} from '@/components/daybook/vouchers/grading-voucher-calculations';

type GradingBagCellValue = {
  quantity: number;
  weightPerBagKg?: number;
};

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    const d = parseISO(iso);
    return format(d, 'do MMMM yyyy');
  } catch {
    return iso;
  }
}

function getFarmerName(
  pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): string {
  return (
    inc.farmerStorageLinkId?.farmerId?.name ??
    pass.farmerStorageLinkId?.farmerId?.name ??
    '—'
  );
}

function getAccountNumber(
  pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): number | string {
  return (
    inc.farmerStorageLinkId?.accountNumber ??
    pass.farmerStorageLinkId?.accountNumber ??
    '—'
  );
}

function getFarmerAddress(
  pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): string {
  const fromLink = (
    link: GradingGatePassIncomingRef['farmerStorageLinkId']
  ) => {
    const f = link?.farmerId;
    if (f && 'address' in f && f.address) return String(f.address);
    return undefined;
  };
  return (
    fromLink(inc.farmerStorageLinkId) ??
    fromLink(pass.farmerStorageLinkId) ??
    '—'
  );
}

function getFarmerMobile(
  pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): string {
  const fromLink = (
    link: GradingGatePassIncomingRef['farmerStorageLinkId']
  ) => {
    const f = link?.farmerId;
    if (f && 'mobileNumber' in f && f.mobileNumber)
      return String(f.mobileNumber);
    return undefined;
  };
  return (
    fromLink(inc.farmerStorageLinkId) ??
    fromLink(pass.farmerStorageLinkId) ??
    '—'
  );
}

function getIncomingGatePassNo(
  _pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): number | string {
  return inc.gatePassNo ?? '—';
}

function getIncomingManualNo(
  _pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): number | string {
  const v = inc.manualGatePassNumber;
  return v != null ? v : '—';
}

function getIncomingGatePassDate(
  _pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): string {
  return inc.date ? formatDate(inc.date) : '—';
}

function getTruckNumber(
  _pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): string {
  return inc.truckNumber ?? '—';
}

function getBagsReceived(
  _pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): number {
  return inc.bagsReceived ?? 0;
}

/**
 * Incoming net weight (kg) from weight slip: net = gross − tare.
 * GradingGatePassIncomingRef only has weightSlip with grossWeightKg/tareWeightKg.
 */
function getIncomingNetKg(
  _pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): number | undefined {
  const gross = inc.weightSlip?.grossWeightKg;
  const tare = inc.weightSlip?.tareWeightKg;
  if (gross != null && tare != null) return gross - tare;
  return undefined;
}

function getGrossTareNet(
  _pass: GradingGatePass,
  inc: GradingGatePassIncomingRef
): {
  grossWeightKg?: number;
  tareWeightKg?: number;
  netWeightKg?: number;
} {
  const gross = inc.weightSlip?.grossWeightKg;
  const tare = inc.weightSlip?.tareWeightKg;
  const netKg = getIncomingNetKg(_pass, inc);
  return {
    grossWeightKg: gross,
    tareWeightKg: tare,
    netWeightKg: netKg,
  };
}

function resolveIncomingsForPass(
  pass: GradingGatePass
): GradingGatePassIncomingRef[] {
  const fromSlip = pass.weightSlipDetails?.incomingGatePassIds;
  if (fromSlip && fromSlip.length > 0) return fromSlip;
  return pass.incomingGatePassIds ?? [];
}

/**
 * Map grading gate passes to table rows. Each grading pass has
 * incomingGatePassIds[]; when there are multiple incomings they are grouped:
 * one row per incoming with that incoming's details; grading pass details
 * (gate pass no., date, total graded bags/weight, wastage, wastage %, remarks)
 * appear on the first row of the group only. Wastage is computed at group level
 * (combined effective incoming net product − total graded weight).
 */
function mapGradingPassesToRows(passes: GradingGatePass[]): GradingReportRow[] {
  const rows: GradingReportRow[] = [];

  for (const pass of passes) {
    const incomings = resolveIncomingsForPass(pass);
    if (incomings.length === 0) continue;

    const createdByName =
      typeof pass.createdBy === 'object' && pass.createdBy !== null
        ? pass.createdBy.name
        : '—';
    const totalGradedBags = pass.orderDetails?.length
      ? pass.orderDetails.reduce(
          (sum, d) => sum + (d.initialQuantity ?? d.currentQuantity ?? 0),
          0
        )
      : 0;
    const orderDetailsBySize: Partial<
      Record<`bagSize:${string}`, GradingBagCellValue>
    > = {};
    for (const detail of pass.orderDetails ?? []) {
      if (!detail.size) continue;
      const key = `bagSize:${detail.size}` as const;
      const qty = detail.initialQuantity ?? detail.currentQuantity ?? 0;
      const weightPerBagKg = detail.weightPerBagKg ?? undefined;
      const existing = orderDetailsBySize[key];
      orderDetailsBySize[key] = {
        quantity: (existing?.quantity ?? 0) + qty,
        weightPerBagKg: existing?.weightPerBagKg ?? weightPerBagKg,
      };
    }
    const { totalGradedWeightKg } = computeGradingOrderTotals(
      pass.orderDetails as Parameters<typeof computeGradingOrderTotals>[0]
    );

    const groupTotalIncomingBags = incomings.reduce(
      (sum, inc) => sum + getBagsReceived(pass, inc),
      0
    );
    const groupEffectiveIncomingNetKg = incomings.reduce<number | undefined>(
      (acc, inc) => {
        const net = getIncomingNetKg(pass, inc);
        if (net == null) return acc;
        return (acc ?? 0) + net;
      },
      undefined
    );
    const groupEffectiveIncomingNetProductKg =
      groupEffectiveIncomingNetKg != null
        ? computeIncomingNetProductKg(
            groupEffectiveIncomingNetKg,
            groupTotalIncomingBags
          )
        : undefined;
    const wastageKg =
      groupEffectiveIncomingNetProductKg != null &&
      groupEffectiveIncomingNetProductKg > 0
        ? Math.max(0, groupEffectiveIncomingNetProductKg - totalGradedWeightKg)
        : undefined;
    const wastagePercent =
      wastageKg != null &&
      groupEffectiveIncomingNetProductKg != null &&
      groupEffectiveIncomingNetProductKg > 0
        ? (wastageKg / groupEffectiveIncomingNetProductKg) * 100
        : undefined;

    const rowsPerPass = incomings.length;
    for (let rowIndex = 0; rowIndex < rowsPerPass; rowIndex += 1) {
      const inc = incomings[rowIndex];
      const hasIncoming = inc != null;
      const isFirstRow = rowIndex === 0;
      const isIncomingContinuationRow = !hasIncoming;

      const { grossWeightKg, tareWeightKg } = hasIncoming
        ? getGrossTareNet(pass, inc)
        : { grossWeightKg: undefined, tareWeightKg: undefined };
      const totalIncomingBags = hasIncoming ? getBagsReceived(pass, inc) : 0;
      const effectiveIncomingNetKg = hasIncoming
        ? getIncomingNetKg(pass, inc)
        : undefined;
      const effectiveIncomingNetProductKg =
        effectiveIncomingNetKg != null
          ? computeIncomingNetProductKg(
              effectiveIncomingNetKg,
              totalIncomingBags
            )
          : undefined;

      rows.push({
        id: rowsPerPass > 1 ? `${pass._id}-${rowIndex}` : pass._id,
        isIncomingContinuationRow,
        farmerName: hasIncoming ? getFarmerName(pass, inc) : '',
        accountNumber: hasIncoming ? getAccountNumber(pass, inc) : '',
        farmerAddress: hasIncoming ? getFarmerAddress(pass, inc) : '',
        farmerMobile: hasIncoming ? getFarmerMobile(pass, inc) : '',
        createdByName,
        gatePassNo: isFirstRow ? (pass.gatePassNo ?? '—') : '—',
        manualGatePassNumber: isFirstRow
          ? (pass.manualGatePassNumber ?? '—')
          : '—',
        incomingGatePassNo: hasIncoming ? getIncomingGatePassNo(pass, inc) : '',
        incomingManualNo: hasIncoming ? getIncomingManualNo(pass, inc) : '',
        incomingGatePassDate: hasIncoming
          ? getIncomingGatePassDate(pass, inc)
          : '',
        date: isFirstRow ? formatDate(pass.date) : '—',
        variety: hasIncoming ? (inc.variety ?? pass.variety ?? '—') : '',
        bagType: '—',
        truckNumber: hasIncoming ? getTruckNumber(pass, inc) : '',
        bagsReceived: hasIncoming ? totalIncomingBags : 0,
        grossWeightKg: hasIncoming ? (grossWeightKg ?? '—') : 0,
        tareWeightKg: hasIncoming ? (tareWeightKg ?? '—') : 0,
        netWeightKg: hasIncoming ? (effectiveIncomingNetKg ?? '—') : 0,
        netProductKg: hasIncoming ? (effectiveIncomingNetProductKg ?? '—') : 0,
        totalGradedBags: isFirstRow ? totalGradedBags : 0,
        ...(isFirstRow ? orderDetailsBySize : {}),
        totalGradedWeightKg: isFirstRow ? totalGradedWeightKg : 0,
        wastageKg: isFirstRow ? (wastageKg ?? '—') : '—',
        wastagePercent: isFirstRow ? (wastagePercent ?? '—') : '—',
        grader: isFirstRow ? (pass.grader ?? '—') : '—',
        remarks: isFirstRow ? (pass.remarks ?? '—') : '—',
        gradingPassRowIndex: rowIndex,
        gradingPassGroupSize: rowsPerPass,
      });
    }
  }

  return rows;
}

/** Default column visibility: only incoming GP no., manual no., date, bags received, net weight */
const GRADING_REPORT_DEFAULT_COLUMN_VISIBILITY: VisibilityState = {
  incomingGatePassNo: true,
  incomingManualNo: true,
  incomingGatePassDate: true,
  bagsReceived: true,
  netWeightKg: false,
  netProductKg: true,
  truckNumber: false,
  grossWeightKg: false,
  tareWeightKg: false,
  gatePassNo: true,
  manualGatePassNumber: false,
  date: true,
  variety: true,
  bagType: true,
  totalGradedBags: true,
  totalGradedWeightKg: true,
  wastageKg: true,
  wastagePercent: true,
  remarks: false,
  farmerName: true,
  farmerAddress: false,
  farmerMobile: false,
  createdByName: false,
  accountNumber: false,
};

const GRADING_REPORT_FETCH_LIMIT = 5000;

const GradingReportTable = () => {
  const coldStorage = useStore((s) => s.coldStorage);
  const tableRef = useRef<GradingReportDataTableRef<GradingReportRow>>(null);
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [appliedRange, setAppliedRange] = useState<{
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const { data, isLoading, error } = useGetGradingGatePasses({
    limit: GRADING_REPORT_FETCH_LIMIT,
    dateFrom: appliedRange.dateFrom,
    dateTo: appliedRange.dateTo,
  });

  const rows = useMemo((): GradingReportRow[] => {
    const list = data?.list ?? [];
    return mapGradingPassesToRows(list);
  }, [data]);

  const gradingBagSizeColumnIds = useMemo((): string[] => {
    const list = data?.list ?? [];
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const pass of list) {
      for (const detail of pass.orderDetails ?? []) {
        if (!detail.size || seen.has(detail.size)) continue;
        seen.add(detail.size);
        ordered.push(`bagSize:${detail.size}`);
      }
    }
    return ordered;
  }, [data]);

  const gradingColumns = useMemo((): ColumnDef<GradingReportRow>[] => {
    const baseColumns = columns.filter(
      (c) => (c as { accessorKey?: string }).accessorKey !== 'grader'
    );
    if (gradingBagSizeColumnIds.length === 0) return baseColumns;

    const gradingBagSizeColumnDefs: ColumnDef<GradingReportRow>[] =
      gradingBagSizeColumnIds.map((columnId) => ({
        id: columnId,
        accessorKey: columnId,
        header: () => (
          <div className="font-custom text-right">
            {columnId.replace('bagSize:', '')}
          </div>
        ),
        cell: ({ row, getValue }) => {
          if (row.getIsGrouped()) {
            return (
              <div className="font-custom text-right" aria-hidden>
                —
              </div>
            );
          }

          const value = getValue<GradingBagCellValue | undefined>();
          if (value == null) {
            return <div className="font-custom text-right" aria-hidden />;
          }

          return (
            <div className="text-right">
              <div className="font-custom font-medium">
                {value.quantity.toLocaleString()}
              </div>
              {value.weightPerBagKg != null ? (
                <div className="text-muted-foreground font-custom text-xs">
                  ({value.weightPerBagKg})
                </div>
              ) : null}
            </div>
          );
        },
        aggregationFn: () => null,
        enableGrouping: false,
        enableSorting: false,
      }));

    const gradedBagsIdx = baseColumns.findIndex(
      (c) => (c as { accessorKey?: string }).accessorKey === 'totalGradedBags'
    );
    if (gradedBagsIdx < 0) return [...baseColumns, ...gradingBagSizeColumnDefs];
    return [
      ...baseColumns.slice(0, gradedBagsIdx + 1),
      ...gradingBagSizeColumnDefs,
      ...baseColumns.slice(gradedBagsIdx + 1),
    ];
  }, [gradingBagSizeColumnIds]);

  const initialColumnVisibility = useMemo((): VisibilityState => {
    if (gradingBagSizeColumnIds.length === 0)
      return GRADING_REPORT_DEFAULT_COLUMN_VISIBILITY;
    const dynamicVisibility = Object.fromEntries(
      gradingBagSizeColumnIds.map((columnId) => [columnId, true])
    ) as VisibilityState;
    return {
      ...GRADING_REPORT_DEFAULT_COLUMN_VISIBILITY,
      ...dynamicVisibility,
    };
  }, [gradingBagSizeColumnIds]);

  const rowSpanColumnIds = useMemo(
    () => [...GRADING_REPORT_ROW_SPAN_COLUMN_IDS, ...gradingBagSizeColumnIds],
    [gradingBagSizeColumnIds]
  );
  const totalColumnIds = useMemo(
    () => [...GRADING_TOTAL_COLUMN_IDS, ...gradingBagSizeColumnIds],
    [gradingBagSizeColumnIds]
  );

  const reportContentRef = useRef<HTMLDivElement>(null);

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
      limit: GRADING_REPORT_FETCH_LIMIT,
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
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(
        '<html><body style="font-family:sans-serif;padding:2rem;text-align:center;color:#666;">Generating PDF…</body></html>'
      );
    }
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
      if (printWindow) {
        printWindow.location.href = url;
      } else {
        window.location.href = url;
      }
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
          columns={gradingColumns}
          data={rows}
          totalColumnIds={totalColumnIds}
          initialColumnVisibility={initialColumnVisibility}
          rowSpanColumnIds={rowSpanColumnIds}
          showGroupedSubtotals
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
