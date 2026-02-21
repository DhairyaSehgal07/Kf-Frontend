/** =====================================================
 *  POTATO VARIETIES
 *  ===================================================== */

export const POTATO_VARIETIES: { label: string; value: string }[] = [
  { label: 'Atlantic', value: 'Atlantic' },
  { label: 'Cardinal', value: 'Cardinal' },
  { label: 'Chipsona 1', value: 'Chipsona 1' },
  { label: 'Chipsona 2', value: 'Chipsona 2' },
  { label: 'Chipsona 3', value: 'Chipsona 3' },
  { label: 'Colomba', value: 'Colomba' },
  { label: 'Desiree', value: 'Desiree' },
  { label: 'Diamond', value: 'Diamond' },
  { label: 'FC - 11', value: 'FC - 11' },
  { label: 'FC - 12', value: 'FC - 12' },
  { label: 'FC - 5', value: 'FC - 5' },
  { label: 'Himalini', value: 'Himalini' },
  { label: 'Fry Sona', value: 'Fry Sona' },
  { label: 'K. Badshah', value: 'K. Badshah' },
  { label: 'K. Chandramukhi', value: 'K. Chandramukhi' },
  { label: 'K. Jyoti', value: 'K. Jyoti' },
  { label: 'K. Pukhraj', value: 'K. Pukhraj' },
  { label: 'Kuroda', value: 'Kuroda' },
  { label: 'Khyati', value: 'Khyati' },
  { label: 'L.R', value: 'L.R' },
  { label: 'Lima', value: 'Lima' },
  { label: 'Mohan', value: 'Mohan' },
  { label: 'Pushkar', value: 'Pushkar' },
  { label: 'SU - Khyati', value: 'SU - Khyati' },
  { label: 'Super Six', value: 'Super Six' },
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

const defaultSizeRates: Record<GradingSize, number> = {
  Ration: 0,
  Seed: 0,
  Goli: 0,
  'Number-8': 0,
  'Number-10': 0,
  'Number-12': 0,
  'Number-6/4': 0,
  Cut: 0,
};

export const BUY_BACK_COST: BuyBackCost[] = POTATO_VARIETIES.map((v) => ({
  variety: v.value,
  sizeRates: { ...defaultSizeRates },
}));
