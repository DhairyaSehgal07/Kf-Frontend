import { Fragment } from 'react';
import {
  type ColumnDef,
  type SortingFn,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ClipboardList } from 'lucide-react';

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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  '[&_th]:border-border/50 [&_td]:border-border/35',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
);

type ColumnMeta = NonNullable<ColumnDef<unknown, unknown>['meta']>;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
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

function getHeadClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    'h-11 px-3 align-middle text-secondary-foreground transition-colors',
    align === 'right' && 'text-right',
    meta?.numeric === true && 'tabular-nums',
    meta?.groupStart === true && 'border-l-2 border-l-border/70',
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
    meta?.groupStart === true && 'border-l-2 border-l-border/55',
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

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const noopSortingFn: SortingFn<TData> = () => 0;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    sortingFns: {
      reportNumeric: noopSortingFn,
      reportDate: noopSortingFn,
    },
    getCoreRowModel: getCoreRowModel(),
  });
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = Math.max(visibleColumns.length, 1);

  return (
    <div className="border-border bg-card text-card-foreground flex w-full min-w-0 flex-col overflow-hidden rounded-xl border shadow-sm">
      <div className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible">
        <Table className={TABLE_GRID_CLASS}>
          <TableHeader className="bg-secondary text-secondary-foreground shadow-border/80 sticky top-0 z-10 shadow-[0_1px_0_0] [&_tr]:border-0 [&_tr]:hover:bg-transparent">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        getHeadClassName(meta),
                        header.subHeaders.length > 0 && 'text-center',
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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

                return (
                  <Fragment key={row.id}>
                    {Array.from({ length: rowSpan }).map((_, incomingIndex) => (
                      <TableRow
                        key={`${row.id}-${incomingIndex}`}
                        className={cn('hover:bg-muted/30 border-0', groupBackground)}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const meta = cell.column.columnDef.meta;

                          if (INCOMING_GATE_PASS_COLUMN_IDS.has(cell.column.id)) {
                            return (
                              <TableCell
                                key={cell.id}
                                className={cn(getBodyCellClassName(meta), 'align-top')}
                              >
                                <span className="bg-muted/60 inline-flex rounded-md px-2 py-1">
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
        </Table>
      </div>
    </div>
  );
}
