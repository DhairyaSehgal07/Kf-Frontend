import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import type { PassVoucherData } from '@/components/daybook/vouchers/types';
import type { GradingOrderDetailRow } from '@/components/daybook/vouchers/types';
import type { GradingOrderTotals } from '@/components/daybook/vouchers/grading-voucher-calculations';
import { useStore } from '@/stores/store';

/** Data passed from GradingVoucher for PDF rendering */
export interface GradingVoucherPdfProps {
  voucher: PassVoucherData;
  farmerName?: string;
  farmerAccount?: number;
  orderDetails: GradingOrderDetailRow[];
  totals: GradingOrderTotals;
  totalGradedWeightPercent?: number;
  wastageKg?: number;
  wastagePercentOfNetProduct?: number;
  hasDiscrepancy?: boolean;
  discrepancyValue?: number;
  percentSum?: number;
}

const MUTED = '#6f6f6f';
const BORDER = '#e5e7eb';
const HEADER_BG = '#f9fafb';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    paddingBottom: 56,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  logo: {
    width: 50,
    height: 50,
  },
  letterhead: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  storageName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#333',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  storageAddress: {
    fontSize: 9,
    color: MUTED,
    marginTop: 4,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#18a44b',
  },
  gatePassNo: {
    fontSize: 12,
    fontWeight: 700,
    color: '#18a44b',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 600,
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    alignItems: 'center',
    minHeight: 28,
  },
  tableRowHeader: {
    backgroundColor: HEADER_BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableCell: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 9,
  },
  tableCellRight: {
    textAlign: 'right',
  },
  headerText: {
    fontSize: 8,
    fontWeight: 600,
    color: MUTED,
  },
  colSize: { width: '18%' },
  colBagType: { width: '18%' },
  colQty: { width: '14%' },
  colInitial: { width: '14%' },
  colWeightPct: { width: '18%' },
  colWtBag: { width: '18%' },
});

const COL_STYLES = [
  styles.colSize,
  styles.colBagType,
  styles.colQty,
  styles.colInitial,
  styles.colWeightPct,
  styles.colWtBag,
];

function TableHeaderRow() {
  return (
    <View style={[styles.tableRow, styles.tableRowHeader]}>
      {['Size', 'Bag Type', 'Qty', 'Initial', 'Weight %', 'Wt/Bag (kg)'].map(
        (cell, i) => (
          <View
            key={cell}
            style={[
              styles.tableCell,
              COL_STYLES[i],
              ...(i > 1 ? [styles.tableCellRight] : []),
            ]}
          >
            <Text style={styles.headerText}>{cell}</Text>
          </View>
        )
      )}
    </View>
  );
}

export function GradingVoucherPdf({ voucher }: GradingVoucherPdfProps) {
  const coldStorage = useStore((s) => s.coldStorage);
  const gatePassNo = voucher.gatePassNo ?? '—';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Image
              src={coldStorage?.imageUrl ?? '/coldop-logo.png'}
              style={styles.logo}
            />
          </View>
          {coldStorage && (
            <View style={styles.letterhead}>
              <Text style={styles.storageName}>{coldStorage.name}</Text>
              {coldStorage.address ? (
                <Text style={styles.storageAddress}>{coldStorage.address}</Text>
              ) : null}
            </View>
          )}
          <View>
            <Text style={styles.gatePassNo}>GGP #{gatePassNo}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.table}>
          <TableHeaderRow />
        </View>
      </Page>
    </Document>
  );
}
