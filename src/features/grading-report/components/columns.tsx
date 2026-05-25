import { type ColumnDef } from '@tanstack/react-table';
import { format, isValid, parseISO } from 'date-fns';

import type {
  GradingGatePassReportFarmerStorageLink,
  GradingGatePassReportOrderDetail,
  GradingGatePassReportRow,
} from '../api/types';
import {
  formatIndianInteger,
  formatIndianPercentage,
  formatIndianWeight,
  getIncomingGatePassObjects,
  parseReportNumber,
} from '../utils/report-formatters';

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

const sortText = { sortingFn: 'text' as const, sortUndefined: 'last' as const };
const sortNumeric = { sortingFn: 'reportNumeric' as const, sortUndefined: 'last' as const };
const sortDate = { sortingFn: 'reportDate' as const, sortUndefined: 'last' as const };

function numberCell({ getValue }: { getValue: () => unknown }) {
  const formatted = formatIndianWeight(getValue());

  return formatted ? <span className="tabular-nums">{formatted}</span> : emptyCell();
}

function percentageCell({ getValue }: { getValue: () => unknown }) {
  const formatted = formatIndianPercentage(getValue());

  return formatted ? <span className="tabular-nums">{formatted}%</span> : emptyCell();
}

function formatFilterFallback(value: unknown): string {
  if (value == null || value === '') return 'Blank';

  return String(value);
}

function formatDateFilterValue(value: unknown): string {
  return formatReportDate(value) ?? formatFilterFallback(value);
}

function formatIntegerFilterValue(value: unknown): string {
  return formatIndianInteger(value) ?? formatFilterFallback(value);
}

function formatWeightFilterValue(value: unknown): string {
  return formatIndianWeight(value) ?? formatFilterFallback(value);
}

function formatPercentageFilterValue(value: unknown): string {
  const formatted = formatIndianPercentage(value);

  return formatted ? `${formatted}%` : formatFilterFallback(value);
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
    meta: { filterLabel: 'Farmer' },
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
    meta: { wrap: true, filterLabel: 'Farmer address' },
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
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      groupStart: true,
      filterLabel: 'Account number',
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'gatePassNo',
    header: reportColumnHeader('Gate Pass'),
    cell: ({ row }) => <div className="tabular-nums">{row.getValue('gatePassNo')}</div>,
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      emphasize: true,
      filterLabel: 'Gate pass number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'manualGatePassNumber',
    header: reportColumnHeader('Manual GP'),
    cell: ({ row }) => <div className="tabular-nums">{row.getValue('manualGatePassNumber')}</div>,
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'Manual gate pass number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'date',
    header: reportColumnHeader('Date'),
    cell: reportDateCell,
    meta: { groupStart: true, filterLabel: 'Date', filterValueFormatter: formatDateFilterValue },
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
    meta: { filterLabel: 'Created by' },
    ...sortText,
  },
  {
    accessorKey: 'variety',
    header: reportColumnHeader('Variety'),
    meta: { filterLabel: 'Variety' },
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
        meta: {
          align: 'right',
          numeric: true,
          mono: true,
          groupStart: true,
          filterLabel: 'Incoming manual gate pass number',
          filterValueFormatter: formatIntegerFilterValue,
        },
        ...sortNumeric,
      },
      {
        id: 'incomingBagsReceived',
        accessorFn: (row) => sumIncomingGatePassNumber(row, 'bagsReceived'),
        header: reportColumnHeader('Bags'),
        meta: {
          align: 'right',
          numeric: true,
          filterLabel: 'Incoming bags',
          filterValueFormatter: formatIntegerFilterValue,
        },
        ...sortNumeric,
      },
      {
        id: 'incomingStage',
        accessorFn: (row) => getIncomingGatePassText(row, 'stage'),
        header: reportColumnHeader('Stage'),
        meta: { filterLabel: 'Incoming stage' },
        ...sortText,
      },
      {
        id: 'incomingCategory',
        accessorFn: (row) => getIncomingGatePassText(row, 'category'),
        header: reportColumnHeader('Category'),
        meta: { filterLabel: 'Incoming category' },
        ...sortText,
      },
      {
        id: 'incomingGatePassNetWeightKg',
        accessorFn: (row) => sumIncomingGatePassNumber(row, 'netWeightKg'),
        header: reportColumnHeader('Net', 'kg'),
        meta: {
          align: 'right',
          numeric: true,
          filterLabel: 'Incoming net weight',
          filterValueFormatter: formatWeightFilterValue,
        },
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
    meta: {
      align: 'right',
      numeric: true,
      groupStart: true,
      filterLabel: 'Total incoming net',
      filterValueFormatter: formatWeightFilterValue,
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'netWeightKg',
    header: reportColumnHeader('Grading Net', 'kg'),
    cell: numberCell,
    meta: {
      align: 'right',
      numeric: true,
      emphasize: true,
      filterLabel: 'Grading net',
      filterValueFormatter: formatWeightFilterValue,
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'wastageKg',
    header: reportColumnHeader('Wastage', 'kg'),
    cell: numberCell,
    meta: {
      align: 'right',
      numeric: true,
      filterLabel: 'Wastage',
      filterValueFormatter: formatWeightFilterValue,
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'wastagePercentage',
    header: reportColumnHeader('Wastage', '%'),
    cell: percentageCell,
    meta: {
      align: 'right',
      numeric: true,
      filterLabel: 'Wastage percentage',
      filterValueFormatter: formatPercentageFilterValue,
    },
    ...sortNumeric,
  },
];

const remarksColumn: ColumnDef<GradingGatePassReportRow> = {
  accessorKey: 'remarks',
  header: reportColumnHeader('Remarks'),
  meta: { wrap: true, groupStart: true, filterLabel: 'Remarks' },
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
    meta: {
      align: 'right',
      numeric: true,
      groupStart: true,
      filterLabel: `${size} bags`,
      filterValueFormatter: formatIntegerFilterValue,
    },
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
    meta: { wrap: true, filterLabel: 'Order details' },
    ...sortText,
  },
  ...summaryColumns,
  remarksColumn,
];
