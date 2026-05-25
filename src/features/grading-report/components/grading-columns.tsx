import { type ColumnDef, type SortingFn } from '@tanstack/react-table';
import { format, isValid, parseISO } from 'date-fns';

import type {
  GradingGatePassReportFarmerStorageLink,
  GradingGatePassReportIncomingGatePass,
  GradingGatePassReportOrderDetail,
  GradingGatePassReportRow,
} from '../api/types';

function reportColumnHeader(title: string, unit?: string) {
  return () => (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm leading-tight font-medium">{title}</span>
      {unit ? <span className="text-xs font-normal opacity-70">{unit}</span> : null}
    </span>
  );
}

function formatReportDate(value: unknown): string | null {
  if (value == null || value === '') return null;

  const parsed = parseISO(String(value));
  if (!isValid(parsed)) return String(value);

  return format(parsed, 'do MMMM yyyy');
}

function reportDateCell({ getValue }: { getValue: () => unknown }) {
  const formatted = formatReportDate(getValue());

  if (!formatted) {
    return <span className="text-muted-foreground">-</span>;
  }

  return <span className="whitespace-nowrap">{formatted}</span>;
}

function emptyCell() {
  return <span className="text-muted-foreground">-</span>;
}

function formatIndianNumber(value: unknown, maximumFractionDigits = 3) {
  if (value == null || value === '') return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);

  return parsed.toLocaleString('en-IN', { maximumFractionDigits });
}

function parseReportNumber(value: unknown): number | null {
  if (value == null || value === '') return null;

  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function compareNullableNumbers(a: number | null, b: number | null) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
}

function parseReportDateValue(value: unknown): number | null {
  if (value == null || value === '') return null;

  const parsed = parseISO(String(value));
  if (!isValid(parsed)) return null;

  return parsed.getTime();
}

const reportNumericSortingFn: SortingFn<GradingGatePassReportRow> = (rowA, rowB, columnId) =>
  compareNullableNumbers(
    parseReportNumber(rowA.getValue(columnId)),
    parseReportNumber(rowB.getValue(columnId)),
  );

const reportDateSortingFn: SortingFn<GradingGatePassReportRow> = (rowA, rowB, columnId) =>
  compareNullableNumbers(
    parseReportDateValue(rowA.getValue(columnId)),
    parseReportDateValue(rowB.getValue(columnId)),
  );

const sortText = { sortingFn: 'text' as const, sortUndefined: 'last' as const };
const sortNumeric = { sortingFn: reportNumericSortingFn, sortUndefined: 'last' as const };
const sortDate = { sortingFn: reportDateSortingFn, sortUndefined: 'last' as const };

function numberCell({ getValue }: { getValue: () => unknown }) {
  const formatted = formatIndianNumber(getValue());

  return formatted ? <span className="tabular-nums">{formatted}</span> : emptyCell();
}

function percentageCell({ getValue }: { getValue: () => unknown }) {
  const formatted = formatIndianNumber(getValue(), 2);

  return formatted ? <span className="tabular-nums">{formatted}%</span> : emptyCell();
}

function getFarmerObject(link: GradingGatePassReportFarmerStorageLink) {
  if (typeof link !== 'object' || link === null) return null;

  const farmer = link.farmer ?? link.farmerId;

  return typeof farmer === 'object' && farmer !== null ? farmer : null;
}

function getFarmerName(row: GradingGatePassReportRow) {
  const farmer = getFarmerObject(row.farmerStorageLinkId);

  return row.farmer ?? row.name ?? farmer?.name ?? '';
}

function getFarmerAddress(row: GradingGatePassReportRow) {
  const farmer = getFarmerObject(row.farmerStorageLinkId);

  return row.address ?? farmer?.address ?? '';
}

function getFarmerAccountNumber(row: GradingGatePassReportRow) {
  const link = row.farmerStorageLinkId;

  if (row.accountNumber != null) return row.accountNumber;
  if (typeof link === 'object' && link !== null && link.accountNumber != null) {
    return link.accountNumber;
  }

  return '';
}

function getCreatedByName(row: GradingGatePassReportRow) {
  const { createdBy } = row;

  return typeof createdBy === 'object' && createdBy !== null ? createdBy.name : createdBy;
}

function getIncomingGatePassObjects(row: GradingGatePassReportRow) {
  return row.incomingGatePassIds.filter(
    (
      gatePass,
    ): gatePass is Exclude<GradingGatePassReportIncomingGatePass, string> =>
      typeof gatePass === 'object' && gatePass !== null,
  );
}

function getFirstIncomingGatePassNumber(row: GradingGatePassReportRow) {
  const gatePass = getIncomingGatePassObjects(row)[0];

  return gatePass ? parseReportNumber(gatePass.manualGatePassNumber) : null;
}

function sumIncomingGatePassNumber(
  row: GradingGatePassReportRow,
  key: 'bagsReceived' | 'netWeightKg',
) {
  return getIncomingGatePassObjects(row).reduce(
    (sum, gatePass) => sum + (parseReportNumber(gatePass[key]) ?? 0),
    0,
  );
}

function getIncomingGatePassText(
  row: GradingGatePassReportRow,
  key: 'stage' | 'category',
) {
  return getIncomingGatePassObjects(row)
    .map((gatePass) => gatePass[key])
    .filter(Boolean)
    .join(', ');
}

function sumOrderDetailSizeQuantity(row: GradingGatePassReportRow, size: string) {
  return row.orderDetails.reduce((sum, detail) => {
    if (detail.size !== size) return sum;

    return sum + detail.quantity;
  }, 0);
}

function formatOrderDetailText(detail: GradingGatePassReportOrderDetail) {
  return `${detail.quantity.toLocaleString('en-IN')} bags - ${detail.bagType} (${detail.weightPerBagKg.toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 3,
    },
  )})`;
}

function renderOrderDetailValue(detail: GradingGatePassReportOrderDetail) {
  return (
    <div className="space-y-0.5 text-right tabular-nums">
      <div className="text-foreground font-semibold">
        {detail.quantity.toLocaleString('en-IN')} bags
      </div>
      <div className="text-muted-foreground text-xs font-medium">
        {detail.bagType} (
        {detail.weightPerBagKg.toLocaleString('en-IN', {
          maximumFractionDigits: 3,
        })}
        )
      </div>
    </div>
  );
}

const baseColumns: ColumnDef<GradingGatePassReportRow>[] = [
  {
    id: 'farmerName',
    accessorFn: getFarmerName,
    header: reportColumnHeader('Name'),
    cell: ({ getValue }) => {
      const value = String(getValue() ?? '');

      return value ? <span className="font-medium">{value}</span> : emptyCell();
    },
    ...sortText,
  },
  {
    id: 'farmerAddress',
    accessorFn: getFarmerAddress,
    header: reportColumnHeader('Address'),
    cell: ({ getValue }) => {
      const value = String(getValue() ?? '');

      return value || emptyCell();
    },
    meta: { wrap: true },
    ...sortText,
  },
  {
    id: 'accountNumber',
    accessorFn: getFarmerAccountNumber,
    header: reportColumnHeader('Account No.'),
    cell: ({ getValue }) => {
      const value = getValue();

      return value ? <span className="tabular-nums">{String(value)}</span> : emptyCell();
    },
    meta: { align: 'right', numeric: true, mono: true, groupStart: true },
    ...sortNumeric,
  },
  {
    accessorKey: 'gatePassNo',
    header: reportColumnHeader('Gate Pass'),
    cell: ({ row }) => <div className="tabular-nums">{row.getValue('gatePassNo')}</div>,
    meta: { align: 'right', numeric: true, mono: true, emphasize: true },
    ...sortNumeric,
  },
  {
    accessorKey: 'manualGatePassNumber',
    header: reportColumnHeader('Manual GP'),
    cell: ({ row }) => <div className="tabular-nums">{row.getValue('manualGatePassNumber')}</div>,
    meta: { align: 'right', numeric: true, mono: true },
    ...sortNumeric,
  },
  {
    accessorKey: 'date',
    header: reportColumnHeader('Date'),
    cell: reportDateCell,
    meta: { groupStart: true },
    ...sortDate,
  },
  {
    id: 'createdBy',
    accessorFn: getCreatedByName,
    header: reportColumnHeader('Created by'),
    cell: ({ getValue }) => {
      const value = String(getValue() ?? '');

      return value ? <span className="font-medium">{value}</span> : emptyCell();
    },
    ...sortText,
  },
  {
    accessorKey: 'variety',
    header: reportColumnHeader('Variety'),
    ...sortText,
  },
  {
    id: 'incomingGatePasses',
    header: reportColumnHeader('Incoming Gate Pass'),
    meta: { groupStart: true },
    enableSorting: false,
    columns: [
      {
        id: 'incomingManualGatePassNumber',
        accessorFn: getFirstIncomingGatePassNumber,
        header: reportColumnHeader('Manual GP'),
        meta: { align: 'right', numeric: true, mono: true, groupStart: true },
        ...sortNumeric,
      },
      {
        id: 'incomingBagsReceived',
        accessorFn: (row) => sumIncomingGatePassNumber(row, 'bagsReceived'),
        header: reportColumnHeader('Bags'),
        meta: { align: 'right', numeric: true },
        ...sortNumeric,
      },
      {
        id: 'incomingStage',
        accessorFn: (row) => getIncomingGatePassText(row, 'stage'),
        header: reportColumnHeader('Stage'),
        ...sortText,
      },
      {
        id: 'incomingCategory',
        accessorFn: (row) => getIncomingGatePassText(row, 'category'),
        header: reportColumnHeader('Category'),
        ...sortText,
      },
      {
        id: 'incomingGatePassNetWeightKg',
        accessorFn: (row) => sumIncomingGatePassNumber(row, 'netWeightKg'),
        header: reportColumnHeader('Net', 'kg'),
        meta: { align: 'right', numeric: true },
        ...sortNumeric,
      },
    ],
  },
];

const summaryColumns: ColumnDef<GradingGatePassReportRow>[] = [
  {
    accessorKey: 'incomingNetWeightKg',
    header: reportColumnHeader('Total Incoming Net', 'kg'),
    cell: numberCell,
    meta: { align: 'right', numeric: true, groupStart: true },
    ...sortNumeric,
  },
  {
    accessorKey: 'netWeightKg',
    header: reportColumnHeader('Grading Net', 'kg'),
    cell: numberCell,
    meta: { align: 'right', numeric: true, emphasize: true },
    ...sortNumeric,
  },
  {
    accessorKey: 'wastageKg',
    header: reportColumnHeader('Wastage', 'kg'),
    cell: numberCell,
    meta: { align: 'right', numeric: true },
    ...sortNumeric,
  },
  {
    accessorKey: 'wastagePercentage',
    header: reportColumnHeader('Wastage', '%'),
    cell: percentageCell,
    meta: { align: 'right', numeric: true },
    ...sortNumeric,
  },
];

const remarksColumn: ColumnDef<GradingGatePassReportRow> = {
  accessorKey: 'remarks',
  header: reportColumnHeader('Remarks'),
  meta: { wrap: true, groupStart: true },
  ...sortText,
};

export function getGradingReportColumns(
  rows: GradingGatePassReportRow[],
): ColumnDef<GradingGatePassReportRow>[] {
  const sizes = Array.from(
    new Set(rows.flatMap((row) => row.orderDetails.map((detail) => detail.size))),
  );

  const sizeColumns: ColumnDef<GradingGatePassReportRow>[] = sizes.map((size) => ({
    id: `size-${size}`,
    accessorFn: (row) => sumOrderDetailSizeQuantity(row, size),
    header: reportColumnHeader(size, 'bags'),
    meta: { align: 'right', numeric: true, groupStart: true },
    ...sortNumeric,
    cell: ({ row }) => {
      const details = row.original.orderDetails.filter((detail) => detail.size === size);

      if (!details.length) return '-';

      return (
        <div className="space-y-1 tabular-nums">
          {details.map((detail, index) => (
            <div key={`${detail.size}-${detail.bagType}-${detail.weightPerBagKg}-${index}`}>
              {renderOrderDetailValue(detail)}
            </div>
          ))}
        </div>
      );
    },
  }));

  return [...baseColumns, ...sizeColumns, ...summaryColumns, remarksColumn];
}

export const columns: ColumnDef<GradingGatePassReportRow>[] = [
  ...baseColumns,
  {
    accessorKey: 'orderDetails',
    header: reportColumnHeader('Order Details'),
    cell: ({ row }) => row.original.orderDetails.map(formatOrderDetailText).join(', '),
    meta: { wrap: true },
    ...sortText,
  },
  ...summaryColumns,
  remarksColumn,
];
