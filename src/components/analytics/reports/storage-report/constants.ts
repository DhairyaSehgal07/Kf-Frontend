/** Column ids to sum in the storage report footer. */
export const STORAGE_TOTAL_COLUMN_IDS = ['totalBags'] as const;

/** Human-readable labels for storage report column visibility / Group by. */
export const STORAGE_COLUMN_LABELS: Record<string, string> = {
  farmerName: 'Farmer',
  accountNumber: 'Account No.',
  gatePassNo: 'Gate pass no.',
  manualGatePassNumber: 'Manual GP no.',
  date: 'Date',
  variety: 'Variety',
  storageCategory: 'Category',
  totalBags: 'Bags',
  remarks: 'Remarks',
};
