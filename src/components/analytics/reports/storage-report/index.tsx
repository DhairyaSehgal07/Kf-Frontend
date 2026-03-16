'use client';

import { useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useGetStorageGatePasses } from '@/services/store-admin/storage-gate-pass/useGetStorageGatePasses';
import type { StorageGatePassWithLink } from '@/types/storage-gate-pass';
import { columns, type StorageReportRow } from './columns';
import { STORAGE_COLUMN_LABELS, STORAGE_TOTAL_COLUMN_IDS } from './constants';
import {
  DataTable,
  type StorageReportDataTableRef,
  type StorageReportPdfSnapshot,
} from './data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/forms/date-picker';
import { Button } from '@/components/ui/button';
import { formatDateToYYYYMMDD } from '@/lib/helpers';
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

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    const d = parseISO(iso);
    return format(d, 'dd MMM yyyy, HH:mm');
  } catch {
    return iso;
  }
}

/** Map storage gate passes to table rows */
function mapStorageGatePassesToRows(
  gatePasses: StorageGatePassWithLink[]
): StorageReportRow[] {
  return gatePasses.map((pass) => {
    const link = pass.farmerStorageLinkId;
    const farmer = link?.farmerId;
    const totalBags = (pass.bagSizes ?? []).reduce(
      (sum, b) => sum + (b.initialQuantity ?? b.currentQuantity ?? 0),
      0
    );
    const locations = (pass.bagSizes ?? [])
      .map((b) => [b.chamber, b.floor, b.row].filter(Boolean).join('-'))
      .filter(Boolean);
    const location =
      locations.length === 0
        ? '—'
        : [...new Set(locations)].length === 1
          ? locations[0]!
          : 'Multiple';

    return {
      id: pass._id,
      farmerName: farmer?.name ?? '—',
      accountNumber: link?.accountNumber ?? '—',
      gatePassNo: pass.gatePassNo ?? '—',
      manualGatePassNumber: pass.manualGatePassNumber ?? '—',
      date: formatDate(pass.date),
      variety: pass.variety ?? '—',
      storageCategory: pass.storageCategory ?? '—',
      totalBags,
      location,
      remarks: pass.remarks ?? '—',
      createdAt: formatDateTime(pass.createdAt),
      updatedAt: formatDateTime(pass.updatedAt),
    };
  });
}

/** Filter rows by date range (inclusive, YYYY-MM-DD) */
function filterRowsByDateRange(
  rows: StorageReportRow[],
  dateFrom?: string,
  dateTo?: string
): StorageReportRow[] {
  if (!dateFrom && !dateTo) return rows;
  return rows.filter((row) => {
    const d = row.date;
    if (d === '—') return false;
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  });
}

const StorageReportTable = () => {
  const coldStorage = useStore((s) => s.coldStorage);
  const tableRef = useRef<StorageReportDataTableRef<StorageReportRow>>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [appliedRange, setAppliedRange] = useState<{
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const { data, isLoading, error } = useGetStorageGatePasses();

  const allRows = useMemo((): StorageReportRow[] => {
    if (!data) return [];
    return mapStorageGatePassesToRows(data);
  }, [data]);

  const rows = useMemo((): StorageReportRow[] => {
    return filterRowsByDateRange(
      allRows,
      appliedRange.dateFrom,
      appliedRange.dateTo
    );
  }, [allRows, appliedRange.dateFrom, appliedRange.dateTo]);

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
    setAppliedRange({
      dateFrom: fromDate ? formatDateToYYYYMMDD(fromDate) : undefined,
      dateTo: toDate ? formatDateToYYYYMMDD(toDate) : undefined,
    });
    toast.success('Date filters applied. Report updated.');
    requestAnimationFrame(() => {
      reportContentRef.current?.focus({ preventScroll: true });
    });
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
      const snapshot: StorageReportPdfSnapshot<StorageReportRow> | null =
        tableRef.current?.getPdfSnapshot() ?? null;
      const [{ pdf }, { StorageReportTablePdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/analytics/storage-report-table-pdf'),
      ]);
      const blob = await pdf(
        <StorageReportTablePdf
          companyName={coldStorage?.name ?? 'Cold Storage'}
          dateRangeLabel={getDateRangeLabel()}
          reportTitle="Storage Report"
          rows={rows}
          tableSnapshot={snapshot}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast.success('PDF opened in new tab', {
        description: 'Storage report is ready to view or print.',
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
            Storage Report
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="font-custom text-destructive">
                {error instanceof Error
                  ? error.message
                  : 'Failed to load storage report.'}
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
        aria-label="Storage report content"
      >
        <h2 className="font-custom text-2xl font-semibold text-[#333]">
          Storage Report
        </h2>
        <DataTable
          ref={tableRef}
          columns={columns}
          data={rows}
          totalColumnIds={STORAGE_TOTAL_COLUMN_IDS}
          columnLabels={STORAGE_COLUMN_LABELS}
          toolbarLeftContent={
            <>
              <DatePicker
                id="storage-report-from"
                label="From"
                value={fromDate}
                onChange={setFromDate}
              />
              <DatePicker
                id="storage-report-to"
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

export default StorageReportTable;
