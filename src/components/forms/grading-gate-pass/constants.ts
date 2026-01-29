/** Size-wise entry labels for grading gate pass (field order as per spec) */
export const GRADING_SIZES = [
  'Below 25',
  '25–30',
  'Below 30',
  '30–35',
  '35–40',
  '30–40',
  '40–45',
  '45–50',
  '50–55',
  'Above 50',
  'Above 55',
] as const;

export type GradingSize = (typeof GRADING_SIZES)[number];

export const BAG_TYPES = ['JUTE', 'LENO'] as const;
export type BagType = (typeof BAG_TYPES)[number];
