import * as XLSX from 'xlsx';
import { GRADING_SIZES } from '@/components/forms/grading/constants';
import { SIZE_HEADER_LABELS } from '@/components/pdf/stockLedgerPdfUtils';

/** Build header row matching PDF table columns */
function getHeaders(): string[] {
  const sizeLabels = GRADING_SIZES.map((s) => SIZE_HEADER_LABELS[s] ?? s);
  return [
    'Gp No',
    'Manual No',
    'GGP No',
    'Manual GGP',
    'Date',
    'Store',
    'Variety',
    'Truck',
    'Bags Rec.',
    'Slip No.',
    'Gross',
    'Tare',
    'Net',
    'Less Bard.',
    'Actual',
    'Post Gr.',
    'Type',
    ...sizeLabels,
    'Wt Rec. After Gr.',
    'Less Bard.',
    'Actual wt of Potato',
    'Weight Shortage',
    'Shortage %',
    'Amount Payable',
  ];
}

/**
 * Generate and download an xlsx file for the stock ledger (headings only).
 */
export function downloadStockLedgerExcel(farmerName: string): void {
  const headers = getHeaders();
  const wsData: (string | number)[][] = [[farmerName], [], headers];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  const sheetName = 'Stock Ledger';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const safeName = farmerName.replace(/[/\\?*[\]:]/g, '-').slice(0, 31);
  const filename = `${safeName || 'StockLedger'}_Stock_Ledger.xlsx`;
  XLSX.writeFile(wb, filename);
}
