import type { GradingOrderDetailRow } from './types';

/** Tolerance (in percentage points) for treating graded + wastage % as equal to 100. */
export const PERCENT_TOLERANCE = 0.1;

export interface GradingOrderTotals {
  totalQty: number;
  totalInitial: number;
  totalGradedWeightKg: number;
}

/**
 * Compute totals from grading order details: total qty, total initial qty, and total graded weight (sum of initialQuantity × weightPerBagKg).
 */
export function computeGradingOrderTotals(
  orderDetails: GradingOrderDetailRow[] | null | undefined
): GradingOrderTotals {
  const details = orderDetails ?? [];
  let totalQty = 0;
  let totalInitial = 0;
  let totalGradedWeightKg = 0;
  for (const od of details) {
    totalQty += od.currentQuantity ?? 0;
    totalInitial += od.initialQuantity ?? 0;
    totalGradedWeightKg += (od.initialQuantity ?? 0) * (od.weightPerBagKg ?? 0);
  }
  return { totalQty, totalInitial, totalGradedWeightKg };
}

/**
 * Total graded weight as % of net incoming weight. Returns undefined if net is missing or zero.
 */
export function computeTotalGradedWeightPercent(
  totalGradedWeightKg: number,
  incomingNetKg: number | null | undefined
): number | undefined {
  if (incomingNetKg == null || incomingNetKg <= 0 || totalGradedWeightKg <= 0) {
    return undefined;
  }
  return (totalGradedWeightKg / incomingNetKg) * 100;
}

export interface DiscrepancyResult {
  percentSum: number | undefined;
  hasDiscrepancy: boolean;
  discrepancyValue: number | undefined;
}

/**
 * Check if graded % + wastage % equals 100 (within tolerance). Returns sum, whether there's a discrepancy, and the difference from 100.
 */
export function computeDiscrepancy(
  totalGradedWeightPercent: number | undefined,
  wastagePercent: number | undefined
): DiscrepancyResult {
  const percentSum =
    totalGradedWeightPercent != null && wastagePercent != null
      ? totalGradedWeightPercent + wastagePercent
      : undefined;
  const hasDiscrepancy =
    percentSum != null && Math.abs(percentSum - 100) > PERCENT_TOLERANCE;
  const discrepancyValue =
    hasDiscrepancy && percentSum != null ? 100 - percentSum : undefined;
  return { percentSum, hasDiscrepancy, discrepancyValue };
}
