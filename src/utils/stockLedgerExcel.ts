import * as XLSX from 'xlsx';
import { formatVoucherDate } from '@/components/daybook/vouchers/format-date';
import {
  GRADING_SIZES,
  JUTE_BAG_WEIGHT,
  LENO_BAG_WEIGHT,
} from '@/components/forms/grading/constants';
import type { StockLedgerRow } from '@/components/pdf/StockLedgerPdf';
import {
  sortRowsByGatePassNo,
  computeWtReceivedAfterGrading,
  computeLessBardanaAfterGrading,
  computeActualWtOfPotato,
  computeIncomingActualWeight,
  computeWeightShortage,
  computeWeightShortagePercent,
  computeAmountPayable,
  getTotalJuteAndLenoBags,
  SIZE_HEADER_LABELS,
} from '@/components/pdf/StockLedgerPdf';

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

/** Format cell value for display (matches PDF "—" for empty) */
function fmt(value: number | string | undefined): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return '—';
    return value.toLocaleString('en-IN');
  }
  return String(value);
}

/** One data row for Excel (same information as one PDF table row, combined JUTE/LENO into one row) */
function rowToExcelCells(row: StockLedgerRow): (string | number)[] {
  const dateStr = formatVoucherDate(row.date);
  const truckStr =
    row.truckNumber != null && String(row.truckNumber).trim() !== ''
      ? String(row.truckNumber)
      : '—';
  const slipStr =
    row.weightSlipNumber != null && String(row.weightSlipNumber).trim() !== ''
      ? row.weightSlipNumber
      : '—';
  const manualNoStr =
    row.manualIncomingVoucherNo != null &&
    String(row.manualIncomingVoucherNo).trim() !== ''
      ? String(row.manualIncomingVoucherNo)
      : '—';
  const ggpNoStr =
    row.gradingGatePassNo != null &&
    String(row.gradingGatePassNo).trim() !== ''
      ? String(row.gradingGatePassNo)
      : '—';
  const manualGgpStr =
    row.manualGradingGatePassNo != null &&
    String(row.manualGradingGatePassNo).trim() !== ''
      ? String(row.manualGradingGatePassNo)
      : '—';
  const varietyStr =
    row.variety != null && String(row.variety).trim() !== ''
      ? String(row.variety).trim()
      : '—';

  const lessBardanaKg = row.bagsReceived * JUTE_BAG_WEIGHT;
  const actualWeightKg = computeIncomingActualWeight(row);
  const { totalJute, totalLeno } = getTotalJuteAndLenoBags(row);
  const lessBardanaJute = totalJute * JUTE_BAG_WEIGHT;
  const lessBardanaLeno = totalLeno * LENO_BAG_WEIGHT;
  const wtReceivedAfterGrading = computeWtReceivedAfterGrading(row);
  const lessBardanaAfterGrading = computeLessBardanaAfterGrading(row);
  const actualWtOfPotato = computeActualWtOfPotato(row);
  const weightShortage = computeWeightShortage(row);
  const weightShortagePercent = computeWeightShortagePercent(row);
  const amountPayable = computeAmountPayable(row);

  const typeStr =
    totalJute > 0 && totalLeno > 0
      ? 'JUTE, LENO'
      : row.bagType ?? '—';

  const hasSplit = row.sizeBagsJute != null || row.sizeBagsLeno != null;
  const sizeCells = GRADING_SIZES.map((size) => {
    let totalBags: number;
    let wt: number | undefined;
    if (hasSplit) {
      const juteBags = row.sizeBagsJute?.[size] ?? 0;
      const lenoBags = row.sizeBagsLeno?.[size] ?? 0;
      totalBags = juteBags + lenoBags;
      wt = juteBags > 0 ? row.sizeWeightPerBagJute?.[size] : row.sizeWeightPerBagLeno?.[size];
    } else {
      totalBags = row.sizeBags?.[size] ?? 0;
      wt = row.sizeWeightPerBag?.[size];
    }
    if (totalBags <= 0) return '';
    if (wt != null && !Number.isNaN(wt) && wt > 0) {
      return `${totalBags} (${wt})`;
    }
    return String(totalBags);
  });

  return [
    row.incomingGatePassNo,
    manualNoStr,
    ggpNoStr,
    manualGgpStr,
    dateStr,
    row.store,
    varietyStr,
    truckStr,
    row.bagsReceived,
    slipStr,
    fmt(row.grossWeightKg),
    fmt(row.tareWeightKg),
    fmt(row.netWeightKg),
    lessBardanaKg,
    fmt(actualWeightKg),
    row.postGradingBags != null ? row.postGradingBags : '—',
    typeStr,
    ...sizeCells,
    wtReceivedAfterGrading > 0 ? wtReceivedAfterGrading : '—',
    lessBardanaAfterGrading > 0 ? lessBardanaAfterGrading : '—',
    actualWtOfPotato > 0 ? actualWtOfPotato : '—',
    weightShortage != null && !Number.isNaN(weightShortage)
      ? weightShortage
      : '—',
    weightShortagePercent != null && !Number.isNaN(weightShortagePercent)
      ? `${weightShortagePercent.toFixed(1)}%`
      : '—',
    amountPayable > 0
      ? amountPayable.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '—',
  ];
}

/** Build total row (same as PDF Total row) */
function buildTotalRow(rows: StockLedgerRow[]): (string | number)[] {
  let totalBagsReceived = 0;
  let totalGrossKg = 0;
  let totalTareKg = 0;
  let totalNetKg = 0;
  let totalLessBardanaKg = 0;
  let totalActualWeightKg = 0;
  let totalPostGradingBags = 0;
  const totalSizeBags: Record<string, number> = {};
  for (const size of GRADING_SIZES) {
    totalSizeBags[size] = 0;
  }
  let totalWtReceivedAfterGrading = 0;
  let totalLessBardanaAfterGrading = 0;
  let totalActualWtOfPotato = 0;
  let totalWeightShortage = 0;
  let totalAmountPayable = 0;

  for (const row of rows) {
    totalBagsReceived += row.bagsReceived;
    totalGrossKg += row.grossWeightKg ?? 0;
    totalTareKg += row.tareWeightKg ?? 0;
    totalNetKg += row.netWeightKg ?? 0;
    totalLessBardanaKg += row.bagsReceived * JUTE_BAG_WEIGHT;
    const actualKg = computeIncomingActualWeight(row);
    if (actualKg != null) totalActualWeightKg += actualKg;
    totalPostGradingBags += row.postGradingBags ?? 0;
    const hasSplit = row.sizeBagsJute != null || row.sizeBagsLeno != null;
    for (const size of GRADING_SIZES) {
      totalSizeBags[size] += hasSplit
        ? (row.sizeBagsJute?.[size] ?? 0) + (row.sizeBagsLeno?.[size] ?? 0)
        : (row.sizeBags?.[size] ?? 0);
    }
    totalWtReceivedAfterGrading += computeWtReceivedAfterGrading(row);
    totalLessBardanaAfterGrading += computeLessBardanaAfterGrading(row);
    totalActualWtOfPotato += computeActualWtOfPotato(row);
    const shortage = computeWeightShortage(row);
    if (shortage != null && !Number.isNaN(shortage)) totalWeightShortage += shortage;
    totalAmountPayable += computeAmountPayable(row);
  }

  const totalWeightShortagePercent =
    totalActualWeightKg > 0
      ? (totalWeightShortage / totalActualWeightKg) * 100
      : null;

  const sizeCells = GRADING_SIZES.map((size) =>
    totalSizeBags[size] > 0 ? totalSizeBags[size] : ''
  );

  return [
    'Total',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalBagsReceived,
    '',
    totalGrossKg,
    totalTareKg,
    totalNetKg,
    totalLessBardanaKg,
    totalActualWeightKg,
    totalPostGradingBags,
    '',
    ...sizeCells,
    totalWtReceivedAfterGrading > 0 ? totalWtReceivedAfterGrading : '',
    totalLessBardanaAfterGrading > 0 ? totalLessBardanaAfterGrading : '',
    totalActualWtOfPotato > 0 ? totalActualWtOfPotato : '',
    totalWeightShortage !== 0 ? totalWeightShortage : '',
    totalWeightShortagePercent != null && !Number.isNaN(totalWeightShortagePercent)
      ? `${totalWeightShortagePercent.toFixed(1)}%`
      : '',
    totalAmountPayable > 0
      ? totalAmountPayable.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '',
  ];
}

/**
 * Generate and download an xlsx file for the stock ledger (same format as PDF).
 */
export function downloadStockLedgerExcel(
  farmerName: string,
  rows: StockLedgerRow[]
): void {
  const sorted = sortRowsByGatePassNo(rows);
  const headers = getHeaders();
  const dataRows = sorted.map((row) => rowToExcelCells(row));
  const totalRow = buildTotalRow(sorted);

  const wsData: (string | number)[][] = [
    [farmerName],
    [],
    headers,
    ...dataRows,
    totalRow,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  const wb = XLSX.utils.book_new();
  const sheetName = 'Stock Ledger';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const safeName = farmerName.replace(/[/\\?*[\]:]/g, '-').slice(0, 31);
  const filename = `${safeName || 'StockLedger'}_Stock_Ledger.xlsx`;
  XLSX.writeFile(wb, filename);
}
