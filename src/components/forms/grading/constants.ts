/** Common potato varieties (shared by incoming, grading, etc.) */
/** Common potato varieties (shared by incoming, grading, etc.) */
export const POTATO_VARIETIES: { label: string; value: string }[] = [
  { label: 'Himalini', value: 'Himalini' },
  { label: 'B101', value: 'B101' },
  { label: 'Jyoti', value: 'Jyoti' },
];

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
  'Cut',
] as const;

export const JUTE_BAG_WEIGHT = 0.7;
export const LENO_BAG_WEIGHT = 0.06;

export type GradingSize = (typeof GRADING_SIZES)[number];

export const BAG_TYPES = ['JUTE', 'LENO'] as const;
export type BagType = (typeof BAG_TYPES)[number];
