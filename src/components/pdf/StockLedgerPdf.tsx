import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatVoucherDate } from '@/components/daybook/vouchers/format-date';
import {
  JUTE_BAG_WEIGHT,
  LENO_BAG_WEIGHT,
  GRADING_SIZES,
} from '@/components/forms/grading/constants';

/** Single row data for the stock ledger table */
export interface StockLedgerRow {
  serialNo: number;
  date: string | undefined;
  incomingGatePassNo: number | string;
  store: string;
  truckNumber: string | number | undefined;
  bagsReceived: number;
  weightSlipNumber?: string;
  grossWeightKg?: number;
  tareWeightKg?: number;
  netWeightKg?: number;
  /** Sum of bags across all sizes from grading voucher(s) for this incoming */
  postGradingBags?: number;
  /** Bag type from grading (JUTE or LENO). Used when sizeBagsJute/sizeBagsLeno not provided. */
  bagType?: string;
  /** Per-size bag counts from grading voucher(s). Key = size label from GRADING_SIZES. Fallback when sizeBagsJute/sizeBagsLeno not provided. */
  sizeBags?: Record<string, number>;
  /** Per-size bag counts for JUTE bags (used for TYPE column bifurcation). */
  sizeBagsJute?: Record<string, number>;
  /** Per-size bag counts for LENO bags (used for TYPE column bifurcation). */
  sizeBagsLeno?: Record<string, number>;
  /** Per-size weight per bag (kg) for JUTE. Shown in brackets below quantity. */
  sizeWeightPerBagJute?: Record<string, number>;
  /** Per-size weight per bag (kg) for LENO. Shown in brackets below quantity. */
  sizeWeightPerBagLeno?: Record<string, number>;
  /** Per-size weight per bag (kg) when sizeBags used without JUTE/LENO split. */
  sizeWeightPerBag?: Record<string, number>;
}

export interface StockLedgerPdfProps {
  farmerName: string;
  rows: StockLedgerRow[];
}

const HEADER_BG = '#f9fafb';
const BORDER = '#e5e7eb';
/** Height of one data sub-row for TYPE + size columns (used for rowSpan 2 alignment). */
const ROW_HEIGHT = 12;

/** Column widths sized to fit A4 landscape (~818pt content width). */
const COL_WIDTHS = {
  gpNo: 46,
  date: 52,
  store: 56,
  truckNumber: 56,
  bagsReceived: 38,
  weightSlipNo: 40,
  grossWeight: 32,
  tareWeight: 32,
  netWeight: 32,
  lessBardana: 40,
  actualWeight: 40,
  postGradingBags: 38,
  bagType: 28,
  /** Width for each grading size column (Below 25, 25–30, etc.) */
  sizeColumn: 20,
  /** Wt Received After Grading (row span after size columns) */
  wtReceivedAfterGrading: 44,
  /** Less Bardana after grading (bifurcated: JUTE/LENO bag weight deduction) */
  lessBardanaAfterGrading: 38,
} as const;

/** Total width of left block (Gp No through Post Gr.) for exact alignment. */
const LEFT_BLOCK_WIDTH =
  COL_WIDTHS.gpNo +
  COL_WIDTHS.date +
  COL_WIDTHS.store +
  COL_WIDTHS.truckNumber +
  COL_WIDTHS.bagsReceived +
  COL_WIDTHS.weightSlipNo +
  COL_WIDTHS.grossWeight +
  COL_WIDTHS.tareWeight +
  COL_WIDTHS.netWeight +
  COL_WIDTHS.lessBardana +
  COL_WIDTHS.actualWeight +
  COL_WIDTHS.postGradingBags;

/** Total width of middle block (Type + size columns only; bifurcation ends here). */
const MIDDLE_BLOCK_WIDTH =
  COL_WIDTHS.bagType + GRADING_SIZES.length * COL_WIDTHS.sizeColumn;

const styles = StyleSheet.create({
  page: {
    padding: 12,
    fontSize: 4,
    fontFamily: 'Helvetica',
  },
  titleRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER,
    borderBottomWidth: 0,
    paddingVertical: 2,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 7,
    fontWeight: 700,
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: HEADER_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderBottomWidth: 0,
    flexShrink: 0,
  },
  dataRow: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    flexShrink: 0,
  },
  /** Wrapper for a logical data row: left block (rowSpan 2) + right block (TYPE + sizes, 2 sub-rows). */
  dataRowWrapper: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    flexShrink: 0,
  },
  /** Left block (No. through Post Gr.) that spans 2 sub-rows. */
  dataRowLeftBlock: {
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: ROW_HEIGHT * 2,
    width: LEFT_BLOCK_WIDTH,
    flexShrink: 0,
  },
  dataRowLeftBlockRow: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  /** Middle block (Type + size columns) - bifurcation; fixed width for alignment. */
  dataRowMiddleBlock: {
    width: MIDDLE_BLOCK_WIDTH,
    flexShrink: 0,
  },
  /** Block: Wt Received After Grading (row span 2, like left block). */
  dataRowWtReceivedBlock: {
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: ROW_HEIGHT * 2,
    width: COL_WIDTHS.wtReceivedAfterGrading,
    flexShrink: 0,
    borderLeftWidth: 1,
    borderColor: BORDER,
  },
  /** Block: Less Bardana after grading (2 sub-rows: JUTE row value, LENO row value). */
  dataRowLessBardanaBlock: {
    width: COL_WIDTHS.lessBardanaAfterGrading,
    flexShrink: 0,
    borderLeftWidth: 1,
    borderColor: BORDER,
  },
  /** Single sub-row for TYPE + size columns (JUTE or LENO). */
  dataSubRow: {
    flexDirection: 'row',
    minHeight: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderColor: BORDER,
    flexShrink: 0,
  },
  dataSubRowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingVertical: 1,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    borderColor: BORDER,
    flexShrink: 0,
  },
  cellLast: {
    borderRightWidth: 0,
  },
  headerCell: {
    paddingVertical: 1,
    paddingHorizontal: 2,
    fontWeight: 700,
    fontSize: 3.5,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    borderRightWidth: 1,
    borderColor: BORDER,
    flexShrink: 0,
  },
  headerCellLast: {
    borderRightWidth: 0,
  },
  cellCenter: {
    textAlign: 'center',
  },
  cellRight: {
    textAlign: 'right',
  },
  /** Wrapper for size cell content (quantity + weight line) to keep right-aligned block */
  sizeCellContent: {
    alignItems: 'flex-end',
  },
  /** Second line in size cell: weight per bag in brackets */
  sizeCellSub: {
    fontSize: 3,
    color: '#6b7280',
  },
  totalRow: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#f3f4f6',
    flexShrink: 0,
  },
  totalCell: {
    paddingVertical: 1,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    borderColor: BORDER,
    flexShrink: 0,
  },
  totalCellText: {
    fontWeight: 700,
  },
});

/** Short labels for grading size columns to save space */
const SIZE_HEADER_LABELS: Record<string, string> = {
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

function TableHeader() {
  return (
    <View style={styles.headerRow}>
      <View style={[styles.headerCell, { width: COL_WIDTHS.gpNo }]}>
        <Text style={styles.cellCenter}>Gp No</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.date }]}>
        <Text>Date</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.store }]}>
        <Text>Store</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.truckNumber }]}>
        <Text>Truck</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.bagsReceived }]}>
        <Text style={styles.cellRight}>Bags Rec.</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.weightSlipNo }]}>
        <Text>Slip No.</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.grossWeight }]}>
        <Text style={styles.cellRight}>Gross</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.tareWeight }]}>
        <Text style={styles.cellRight}>Tare</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.netWeight }]}>
        <Text style={styles.cellRight}>Net</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.lessBardana }]}>
        <Text style={styles.cellRight}>Less Bard.</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.actualWeight }]}>
        <Text style={styles.cellRight}>Actual</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.postGradingBags }]}>
        <Text style={styles.cellRight}>Post Gr.</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.bagType }]}>
        <Text style={styles.cellCenter}>Type</Text>
      </View>
      {GRADING_SIZES.map((size) => (
        <View
          key={size}
          style={[styles.headerCell, { width: COL_WIDTHS.sizeColumn }]}
        >
          <Text style={styles.cellCenter}>
            {SIZE_HEADER_LABELS[size] ?? size}
          </Text>
        </View>
      ))}
      <View
        style={[
          styles.headerCell,
          { width: COL_WIDTHS.wtReceivedAfterGrading },
        ]}
      >
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>
          Wt Rec. After Gr.
        </Text>
      </View>
      <View
        style={[
          styles.headerCell,
          styles.headerCellLast,
          { width: COL_WIDTHS.lessBardanaAfterGrading },
        ]}
      >
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>Less Bard.</Text>
      </View>
    </View>
  );
}

function formatWeight(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-IN');
}

/** Round up to the next multiple of 10 */
function roundUpToMultipleOf10(value: number): number {
  return Math.ceil(value / 10) * 10;
}

/** Sum of (bags × weightPerBagKg) for the row (wt received after grading). */
function computeWtReceivedAfterGrading(row: StockLedgerRow): number {
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
function getTotalJuteAndLenoBags(row: StockLedgerRow): {
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
function computeLessBardanaAfterGrading(row: StockLedgerRow): number {
  const { totalJute, totalLeno } = getTotalJuteAndLenoBags(row);
  return totalJute * JUTE_BAG_WEIGHT + totalLeno * LENO_BAG_WEIGHT;
}

function computeTotals(rows: StockLedgerRow[]) {
  let totalBagsReceived = 0;
  let totalGrossKg = 0;
  let totalTareKg = 0;
  let totalNetKg = 0;
  let totalLessBardanaKg = 0;
  let totalActualWeightKg = 0;
  for (const row of rows) {
    totalBagsReceived += row.bagsReceived;
    totalGrossKg += row.grossWeightKg ?? 0;
    totalTareKg += row.tareWeightKg ?? 0;
    totalNetKg += row.netWeightKg ?? 0;
    const lessBardana = row.bagsReceived * JUTE_BAG_WEIGHT;
    totalLessBardanaKg += lessBardana;
    if (row.netWeightKg != null && !Number.isNaN(row.netWeightKg)) {
      totalActualWeightKg += roundUpToMultipleOf10(
        row.netWeightKg - lessBardana
      );
    }
  }
  let totalPostGradingBags = 0;
  for (const row of rows) {
    totalPostGradingBags += row.postGradingBags ?? 0;
  }
  const totalSizeBags: Record<string, number> = {};
  for (const size of GRADING_SIZES) {
    totalSizeBags[size] = rows.reduce((sum, row) => {
      const hasSplit = row.sizeBagsJute != null || row.sizeBagsLeno != null;
      if (hasSplit) {
        return (
          sum +
          (row.sizeBagsJute?.[size] ?? 0) +
          (row.sizeBagsLeno?.[size] ?? 0)
        );
      }
      return sum + (row.sizeBags?.[size] ?? 0);
    }, 0);
  }
  let totalWtReceivedAfterGrading = 0;
  for (const row of rows) {
    totalWtReceivedAfterGrading += computeWtReceivedAfterGrading(row);
  }
  let totalLessBardanaAfterGrading = 0;
  for (const row of rows) {
    totalLessBardanaAfterGrading += computeLessBardanaAfterGrading(row);
  }
  return {
    totalBagsReceived,
    totalGrossKg,
    totalTareKg,
    totalNetKg,
    totalLessBardanaKg,
    totalActualWeightKg,
    totalPostGradingBags,
    totalSizeBags,
    totalWtReceivedAfterGrading,
    totalLessBardanaAfterGrading,
  };
}

function TotalRow({ rows }: { rows: StockLedgerRow[] }) {
  const totals = computeTotals(rows);
  const boldRight = [styles.cellRight, styles.totalCellText];
  return (
    <View style={styles.totalRow}>
      <View style={[styles.totalCell, { width: COL_WIDTHS.gpNo }]}>
        <Text style={[styles.cellCenter, styles.totalCellText]}>Total</Text>
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.date }]}>
        <Text />
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.store }]}>
        <Text />
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.truckNumber }]}>
        <Text />
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.bagsReceived }]}>
        <Text style={boldRight}>
          {totals.totalBagsReceived.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.weightSlipNo }]}>
        <Text />
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.grossWeight }]}>
        <Text style={boldRight}>
          {totals.totalGrossKg.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.tareWeight }]}>
        <Text style={boldRight}>
          {totals.totalTareKg.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.netWeight }]}>
        <Text style={boldRight}>
          {totals.totalNetKg.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.lessBardana }]}>
        <Text style={boldRight}>
          {totals.totalLessBardanaKg.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.actualWeight }]}>
        <Text style={boldRight}>
          {totals.totalActualWeightKg.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.postGradingBags }]}>
        <Text style={boldRight}>
          {totals.totalPostGradingBags.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.totalCell, { width: COL_WIDTHS.bagType }]}>
        <Text />
      </View>
      {GRADING_SIZES.map((size) => (
        <View
          key={size}
          style={[styles.totalCell, { width: COL_WIDTHS.sizeColumn }]}
        >
          <Text style={boldRight}>
            {totals.totalSizeBags[size] > 0
              ? totals.totalSizeBags[size].toLocaleString('en-IN')
              : ''}
          </Text>
        </View>
      ))}
      <View
        style={[styles.totalCell, { width: COL_WIDTHS.wtReceivedAfterGrading }]}
      >
        <Text style={boldRight}>
          {totals.totalWtReceivedAfterGrading > 0
            ? totals.totalWtReceivedAfterGrading.toLocaleString('en-IN')
            : ''}
        </Text>
      </View>
      <View
        style={[
          styles.totalCell,
          styles.cellLast,
          { width: COL_WIDTHS.lessBardanaAfterGrading },
        ]}
      >
        <Text style={boldRight}>
          {totals.totalLessBardanaAfterGrading > 0
            ? totals.totalLessBardanaAfterGrading.toLocaleString('en-IN')
            : ''}
        </Text>
      </View>
    </View>
  );
}

/** Resolve JUTE size bags: explicit sizeBagsJute or legacy bagType + sizeBags. */
function getSizeBagsJute(
  row: StockLedgerRow
): Record<string, number> | undefined {
  if (row.sizeBagsJute != null && Object.keys(row.sizeBagsJute).length > 0)
    return row.sizeBagsJute;
  if (row.bagType === 'JUTE' && row.sizeBags) return row.sizeBags;
  return undefined;
}

/** Resolve LENO size bags: explicit sizeBagsLeno or legacy bagType + sizeBags. */
function getSizeBagsLeno(
  row: StockLedgerRow
): Record<string, number> | undefined {
  if (row.sizeBagsLeno != null && Object.keys(row.sizeBagsLeno).length > 0)
    return row.sizeBagsLeno;
  if (row.bagType === 'LENO' && row.sizeBags) return row.sizeBags;
  return undefined;
}

function DataRow({ row }: { row: StockLedgerRow }) {
  const dateStr = formatVoucherDate(row.date);
  const truckStr =
    row.truckNumber != null && String(row.truckNumber).trim() !== ''
      ? String(row.truckNumber)
      : '—';
  const slipStr =
    row.weightSlipNumber != null && String(row.weightSlipNumber).trim() !== ''
      ? row.weightSlipNumber
      : '—';

  const lessBardanaKg = row.bagsReceived * JUTE_BAG_WEIGHT;
  const actualWeightKg =
    row.netWeightKg != null && !Number.isNaN(row.netWeightKg)
      ? roundUpToMultipleOf10(row.netWeightKg - lessBardanaKg)
      : undefined;

  const sizeBagsJute = getSizeBagsJute(row);
  const sizeBagsLeno = getSizeBagsLeno(row);
  const hasPostGrading =
    row.postGradingBags != null || sizeBagsJute != null || sizeBagsLeno != null;

  const leftCells = (
    <>
      <View style={[styles.cell, { width: COL_WIDTHS.gpNo }]}>
        <Text style={styles.cellCenter}>{row.incomingGatePassNo}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.date }]}>
        <Text>{dateStr}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.store }]}>
        <Text>{row.store}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.truckNumber }]}>
        <Text>{truckStr}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.bagsReceived }]}>
        <Text style={styles.cellRight}>
          {row.bagsReceived.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.weightSlipNo }]}>
        <Text>{slipStr}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.grossWeight }]}>
        <Text style={styles.cellRight}>{formatWeight(row.grossWeightKg)}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.tareWeight }]}>
        <Text style={styles.cellRight}>{formatWeight(row.tareWeightKg)}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.netWeight }]}>
        <Text style={styles.cellRight}>{formatWeight(row.netWeightKg)}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.lessBardana }]}>
        <Text style={styles.cellRight}>
          {lessBardanaKg.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.actualWeight }]}>
        <Text style={styles.cellRight}>{formatWeight(actualWeightKg)}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTHS.postGradingBags }]}>
        <Text style={styles.cellRight}>
          {row.postGradingBags != null
            ? row.postGradingBags.toLocaleString('en-IN')
            : '—'}
        </Text>
      </View>
    </>
  );

  const typeAndSizeCells = (
    bagType: 'JUTE' | 'LENO',
    sizeBags: Record<string, number> | undefined,
    sizeWeightPerBag: Record<string, number> | undefined
  ) => (
    <>
      <View style={[styles.cell, { width: COL_WIDTHS.bagType }]}>
        <Text style={styles.cellCenter}>{bagType}</Text>
      </View>
      {GRADING_SIZES.map((size) => {
        const value = sizeBags?.[size];
        const weightKg = sizeWeightPerBag?.[size];
        const showQty = value != null && value > 0;
        return (
          <View
            key={size}
            style={[styles.cell, { width: COL_WIDTHS.sizeColumn }]}
          >
            <View style={[styles.cellRight, styles.sizeCellContent]}>
              {showQty && (
                <>
                  <Text style={styles.cellRight}>
                    {value.toLocaleString('en-IN')}
                  </Text>
                  {weightKg != null &&
                    !Number.isNaN(weightKg) &&
                    weightKg > 0 && (
                      <Text style={[styles.cellRight, styles.sizeCellSub]}>
                        ({weightKg})
                      </Text>
                    )}
                </>
              )}
            </View>
          </View>
        );
      })}
    </>
  );

  const wtReceivedAfterGrading = computeWtReceivedAfterGrading(row);
  const { totalJute, totalLeno } = getTotalJuteAndLenoBags(row);
  const lessBardanaJute = totalJute * JUTE_BAG_WEIGHT;
  const lessBardanaLeno = totalLeno * LENO_BAG_WEIGHT;

  if (hasPostGrading) {
    return (
      <View style={styles.dataRowWrapper}>
        <View style={styles.dataRowLeftBlock}>
          <View style={styles.dataRowLeftBlockRow}>{leftCells}</View>
        </View>
        <View style={styles.dataRowMiddleBlock}>
          <View style={styles.dataSubRow}>
            {typeAndSizeCells('JUTE', sizeBagsJute, row.sizeWeightPerBagJute)}
          </View>
          <View style={[styles.dataSubRow, styles.dataSubRowLast]}>
            {typeAndSizeCells('LENO', sizeBagsLeno, row.sizeWeightPerBagLeno)}
          </View>
        </View>
        <View style={styles.dataRowWtReceivedBlock}>
          <View
            style={[
              styles.cell,
              {
                width: COL_WIDTHS.wtReceivedAfterGrading,
                borderLeftWidth: 0,
                borderRightWidth: 0,
              },
            ]}
          >
            <Text style={styles.cellRight}>
              {wtReceivedAfterGrading > 0
                ? wtReceivedAfterGrading.toLocaleString('en-IN')
                : '—'}
            </Text>
          </View>
        </View>
        <View style={styles.dataRowLessBardanaBlock}>
          <View style={[styles.dataSubRow, { borderLeftWidth: 0 }]}>
            <View
              style={[
                styles.cell,
                styles.cellLast,
                {
                  width: COL_WIDTHS.lessBardanaAfterGrading,
                  borderLeftWidth: 0,
                  borderRightWidth: 0,
                },
              ]}
            >
              <Text style={styles.cellRight}>
                {lessBardanaJute > 0
                  ? lessBardanaJute.toLocaleString('en-IN')
                  : '—'}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.dataSubRow,
              styles.dataSubRowLast,
              { borderLeftWidth: 0 },
            ]}
          >
            <View
              style={[
                styles.cell,
                styles.cellLast,
                {
                  width: COL_WIDTHS.lessBardanaAfterGrading,
                  borderLeftWidth: 0,
                  borderRightWidth: 0,
                },
              ]}
            >
              <Text style={styles.cellRight}>
                {lessBardanaLeno > 0
                  ? lessBardanaLeno.toLocaleString('en-IN')
                  : '—'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.dataRow}>
      {leftCells}
      <View style={[styles.cell, { width: COL_WIDTHS.bagType }]}>
        <Text style={styles.cellCenter}>{row.bagType ?? '—'}</Text>
      </View>
      {GRADING_SIZES.map((size) => {
        const value = row.sizeBags?.[size];
        const weightKg = row.sizeWeightPerBag?.[size];
        const showQty = value != null && value > 0;
        return (
          <View
            key={size}
            style={[styles.cell, { width: COL_WIDTHS.sizeColumn }]}
          >
            <View style={[styles.cellRight, styles.sizeCellContent]}>
              {showQty && (
                <>
                  <Text style={styles.cellRight}>
                    {value.toLocaleString('en-IN')}
                  </Text>
                  {weightKg != null &&
                    !Number.isNaN(weightKg) &&
                    weightKg > 0 && (
                      <Text style={[styles.cellRight, styles.sizeCellSub]}>
                        ({weightKg})
                      </Text>
                    )}
                </>
              )}
            </View>
          </View>
        );
      })}
      <View style={[styles.cell, { width: COL_WIDTHS.wtReceivedAfterGrading }]}>
        <Text style={styles.cellRight}>
          {wtReceivedAfterGrading > 0
            ? wtReceivedAfterGrading.toLocaleString('en-IN')
            : '—'}
        </Text>
      </View>
      <View
        style={[
          styles.cell,
          styles.cellLast,
          { width: COL_WIDTHS.lessBardanaAfterGrading },
        ]}
      >
        <Text style={styles.cellRight}>
          {lessBardanaJute + lessBardanaLeno > 0
            ? (lessBardanaJute + lessBardanaLeno).toLocaleString('en-IN')
            : '—'}
        </Text>
      </View>
    </View>
  );
}

/** Sort rows by Gate Pass No. ascending (numeric when possible). */
function sortRowsByGatePassNo(rows: StockLedgerRow[]): StockLedgerRow[] {
  return [...rows].sort((a, b) => {
    const aNum = Number(a.incomingGatePassNo);
    const bNum = Number(b.incomingGatePassNo);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
    return String(a.incomingGatePassNo).localeCompare(
      String(b.incomingGatePassNo)
    );
  });
}

export function StockLedgerPdf({ farmerName, rows }: StockLedgerPdfProps) {
  const sortedRows = sortRowsByGatePassNo(rows);
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>{farmerName}</Text>
        </View>
        <TableHeader />
        {sortedRows.map((row, index) => (
          <DataRow key={`${row.incomingGatePassNo}-${index}`} row={row} />
        ))}
        <TotalRow rows={sortedRows} />
      </Page>
    </Document>
  );
}
