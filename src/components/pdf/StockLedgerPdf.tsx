import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useStore } from '@/stores/store';
import { GRADING_SIZES } from '@/components/forms/grading/constants';
import type { StockLedgerPdfProps } from './stockLedgerPdfTypes';
import { SIZE_HEADER_LABELS } from './stockLedgerPdfUtils';

const HEADER_BG = '#f9fafb';
const BORDER = '#e5e7eb';

/** Column widths: minimal to fit content, center-aligned. */
const COL_WIDTHS = {
  gpNo: 22,
  manualIncomingVoucherNo: 22,
  gradingGatePassNo: 22,
  manualGradingGatePassNo: 22,
  date: 30,
  store: 38,
  variety: 32,
  truckNumber: 48,
  bagsReceived: 26,
  weightSlipNo: 26,
  grossWeight: 28,
  tareWeight: 28,
  netWeight: 28,
  lessBardana: 26,
  actualWeight: 28,
  postGradingBags: 24,
  bagType: 22,
  sizeColumn: 18,
  wtReceivedAfterGrading: 34,
  lessBardanaAfterGrading: 28,
  actualWtOfPotato: 34,
  weightShortage: 32,
  weightShortagePercent: 28,
  amountPayable: 32,
} as const;

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
  coldStorageName: {
    fontSize: 5,
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: HEADER_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderBottomWidth: 0,
    flexShrink: 0,
  },
  headerCell: {
    paddingVertical: 1,
    paddingHorizontal: 1,
    fontWeight: 700,
    fontSize: 3.5,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    borderRightWidth: 1,
    borderColor: BORDER,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCellLast: {
    borderRightWidth: 0,
  },
  cellCenter: {
    textAlign: 'center',
  },
});

function TableHeader() {
  return (
    <View style={styles.headerRow}>
      <View style={[styles.headerCell, { width: COL_WIDTHS.gpNo }]}>
        <Text style={styles.cellCenter}>Gp No</Text>
      </View>
      <View
        style={[
          styles.headerCell,
          { width: COL_WIDTHS.manualIncomingVoucherNo },
        ]}
      >
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>Manual No</Text>
      </View>
      <View
        style={[styles.headerCell, { width: COL_WIDTHS.gradingGatePassNo }]}
      >
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>GGP No</Text>
      </View>
      <View
        style={[
          styles.headerCell,
          { width: COL_WIDTHS.manualGradingGatePassNo },
        ]}
      >
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>Manual GGP</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.date }]}>
        <Text style={styles.cellCenter}>Date</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.store }]}>
        <Text style={styles.cellCenter}>Store</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.variety }]}>
        <Text style={styles.cellCenter}>Variety</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.truckNumber }]}>
        <Text style={styles.cellCenter}>Truck</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.bagsReceived }]}>
        <Text style={styles.cellCenter}>Bags Rec.</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.weightSlipNo }]}>
        <Text style={styles.cellCenter}>Slip No.</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.grossWeight }]}>
        <Text style={styles.cellCenter}>Gross</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.tareWeight }]}>
        <Text style={styles.cellCenter}>Tare</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.netWeight }]}>
        <Text style={styles.cellCenter}>Net</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.lessBardana }]}>
        <Text style={styles.cellCenter}>Less Bard.</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.actualWeight }]}>
        <Text style={styles.cellCenter}>Actual</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.postGradingBags }]}>
        <Text style={styles.cellCenter}>Post Gr.</Text>
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
          { width: COL_WIDTHS.lessBardanaAfterGrading },
        ]}
      >
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>Less Bard.</Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.actualWtOfPotato }]}>
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>
          Actual wt of Potato
        </Text>
      </View>
      <View style={[styles.headerCell, { width: COL_WIDTHS.weightShortage }]}>
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>
          Weight Shortage
        </Text>
      </View>
      <View
        style={[styles.headerCell, { width: COL_WIDTHS.weightShortagePercent }]}
      >
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>Shortage %</Text>
      </View>
      <View
        style={[
          styles.headerCell,
          styles.headerCellLast,
          { width: COL_WIDTHS.amountPayable },
        ]}
      >
        <Text style={[styles.cellCenter, { fontSize: 3 }]}>Amount Payable</Text>
      </View>
    </View>
  );
}

export function StockLedgerPdf({ farmerName }: StockLedgerPdfProps) {
  const coldStorageName = useStore((s) => s.coldStorage?.name ?? '');
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.titleRow}>
          <View style={{ alignItems: 'center' }}>
            {coldStorageName ? (
              <Text style={styles.coldStorageName}>{coldStorageName}</Text>
            ) : null}
            <Text style={styles.titleText}>{farmerName}</Text>
          </View>
        </View>
        <TableHeader />
      </Page>
    </Document>
  );
}
