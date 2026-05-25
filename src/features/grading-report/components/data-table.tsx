import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import {
  type ColumnFiltersState,
  type ColumnDef,
  type SortDirection,
  type SortingState,
  type Table as TanStackTable,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ClipboardList } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { GradingGatePassReportRow } from '@/features/grading-report/api/types';
import { getGradingReportFooterContent } from '@/features/grading-report/components/report-totals-footer';
import { selectedValuesFilterFn } from '@/features/grading-report/utils/report-filter-fns';
import { reportSortingFns } from '@/features/grading-report/utils/report-sorting-fns';
import { cn } from '@/lib/utils';

const INCOMING_GATE_PASS_COLUMN_IDS = new Set([
  'incomingManualGatePassNumber',
  'incomingBagsReceived',
  'incomingStage',
  'incomingCategory',
  'incomingGatePassNetWeightKg',
]);
const SKELETON_ROW_COUNT = 8;

const TABLE_GRID_CLASS = cn(
  'border-collapse',
  '[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r',
  '[&_th]:border-border/60 [&_td]:border-border/45',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/75',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
);

type ColumnMeta = NonNullable<ColumnDef<unknown, unknown>['meta']>;

interface DataTableProps<TValue> {
  columns: ColumnDef<GradingGatePassReportRow, TValue>[];
  data: GradingGatePassReportRow[];
  isLoading?: boolean;
  onTableReady?: (table: TanStackTable<GradingGatePassReportRow>) => void;
}

type IncomingGatePassRow =
  | string
  | {
      _id?: string;
      manualGatePassNumber?: number | string;
      bagsReceived?: number | string;
      stage?: string;
      category?: string;
      netWeightKg?: number | string;
    };

function SortIcon({ sorted }: { sorted: false | SortDirection }) {
  if (sorted === 'desc') {
    return <ArrowDown className="size-3.5 shrink-0" aria-hidden />;
  }

  if (sorted === 'asc') {
    return <ArrowUp className="size-3.5 shrink-0" aria-hidden />;
  }

  return <ArrowUpDown className="size-3.5 shrink-0" aria-hidden />;
}

function getIncomingGatePasses(row: unknown): IncomingGatePassRow[] {
  if (typeof row !== 'object' || row === null || !('incomingGatePassIds' in row)) {
    return [];
  }

  const value = (row as { incomingGatePassIds?: unknown }).incomingGatePassIds;

  return Array.isArray(value) ? (value as IncomingGatePassRow[]) : [];
}

function formatIndianNumber(value: unknown, maximumFractionDigits = 3) {
  if (value == null || value === '') return '-';

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);

  return parsed.toLocaleString('en-IN', { maximumFractionDigits });
}

function getIncomingGatePassValue(gatePass: IncomingGatePassRow | undefined, columnId: string) {
  if (!gatePass) return '-';

  if (typeof gatePass === 'string') {
    return '-';
  }

  switch (columnId) {
    case 'incomingManualGatePassNumber':
      return gatePass.manualGatePassNumber ?? '-';
    case 'incomingBagsReceived':
      return formatIndianNumber(gatePass.bagsReceived, 0);
    case 'incomingStage':
      return gatePass.stage ?? '-';
    case 'incomingCategory':
      return gatePass.category ?? '-';
    case 'incomingGatePassNetWeightKg':
      return formatIndianNumber(gatePass.netWeightKg);
    default:
      return '-';
  }
}

function getColumnAlign(meta: ColumnMeta | undefined): 'left' | 'right' {
  return meta?.align ?? 'left';
}

function isWrapColumn(meta: ColumnMeta | undefined) {
  return meta?.wrap === true;
}

function getHeadClassName(meta: ColumnMeta | undefined, isHeaderScrolled: boolean) {
  const align = getColumnAlign(meta);

  return cn(
    'h-11 px-3 align-middle transition-[background-color,color,padding] duration-200',
    isHeaderScrolled
      ? 'bg-muted/60 text-foreground supports-backdrop-filter:bg-muted/55 backdrop-blur-sm'
      : 'bg-secondary text-secondary-foreground',
    align === 'right' && 'text-right',
    meta?.numeric === true && 'tabular-nums',
    meta?.groupStart === true && 'border-l-2 border-l-border/80',
    isWrapColumn(meta) && 'min-w-[14rem] whitespace-normal',
  );
}

function getBodyCellClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    'px-3 py-3 align-middle text-sm text-foreground transition-colors',
    align === 'right' && 'text-right',
    meta?.numeric === true && 'tabular-nums font-medium',
    meta?.mono === true && 'font-mono',
    meta?.emphasize === true && 'font-semibold',
    meta?.groupStart === true && 'border-l-2 border-l-border/65',
    isWrapColumn(meta)
      ? 'min-w-[14rem] max-w-[22rem] whitespace-normal break-words leading-relaxed'
      : 'whitespace-nowrap',
  );
}

function getSkeletonClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    'h-5 rounded-md',
    isWrapColumn(meta) ? 'h-12 w-full' : 'w-full max-w-36',
    (align === 'right' || meta?.numeric === true || meta?.mono === true) &&
      !isWrapColumn(meta) &&
      'ml-auto w-16',
  );
}

function getFooterClassName(meta: ColumnMeta | undefined) {
  return cn(
    getBodyCellClassName(meta),
    'bg-muted/60 font-semibold supports-backdrop-filter:bg-muted/55 backdrop-blur-sm',
  );
}

export function DataTable<TValue>({
  columns,
  data,
  isLoading = false,
  onTableReady,
}: DataTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isFooterElevated, setIsFooterElevated] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      filterFn: selectedValuesFilterFn,
    },
    sortingFns: reportSortingFns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(),
    sortDescFirst: false,
    enableSortingRemoval: true,
  });
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = Math.max(visibleColumns.length, 1);
  const hasDataRows = !isLoading && rows.length > 0;
  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setIsHeaderScrolled(el.scrollTop > 0);
    setIsFooterElevated(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    handleTableScroll();
  }, [handleTableScroll, isLoading, rows.length]);

  useEffect(() => {
    onTableReady?.(table);
  }, [onTableReady, table]);

  return (
    <div className="border-border bg-card text-card-foreground flex w-full min-w-0 flex-col overflow-hidden rounded-xl border shadow-sm">
      <div
        ref={scrollContainerRef}
        onScroll={handleTableScroll}
        className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible"
      >
        <Table className={TABLE_GRID_CLASS}>
          <TableHeader
            className={cn(
              'sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent',
              isHeaderScrolled && 'shadow-border/80 shadow-[0_1px_0_0]',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort() && header.subHeaders.length === 0;
                  const align = getColumnAlign(meta);
                  const headerContent = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                      }
                      className={cn(
                        'group/head',
                        getHeadClassName(meta, isHeaderScrolled),
                        header.subHeaders.length > 0 &&
                          'h-10 text-center [&>span]:items-center [&>span>span:first-child]:text-xs [&>span>span:first-child]:font-semibold [&>span>span:first-child]:tracking-[0.08em] [&>span>span:first-child]:uppercase',
                        header.subHeaders.length === 0 &&
                          '[&>span>span:first-child]:font-semibold',
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          className={cn(
                            'flex w-full min-w-0 items-center gap-1.5 rounded-md text-inherit transition-colors hover:text-foreground focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none',
                            align === 'right'
                              ? 'justify-end text-right'
                              : 'justify-between text-left',
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {headerContent}
                          <span
                            className={cn(
                              'text-muted-foreground shrink-0 transition-opacity',
                              sorted ? 'opacity-100' : 'opacity-0 group-hover/head:opacity-70',
                            )}
                          >
                            <SortIcon sorted={sorted} />
                          </span>
                        </button>
                      ) : (
                        headerContent
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className="even:bg-muted/15 border-0">
                  {visibleColumns.map((column) => {
                    const meta = column.columnDef.meta;

                    return (
                      <TableCell
                        key={`skeleton-${rowIndex}-${column.id}`}
                        className={getBodyCellClassName(meta)}
                      >
                        <Skeleton className={getSkeletonClassName(meta)} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => {
                const incomingGatePasses = getIncomingGatePasses(row.original);
                const rowSpan = Math.max(incomingGatePasses.length, 1);
                const groupBackground = row.index % 2 === 1 ? 'bg-muted/15' : 'bg-card';
                const groupBoundary =
                  row.index > 0 ? '[&>td]:border-t-2 [&>td]:border-t-border/70' : undefined;

                return (
                  <Fragment key={row.id}>
                    {Array.from({ length: rowSpan }).map((_, incomingIndex) => (
                      <TableRow
                        key={`${row.id}-${incomingIndex}`}
                        className={cn(
                          'hover:bg-muted/30 border-0',
                          groupBackground,
                          incomingIndex === 0 && groupBoundary,
                        )}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const meta = cell.column.columnDef.meta;

                          if (INCOMING_GATE_PASS_COLUMN_IDS.has(cell.column.id)) {
                            return (
                              <TableCell
                                key={cell.id}
                                className={cn(
                                  getBodyCellClassName(meta),
                                  'bg-muted/25 align-top',
                                )}
                              >
                                <span
                                  className={cn(
                                    'border-border/60 bg-background/80 text-foreground inline-flex max-w-full rounded-md border px-2 py-1 shadow-sm',
                                    getColumnAlign(meta) === 'right' && 'ml-auto justify-end',
                                  )}
                                >
                                  {getIncomingGatePassValue(
                                    incomingGatePasses[incomingIndex],
                                    cell.column.id,
                                  )}
                                </span>
                              </TableCell>
                            );
                          }

                          if (incomingIndex > 0) return null;

                          return (
                            <TableCell
                              key={cell.id}
                              rowSpan={rowSpan}
                              className={cn(
                                getBodyCellClassName(meta),
                                'align-top',
                                groupBackground,
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })
            ) : (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell colSpan={columnCount} className="border-0 p-0 last:border-r-0">
                  <Empty className="bg-muted/20 rounded-none border-0 py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ClipboardList />
                      </EmptyMedia>
                      <EmptyTitle>No grading entries found</EmptyTitle>
                      <EmptyDescription>
                        Adjust the date filters above or reset to load the full report.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {hasDataRows ? (
            <TableFooter
              className={cn(
                'sticky bottom-0 z-10 border-0 bg-transparent [&>tr]:border-0',
                isFooterElevated && 'shadow-border/80 shadow-[0_-1px_0_0]',
              )}
            >
              <TableRow className="border-0 hover:bg-transparent">
                {visibleColumns.map((column, columnIndex) => {
                  const meta = column.columnDef.meta;
                  const footerContent =
                    columnIndex === 0 ? (
                      <span className="text-foreground text-sm font-semibold">Total</span>
                    ) : (
                      getGradingReportFooterContent(column.id, rows)
                    );

                  if (columnIndex === 0) {
                    return (
                      <TableHead
                        key={`footer-${column.id}`}
                        scope="row"
                        className={getFooterClassName(meta)}
                      >
                        {footerContent}
                      </TableHead>
                    );
                  }

                  return (
                    <TableCell
                      key={`footer-${column.id}`}
                      className={getFooterClassName(meta)}
                      aria-label={footerContent ? 'column total' : undefined}
                    >
                      {footerContent}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>
    </div>
  );
}
