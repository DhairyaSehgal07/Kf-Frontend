import { type ColumnDef } from '@tanstack/react-table';

import type { GradingGatePassReportOrderDetail, GradingGatePassReportRow } from '../api/types';

function formatOrderDetail(detail: GradingGatePassReportOrderDetail) {
  return `${detail.quantity.toLocaleString('en-IN')} bags | ${detail.weightPerBagKg.toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 3,
    },
  )} kg/bag | ${detail.bagType}`;
}

const baseColumns: ColumnDef<GradingGatePassReportRow>[] = [
  {
    accessorKey: 'gatePassNo',
    header: 'Gate Pass No.',
    cell: ({ row }) => <div className="tabular-nums">{row.getValue('gatePassNo')}</div>,
  },
  {
    accessorKey: 'manualGatePassNumber',
    header: 'Manual No.',
    cell: ({ row }) => <div className="tabular-nums">{row.getValue('manualGatePassNumber')}</div>,
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'createdBy',
    header: 'Created By',
  },
  {
    accessorKey: 'variety',
    header: 'Variety',
  },
  {
    accessorKey: 'incomingGatePassIds',
    header: 'Incoming IDs',
    cell: ({ row }) => {
      const ids = row.original.incomingGatePassIds;

      return ids.length ? ids.join(', ') : '-';
    },
  },
];

const remarksColumn: ColumnDef<GradingGatePassReportRow> = {
  accessorKey: 'remarks',
  header: 'Remarks',
};

export function getGradingReportColumns(
  rows: GradingGatePassReportRow[],
): ColumnDef<GradingGatePassReportRow>[] {
  const sizes = Array.from(
    new Set(rows.flatMap((row) => row.orderDetails.map((detail) => detail.size))),
  );

  const sizeColumns: ColumnDef<GradingGatePassReportRow>[] = sizes.map((size) => ({
    id: `size-${size}`,
    header: size,
    cell: ({ row }) => {
      const details = row.original.orderDetails.filter((detail) => detail.size === size);

      if (!details.length) return '-';

      return (
        <div className="space-y-1 tabular-nums">
          {details.map((detail, index) => (
            <div key={`${detail.size}-${detail.bagType}-${detail.weightPerBagKg}-${index}`}>
              {formatOrderDetail(detail)}
            </div>
          ))}
        </div>
      );
    },
  }));

  return [...baseColumns, ...sizeColumns, remarksColumn];
}

export const columns: ColumnDef<GradingGatePassReportRow>[] = [
  ...baseColumns,
  {
    accessorKey: 'orderDetails',
    header: 'Order Details',
    cell: ({ row }) => row.original.orderDetails.map(formatOrderDetail).join(', '),
  },
  remarksColumn,
];
