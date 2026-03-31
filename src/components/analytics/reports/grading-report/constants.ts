/** Column ids to sum in the grading report footer. */
export const GRADING_TOTAL_COLUMN_IDS = [
  'bagsReceived',
  'totalGradedBags',
  'totalGradedWeightKg',
  'wastageKg',
  'netProductKg',
  'grossWeightKg',
  'netWeightKg',
  'tareWeightKg',
] as const;

/** Human-readable labels for grading report column visibility / Group by. */
export const GRADING_COLUMN_LABELS: Record<string, string> = {
  farmerName: 'Farmer',
  accountNumber: 'Account No.',
  farmerMobile: 'Mobile',
  farmerAddress: 'Address',
  createdByName: 'Created by',
  incomingGatePassNo: 'Incoming GP no.',
  incomingManualNo: 'Incoming manual no.',
  incomingGatePassDate: 'Incoming GP date',
  truckNumber: 'Truck no.',
  variety: 'Variety',
  bagsReceived: 'Bags rec.',
  netProductKg: 'Net product (kg)',
  gatePassNo: 'GP no.',
  manualGatePassNumber: 'Manual GP no.',
  date: 'Date',
  stage: 'Stage',
  totalGradedBags: 'Graded bags',
  totalGradedWeightKg: 'Graded wt (kg)',
  wastageKg: 'Wastage (kg)',
  wastagePercent: 'Wastage (%)',
  remarks: 'Remarks',
  grossWeightKg: 'Gross (kg)',
  tareWeightKg: 'Tare (kg)',
  netWeightKg: 'Net (kg)',
};

/**
 * Columns merged vertically for one grading pass when multiple incoming rows exist.
 * Matches fields shown only on the first row of each pass group.
 */
export const GRADING_REPORT_ROW_SPAN_COLUMN_IDS: string[] = [
  'createdByName',
  'gatePassNo',
  'manualGatePassNumber',
  'date',
  'totalGradedBags',
  'totalGradedWeightKg',
  'wastageKg',
  'wastagePercent',
  'remarks',
];
