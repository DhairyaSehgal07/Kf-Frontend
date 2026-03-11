import type { ColumnDef } from '@tanstack/react-table';

/** Row shape for the grading report table and PDF. One row per order-detail line; grouping uses gradingPassGroupSize. */
export type GradingReportRow = {
  id: string;
  gradingPassGroupSize?: number;
  farmerName: string;
  accountNumber: number | string;
  farmerMobile: string;
  farmerAddress: string;
  incomingGatePassNo: number | string;
  incomingManualNo: number | string;
  incomingGatePassDate: string;
  variety: string;
  bagsReceived: number | string;
  netProductKg: number | string;
  gatePassNo: number | string;
  manualGatePassNumber?: number | string;
  date: string;
  totalGradedBags: number | string;
  totalGradedWeightKg: number | string;
  wastageKg: number | string;
  grader: string;
  remarks: string;
  grossWeightKg?: number | string;
  netWeightKg?: number | string;
};

function formatNum(value: number | string): string {
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString();
}

export const columns: ColumnDef<GradingReportRow>[] = [
  {
    accessorKey: 'farmerName',
    header: () => <span className="font-custom">Farmer</span>,
  },
  {
    accessorKey: 'accountNumber',
    header: () => <span className="font-custom">Account No.</span>,
    cell: ({ row }) => (
      <div className="font-custom text-right">
        {String(row.getValue('accountNumber') ?? '—')}
      </div>
    ),
  },
  {
    accessorKey: 'incomingGatePassNo',
    header: () => <span className="font-custom">Incoming GP no.</span>,
    cell: ({ row }) => (
      <div className="font-custom text-right">
        {String(row.getValue('incomingGatePassNo') ?? '—')}
      </div>
    ),
  },
  {
    accessorKey: 'incomingManualNo',
    header: () => <span className="font-custom">Incoming manual no.</span>,
    cell: ({ row }) => (
      <div className="font-custom text-right">
        {String(row.getValue('incomingManualNo') ?? '—')}
      </div>
    ),
  },
  {
    accessorKey: 'incomingGatePassDate',
    header: () => <span className="font-custom">Incoming GP date</span>,
  },
  {
    accessorKey: 'variety',
    header: () => <span className="font-custom">Variety</span>,
  },
  {
    accessorKey: 'bagsReceived',
    header: () => <div className="font-custom text-right">Bags rec.</div>,
    cell: ({ row }) => (
      <div className="font-custom text-right font-medium">
        {formatNum(row.getValue('bagsReceived') as number | string)}
      </div>
    ),
  },
  {
    accessorKey: 'netProductKg',
    header: () => (
      <div className="font-custom text-right">Net product (kg)</div>
    ),
    cell: ({ row }) => (
      <div className="font-custom text-right font-medium">
        {formatNum(row.getValue('netProductKg') as number | string)}
      </div>
    ),
  },
  {
    accessorKey: 'gatePassNo',
    header: () => <span className="font-custom">GP no.</span>,
    cell: ({ row }) => (
      <div className="font-custom text-right">
        {String(row.getValue('gatePassNo') ?? '—')}
      </div>
    ),
  },
  {
    accessorKey: 'date',
    header: () => <span className="font-custom">Date</span>,
  },
  {
    accessorKey: 'totalGradedBags',
    header: () => <div className="font-custom text-right">Graded bags</div>,
    cell: ({ row }) => (
      <div className="font-custom text-right font-medium">
        {formatNum(row.getValue('totalGradedBags') as number | string)}
      </div>
    ),
  },
  {
    accessorKey: 'totalGradedWeightKg',
    header: () => <div className="font-custom text-right">Graded wt (kg)</div>,
    cell: ({ row }) => (
      <div className="font-custom text-right font-medium">
        {formatNum(row.getValue('totalGradedWeightKg') as number | string)}
      </div>
    ),
  },
  {
    accessorKey: 'wastageKg',
    header: () => <div className="font-custom text-right">Wastage (kg)</div>,
    cell: ({ row }) => (
      <div className="font-custom text-right font-medium">
        {formatNum(row.getValue('wastageKg') as number | string)}
      </div>
    ),
  },
  {
    accessorKey: 'grader',
    header: () => <span className="font-custom">Grader</span>,
  },
  {
    accessorKey: 'remarks',
    header: () => <span className="font-custom">Remarks</span>,
  },
];
