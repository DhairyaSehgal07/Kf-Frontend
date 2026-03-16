import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { StorageReportRow } from '@/components/analytics/reports/storage-report/columns';
import type { StorageReportPdfSnapshot } from '@/components/analytics/reports/storage-report/data-table';

export interface StorageReportTablePdfProps {
  companyName?: string;
  dateRangeLabel: string;
  reportTitle?: string;
  rows: StorageReportRow[];
  /** When provided, honours table grouping, column visibility, and sorting from the report UI. */
  tableSnapshot?: StorageReportPdfSnapshot<StorageReportRow> | null;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FEFDF8',
    padding: 16,
    paddingBottom: 80,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dateRange: {
    fontSize: 9,
    marginBottom: 6,
  },
  tableContainer: {
    marginTop: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
    paddingVertical: 2,
  },
  tableRowTotal: {
    flexDirection: 'row',
    backgroundColor: '#D0D0D0',
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingVertical: 3,
  },
  cell: {
    paddingHorizontal: 0,
    fontSize: 6,
    textAlign: 'center',
  },
  cellLeft: {
    paddingHorizontal: 0,
    fontSize: 6,
    textAlign: 'left',
  },
  cellLast: {
    borderRightWidth: 0,
  },
  cellWrap: {
    paddingHorizontal: 2,
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 6,
    width: '100%',
    maxWidth: '100%',
  },
});

const ALL_COLUMNS: {
  key: keyof StorageReportRow;
  label: string;
  width: string;
  align: 'left' | 'center';
}[] = [
  { key: 'farmerName', label: 'Farmer', width: '12%', align: 'left' },
  { key: 'accountNumber', label: 'Account No.', width: '8%', align: 'center' },
  { key: 'gatePassNo', label: 'Gate pass no.', width: '8%', align: 'center' },
  {
    key: 'manualGatePassNumber',
    label: 'Manual GP no.',
    width: '8%',
    align: 'center',
  },
  { key: 'date', label: 'Date', width: '8%', align: 'center' },
  { key: 'variety', label: 'Variety', width: '10%', align: 'left' },
  { key: 'storageCategory', label: 'Category', width: '10%', align: 'left' },
  { key: 'totalBags', label: 'Bags', width: '8%', align: 'center' },
  { key: 'remarks', label: 'Remarks', width: '38%', align: 'left' },
];

function getColumnsForPdf(visibleColumnIds: string[]): {
  key: keyof StorageReportRow;
  label: string;
  width: string;
  align: 'left' | 'center';
}[] {
  const visible = new Set(
    visibleColumnIds.length > 0
      ? visibleColumnIds
      : ALL_COLUMNS.map((c) => c.key)
  );
  const filtered = ALL_COLUMNS.filter((c) => visible.has(c.key));
  if (filtered.length === 0) return ALL_COLUMNS;
  const totalPercent = filtered.reduce(
    (sum, c) => sum + parseFloat(c.width),
    0
  );
  const scale = 100 / totalPercent;
  return filtered.map((c) => ({
    ...c,
    width: `${(parseFloat(c.width) * scale).toFixed(1)}%`,
  }));
}

function formatCell(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'number' && Number.isNaN(value)) return '—';
  return String(value);
}

function ReportHeader({
  companyName,
  dateRangeLabel,
  reportTitle,
}: {
  companyName: string;
  dateRangeLabel: string;
  reportTitle: string;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.companyName}>{companyName}</Text>
      <Text style={styles.reportTitle}>{reportTitle}</Text>
      <Text style={styles.dateRange}>{dateRangeLabel}</Text>
    </View>
  );
}

interface TableRowProps {
  row: StorageReportRow;
  columns: {
    key: keyof StorageReportRow;
    label: string;
    width: string;
    align: 'left' | 'center';
  }[];
}

function TableRow({ row, columns }: TableRowProps) {
  return (
    <View style={styles.tableRow}>
      {columns.map((col, i) => (
        <View
          key={col.key}
          style={[
            styles.cellWrap,
            i === columns.length - 1 ? styles.cellLast : {},
            { width: col.width, minWidth: 0 },
          ]}
        >
          <Text
            style={[
              col.align === 'left' ? styles.cellLeft : styles.cell,
              styles.cellText,
            ]}
            wrap
          >
            {formatCell(row[col.key])}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TotalsRow({
  totalBags,
  columns,
}: {
  totalBags: number;
  columns: {
    key: keyof StorageReportRow;
    label: string;
    width: string;
    align: 'left' | 'center';
  }[];
}) {
  return (
    <View style={styles.tableRowTotal}>
      {columns.map((col, i) => {
        if (col.key === 'totalBags')
          return (
            <Text key={col.key} style={[styles.cell, { width: col.width }]}>
              {totalBags}
            </Text>
          );
        return (
          <Text
            key={col.key}
            style={[
              col.align === 'left' ? styles.cellLeft : styles.cell,
              i === columns.length - 1 ? styles.cellLast : {},
              { width: col.width },
            ]}
          >
            {i === 0 ? 'Total' : ''}
          </Text>
        );
      })}
    </View>
  );
}

export function StorageReportTablePdf({
  companyName = 'Cold Storage',
  dateRangeLabel,
  reportTitle = 'Storage Report',
  rows,
  tableSnapshot,
}: StorageReportTablePdfProps) {
  const totalBags = rows.reduce((sum, r) => sum + (r.totalBags ?? 0), 0);

  const useSnapshot =
    tableSnapshot &&
    tableSnapshot.rows.length > 0 &&
    tableSnapshot.visibleColumnIds.length > 0;

  const visibleColumnIds =
    useSnapshot && tableSnapshot!.visibleColumnIds.length > 0
      ? tableSnapshot!.visibleColumnIds
      : ALL_COLUMNS.map((c) => c.key);

  const columnsForPdf = getColumnsForPdf(visibleColumnIds);

  const leafRows =
    useSnapshot && tableSnapshot!.rows.length > 0
      ? tableSnapshot!.rows
          .filter(
            (r): r is { type: 'leaf'; row: StorageReportRow } =>
              r.type === 'leaf'
          )
          .map((r) => r.row)
      : rows;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader
          companyName={companyName}
          dateRangeLabel={dateRangeLabel}
          reportTitle={reportTitle}
        />
        <View style={styles.tableContainer}>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              {columnsForPdf.map((col, i) => (
                <Text
                  key={col.key}
                  style={[
                    col.align === 'left' ? styles.cellLeft : styles.cell,
                    i === columnsForPdf.length - 1 ? styles.cellLast : {},
                    { width: col.width },
                  ]}
                >
                  {col.label}
                </Text>
              ))}
            </View>
            {leafRows.length === 0 ? (
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.cellLeft,
                    styles.cellLast,
                    { width: '100%', paddingVertical: 8 },
                  ]}
                >
                  No storage report data for this period.
                </Text>
              </View>
            ) : (
              <>
                {leafRows.map((row) => (
                  <TableRow key={row.id} row={row} columns={columnsForPdf} />
                ))}
                <TotalsRow totalBags={totalBags} columns={columnsForPdf} />
              </>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default StorageReportTablePdf;
