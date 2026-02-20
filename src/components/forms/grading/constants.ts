/** =====================================================
 *  POTATO VARIETIES
 *  ===================================================== */

export const POTATO_VARIETIES: { label: string; value: string }[] = [
  { label: 'Himalini', value: 'Himalini' },
  { label: 'B101', value: 'B101' },
  { label: 'Jyoti', value: 'Jyoti' },
];

/** =====================================================
 *  GRADING SIZES (Field order as per spec)
 *  ===================================================== */

export const GRADING_SIZES = [
  'Ration',
  'Seed',
  'Goli',
  'Number-8',
  'Number-10',
  'Number-12',
  'Number-6/4',
  'Cut',
] as const;

export type GradingSize = (typeof GRADING_SIZES)[number];

/** =====================================================
 *  BAG CONFIG
 *  ===================================================== */

export const JUTE_BAG_WEIGHT = 0.7;
export const LENO_BAG_WEIGHT = 0.06;

export const BAG_TYPES = ['JUTE', 'LENO'] as const;
export type BagType = (typeof BAG_TYPES)[number];

/** =====================================================
 *  BUY BACK COST CONFIGURATION
 *  ===================================================== */

export type Variety = (typeof POTATO_VARIETIES)[number]['value'];

export type BuyBackCost = {
  variety: Variety;
  sizeRates: Record<GradingSize, number>;
};

export const BUY_BACK_COST: BuyBackCost[] = [
  {
    variety: 'Himalini',
    sizeRates: {
      Ration: 0,
      Seed: 0,
      Goli: 0,
      'Number-8': 0,
      'Number-10': 0,
      'Number-12': 0,
      'Number-6/4': 0,
      Cut: 0,
    },
  },
  {
    variety: 'B101',
    sizeRates: {
      Ration: 0,
      Seed: 0,
      Goli: 0,
      'Number-8': 0,
      'Number-10': 0,
      'Number-12': 0,
      'Number-6/4': 0,
      Cut: 0,
    },
  },
];
