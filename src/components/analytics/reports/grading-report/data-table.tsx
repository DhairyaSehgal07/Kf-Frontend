'use client';

import type { IncomingReportPdfSnapshot } from '../incoming-report/data-table';
import {
  DataTable as IncomingDataTable,
  type IncomingReportDataTableRef,
} from '../incoming-report/data-table';

/** Snapshot of table state for grading report PDF (same shape as incoming report). */
export type GradingReportPdfSnapshot<TData> = IncomingReportPdfSnapshot<TData>;

export const DataTable = IncomingDataTable;
export type GradingReportDataTableRef<TData> =
  IncomingReportDataTableRef<TData>;
