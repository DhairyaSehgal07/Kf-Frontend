'use client';

import type { IncomingReportPdfSnapshot } from '../incoming-report/data-table';
import {
  DataTable as IncomingDataTable,
  type IncomingReportDataTableRef,
} from '../incoming-report/data-table';

/** Snapshot of table state for storage report PDF (same shape as incoming report). */
export type StorageReportPdfSnapshot<TData> = IncomingReportPdfSnapshot<TData>;

export const DataTable = IncomingDataTable;
export type StorageReportDataTableRef<TData> =
  IncomingReportDataTableRef<TData>;
