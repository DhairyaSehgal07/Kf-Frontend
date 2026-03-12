/** Column ids to sum in the grading report footer. */
export const GRADING_TOTAL_COLUMN_IDS = [
  'bagsReceived',
  'totalGradedBags',
  'totalGradedWeightKg',
  'wastageKg',
  'netProductKg',
  'grossWeightKg',
  'netWeightKg',
] as const;

/** Human-readable labels for grading report column visibility / Group by. */
export const GRADING_COLUMN_LABELS: Record<string, string> = {
  farmerName: 'Farmer',
  accountNumber: 'Account No.',
  farmerMobile: 'Mobile',
  farmerAddress: 'Address',
  incomingGatePassNo: 'Incoming GP no.',
  incomingManualNo: 'Incoming manual no.',
  incomingGatePassDate: 'Incoming GP date',
  variety: 'Variety',
  bagsReceived: 'Bags rec.',
  netProductKg: 'Net product (kg)',
  gatePassNo: 'GP no.',
  manualGatePassNumber: 'Manual GP no.',
  date: 'Date',
  totalGradedBags: 'Graded bags',
  totalGradedWeightKg: 'Graded wt (kg)',
  wastageKg: 'Wastage (kg)',
  grader: 'Grader',
  remarks: 'Remarks',
  grossWeightKg: 'Gross (kg)',
  netWeightKg: 'Net (kg)',
};

/** Column ids that span the whole grading-pass group in the PDF (one merged cell per group). Incoming-pass columns (incomingGatePassNo, incomingManualNo, incomingGatePassDate, bagsReceived, netProductKg) are not spanned so each incoming pass gets its own row. */
export const GRADING_REPORT_ROW_SPAN_COLUMN_IDS: string[] = [
  'farmerName',
  'accountNumber',
  'variety',
  'gatePassNo',
  'date',
  'totalGradedBags',
  'totalGradedWeightKg',
  'wastageKg',
  'grader',
  'remarks',
];
