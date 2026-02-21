import {
  JUTE_BAG_WEIGHT,
  LENO_BAG_WEIGHT,
  GRADING_SIZES,
  BUY_BACK_COST,
} from '@/components/forms/grading/constants';
import type { GradingSize } from '@/components/forms/grading/constants';
import type { StockLedgerRow } from './stockLedgerPdfTypes';

/** Short labels for grading size columns to save space */
export const SIZE_HEADER_LABELS: Record<string, string> = {
  'Below 25': 'B25',
  '25–30': '25-30',
  'Below 30': 'B30',
  '30–35': '30-35',
  '35–40': '35-40',
  '30–40': '30-40',
  '40–45': '40-45',
  '45–50': '45-50',
  '50–55': '50-55',
  'Above 50': 'A50',
  'Above 55': 'A55',
  Cut: 'Cut',
};

export function formatWeight(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-IN');
}

/** Round up to the next multiple of 10 */
export function roundUpToMultipleOf10(value: number): number {
  return Math.ceil(value / 10) * 10;
}

/** Sum of (bags × weightPerBagKg) for the row (wt received after grading). */
export function computeWtReceivedAfterGrading(row: StockLedgerRow): number {
  const hasSplit = row.sizeBagsJute != null || row.sizeBagsLeno != null;
  if (hasSplit) {
    let sum = 0;
    for (const size of GRADING_SIZES) {
      const juteBags = row.sizeBagsJute?.[size] ?? 0;
      const juteWt = row.sizeWeightPerBagJute?.[size] ?? 0;
      const lenoBags = row.sizeBagsLeno?.[size] ?? 0;
      const lenoWt = row.sizeWeightPerBagLeno?.[size] ?? 0;
      sum += juteBags * juteWt + lenoBags * lenoWt;
    }
    return sum;
  }
  let sum = 0;
  for (const size of GRADING_SIZES) {
    const bags = row.sizeBags?.[size] ?? 0;
    const wt = row.sizeWeightPerBag?.[size] ?? 0;
    sum += bags * wt;
  }
  return sum;
}

/** Total JUTE bags and LENO bags for the row (for less bardana after grading). */
export function getTotalJuteAndLenoBags(row: StockLedgerRow): {
  totalJute: number;
  totalLeno: number;
} {
  const hasSplit = row.sizeBagsJute != null || row.sizeBagsLeno != null;
  if (hasSplit) {
    let totalJute = 0;
    let totalLeno = 0;
    for (const size of GRADING_SIZES) {
      totalJute += row.sizeBagsJute?.[size] ?? 0;
      totalLeno += row.sizeBagsLeno?.[size] ?? 0;
    }
    return { totalJute, totalLeno };
  }
  let totalBags = 0;
  for (const size of GRADING_SIZES) {
    totalBags += row.sizeBags?.[size] ?? 0;
  }
  const isLeno = row.bagType?.toUpperCase() === 'LENO';
  return isLeno
    ? { totalJute: 0, totalLeno: totalBags }
    : { totalJute: totalBags, totalLeno: 0 };
}

/** Less bardana after grading: (JUTE bags × JUTE_BAG_WEIGHT) + (LENO bags × LENO_BAG_WEIGHT). */
export function computeLessBardanaAfterGrading(row: StockLedgerRow): number {
  const { totalJute, totalLeno } = getTotalJuteAndLenoBags(row);
  return totalJute * JUTE_BAG_WEIGHT + totalLeno * LENO_BAG_WEIGHT;
}

/** Actual wt of Potato = weight received after grading - (wastage from LENO + wastage from JUTE), rounded to nearest 10. */
export function computeActualWtOfPotato(row: StockLedgerRow): number {
  const wtReceived = computeWtReceivedAfterGrading(row);
  const lessBardana = computeLessBardanaAfterGrading(row);
  const value = wtReceived - lessBardana;
  return Math.round(value / 10) * 10;
}

/** Actual Weight from incoming gate pass (Net - Less Bardana, rounded up to multiple of 10). */
export function computeIncomingActualWeight(
  row: StockLedgerRow
): number | undefined {
  const lessBardana = row.bagsReceived * JUTE_BAG_WEIGHT;
  if (row.netWeightKg == null || Number.isNaN(row.netWeightKg)) {
    return undefined;
  }
  return roundUpToMultipleOf10(row.netWeightKg - lessBardana);
}

/** Weight Shortage = Actual Weight (incoming) - Actual wt of Potato (grading). */
export function computeWeightShortage(row: StockLedgerRow): number | undefined {
  const incoming = computeIncomingActualWeight(row);
  if (incoming == null) return undefined;
  return incoming - computeActualWtOfPotato(row);
}

/** Shortage % = (Weight Shortage / Actual Weight incoming) × 100. */
export function computeWeightShortagePercent(
  row: StockLedgerRow
): number | undefined {
  const incoming = computeIncomingActualWeight(row);
  const shortage = computeWeightShortage(row);
  if (
    incoming == null ||
    shortage == null ||
    Number.isNaN(shortage) ||
    incoming <= 0
  ) {
    return undefined;
  }
  return (shortage / incoming) * 100;
}

/** Buy-back rate (₹/kg) for a variety and size; 0 if variety not in BUY_BACK_COST or size not found. */
export function getBuyBackRate(
  variety: string | undefined,
  size: string
): number {
  if (!variety?.trim()) return 0;
  const config = BUY_BACK_COST.find(
    (c) => c.variety.toLowerCase() === variety.trim().toLowerCase()
  );
  if (!config) return 0;
  const rate = config.sizeRates[size as GradingSize];
  return rate != null && !Number.isNaN(rate) ? rate : 0;
}

/**
 * Amount Payable = for each bag size: no. of bags × (weight per bag in − wt of bag by type) × buy-back cost (variety, size).
 * Summed over all sizes, with JUTE/LENO split when available.
 */
export function computeAmountPayable(row: StockLedgerRow): number {
  const variety = row.variety?.trim();
  const hasSplit = row.sizeBagsJute != null || row.sizeBagsLeno != null;
  let sum = 0;
  if (hasSplit) {
    for (const size of GRADING_SIZES) {
      const rate = getBuyBackRate(variety, size);
      const juteBags = row.sizeBagsJute?.[size] ?? 0;
      const juteWt = row.sizeWeightPerBagJute?.[size];
      if (juteBags > 0 && juteWt != null && !Number.isNaN(juteWt)) {
        const netWtPerBag = juteWt - JUTE_BAG_WEIGHT;
        if (netWtPerBag > 0) sum += juteBags * netWtPerBag * rate;
      }
      const lenoBags = row.sizeBagsLeno?.[size] ?? 0;
      const lenoWt = row.sizeWeightPerBagLeno?.[size];
      if (lenoBags > 0 && lenoWt != null && !Number.isNaN(lenoWt)) {
        const netWtPerBag = lenoWt - LENO_BAG_WEIGHT;
        if (netWtPerBag > 0) sum += lenoBags * netWtPerBag * rate;
      }
    }
    return sum;
  }
  const isLeno = row.bagType?.toUpperCase() === 'LENO';
  const bagWt = isLeno ? LENO_BAG_WEIGHT : JUTE_BAG_WEIGHT;
  for (const size of GRADING_SIZES) {
    const bags = row.sizeBags?.[size] ?? 0;
    const wt = row.sizeWeightPerBag?.[size];
    if (bags > 0 && wt != null && !Number.isNaN(wt)) {
      const netWtPerBag = wt - bagWt;
      if (netWtPerBag > 0) {
        const rate = getBuyBackRate(variety, size);
        sum += bags * netWtPerBag * rate;
      }
    }
  }
  return sum;
}

/** Sort rows by Gate Pass No. ascending (numeric when possible). */
export function sortRowsByGatePassNo(rows: StockLedgerRow[]): StockLedgerRow[] {
  return [...rows].sort((a, b) => {
    const aNum = Number(a.incomingGatePassNo);
    const bNum = Number(b.incomingGatePassNo);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
    return String(a.incomingGatePassNo).localeCompare(
      String(b.incomingGatePassNo)
    );
  });
}
