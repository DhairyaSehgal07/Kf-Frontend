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
  farmerSection: {
    marginTop: 14,
  },
  farmerSectionFirst: {
    marginTop: 0,
  },
  farmerHeader: {
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#000',
    padding: 6,
    marginBottom: 6,
  },
  farmerHeaderTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  farmerHeaderRow: {
    fontSize: 8,
    marginBottom: 2,
  },
  varietyHeader: {
    backgroundColor: '#D0E8D0',
    borderWidth: 1,
    borderColor: '#000',
    padding: 6,
    marginBottom: 6,
  },
  varietyHeaderTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  genericHeader: {
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#000',
    padding: 6,
    marginBottom: 6,
  },
  genericHeaderTitle: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryPage: {
    backgroundColor: '#FEFDF8',
    padding: 16,
    paddingBottom: 80,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },
  summarySection: {
    marginTop: 14,
  },
  summarySectionFirst: {
    marginTop: 0,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 3,
  },
  summaryTable: {
    borderWidth: 1,
    borderColor: '#000',
    width: '100%',
    marginBottom: 4,
  },
  summaryTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 3,
  },
  summaryTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
    paddingVertical: 2,
  },
  summaryTableRowTotal: {
    flexDirection: 'row',
    backgroundColor: '#D0D0D0',
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingVertical: 3,
  },
  summaryCell: {
    paddingHorizontal: 3,
    fontSize: 7,
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
  },
  summaryCellLeft: {
    paddingHorizontal: 3,
    fontSize: 7,
    textAlign: 'left',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
  },
  summaryCellLast: {
    borderRightWidth: 0,
  },
});

const BAG_SIZE_COLUMN_PREFIX = 'bagSize:' as const;

const ALL_BASE_COLUMNS: {
  key: keyof StorageReportRow;
  id: string;
  label: string;
  width: string;
  align: 'left' | 'center';
}[] = [
  {
    key: 'farmerName',
    id: 'farmerName',
    label: 'Farmer',
    width: '12%',
    align: 'left',
  },
  {
    key: 'accountNumber',
    id: 'accountNumber',
    label: 'Account No.',
    width: '8%',
    align: 'center',
  },
  {
    key: 'gatePassNo',
    id: 'gatePassNo',
    label: 'Gate pass no.',
    width: '8%',
    align: 'center',
  },
  {
    key: 'manualGatePassNumber',
    id: 'manualGatePassNumber',
    label: 'Manual GP no.',
    width: '8%',
    align: 'center',
  },
  { key: 'date', id: 'date', label: 'Date', width: '11%', align: 'center' },
  {
    key: 'variety',
    id: 'variety',
    label: 'Variety',
    width: '10%',
    align: 'left',
  },
  {
    key: 'storageCategory',
    id: 'storageCategory',
    label: 'Category',
    width: '12%',
    align: 'left',
  },
  {
    key: 'totalBags',
    id: 'totalBags',
    label: 'Bags',
    width: '8%',
    align: 'center',
  },
  {
    key: 'remarks',
    id: 'remarks',
    label: 'Remarks',
    width: '34%',
    align: 'left',
  },
];

type PdfColumn = {
  id: string;
  label: string;
  width: string;
  align: 'left' | 'center';
  baseKey?: keyof StorageReportRow;
  bagSize?: string;
};

function getColumnsForPdf(visibleColumnIds: string[]): PdfColumn[] {
  const baseById = new Map(ALL_BASE_COLUMNS.map((c) => [c.id, c] as const));

  const combined: PdfColumn[] = [];
  for (const id of visibleColumnIds) {
    const base = baseById.get(id);
    if (base) {
      combined.push({
        id,
        baseKey: base.key,
        label: base.label,
        width: base.width,
        align: base.align,
      });
      continue;
    }

    if (id.startsWith(BAG_SIZE_COLUMN_PREFIX)) {
      const size = id.slice(BAG_SIZE_COLUMN_PREFIX.length);
      combined.push({
        id,
        label: size,
        width: '7%',
        align: 'center',
        bagSize: size,
      });
    }
  }

  if (combined.length === 0) {
    return ALL_BASE_COLUMNS.map((c) => ({
      id: c.id,
      baseKey: c.key,
      label: c.label,
      width: c.width,
      align: c.align,
    }));
  }

  const totalPercent = combined.reduce(
    (sum, c) => sum + parseFloat(c.width),
    0
  );
  const scale = 100 / totalPercent;

  return combined.map((c) => ({
    ...c,
    width: `${(parseFloat(c.width) * scale).toFixed(1)}%`,
  }));
}

function getColumnsForPdfExcluding(
  visibleColumnIds: string[],
  excludeColumnIds: string[]
): PdfColumn[] {
  const exclude = new Set(excludeColumnIds);
  const filtered = visibleColumnIds.filter((id) => !exclude.has(id));
  return getColumnsForPdf(filtered);
}

function formatCell(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'number' && Number.isNaN(value)) return '—';
  return String(value);
}

function getPdfValue(row: StorageReportRow, col: PdfColumn): unknown {
  if (col.baseKey) {
    return (row as unknown as Record<string, unknown>)[col.baseKey];
  }
  if (col.bagSize) return row.bagSizesQuantities?.[col.bagSize];
  return '—';
}

function getPdfCellText(row: StorageReportRow, col: PdfColumn): string {
  if (col.bagSize) {
    const qty = row.bagSizesQuantities?.[col.bagSize];
    if (qty == null) return '';
    const location = row.bagSizesLocations?.[col.bagSize];
    return location ? `${qty}\n${location}` : String(qty);
  }
  return formatCell(getPdfValue(row, col));
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
  columns: PdfColumn[];
}

function TableRow({ row, columns }: TableRowProps) {
  return (
    <View style={styles.tableRow}>
      {columns.map((col, i) => (
        <View
          key={col.id}
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
            {getPdfCellText(row, col)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TotalsRow({
  totalBags,
  bagSizeTotals,
  columns,
}: {
  totalBags: number;
  bagSizeTotals: Record<string, number>;
  columns: PdfColumn[];
}) {
  return (
    <View style={styles.tableRowTotal}>
      {columns.map((col, i) => {
        if (col.baseKey === 'totalBags')
          return (
            <Text key={col.id} style={[styles.cell, { width: col.width }]}>
              {totalBags}
            </Text>
          );
        if (col.bagSize) {
          return (
            <Text key={col.id} style={[styles.cell, { width: col.width }]}>
              {bagSizeTotals[col.bagSize] ?? 0}
            </Text>
          );
        }
        return (
          <Text
            key={col.id}
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

/** Section = one block header (or nested headers) + table rows */
interface PdfSection {
  headers: Array<{
    depth: number;
    groupingColumnId: string;
    displayValue: string;
    firstLeaf?: StorageReportRow;
  }>;
  leaves: StorageReportRow[];
}

function buildSectionsFromSnapshot(
  snapshot: StorageReportPdfSnapshot<StorageReportRow>
): PdfSection[] {
  const { rows, grouping } = snapshot;
  const deepestDepth = grouping.length > 0 ? grouping.length - 1 : -1;
  const sections: PdfSection[] = [];
  let current: PdfSection = { headers: [], leaves: [] };

  for (const item of rows) {
    if (item.type === 'group') {
      if (item.depth === deepestDepth) {
        if (current.leaves.length > 0) {
          sections.push(current);
          current = {
            headers: [...current.headers],
            leaves: [],
          };
        }
        current.headers[item.depth] = {
          depth: item.depth,
          groupingColumnId: item.groupingColumnId,
          displayValue: item.displayValue,
          firstLeaf: item.firstLeaf,
        };
      } else {
        current.headers[item.depth] = {
          depth: item.depth,
          groupingColumnId: item.groupingColumnId,
          displayValue: item.displayValue,
          firstLeaf: item.firstLeaf,
        };
      }
    } else {
      current.leaves.push(item.row);
    }
  }
  if (current.leaves.length > 0 || current.headers.length > 0) {
    sections.push(current);
  }
  return sections;
}

function FarmerBlockHeader({ firstLeaf }: { firstLeaf?: StorageReportRow }) {
  if (!firstLeaf) {
    return (
      <View style={styles.farmerHeader}>
        <Text style={styles.farmerHeaderTitle}>—</Text>
      </View>
    );
  }
  return (
    <View style={styles.farmerHeader}>
      <Text style={styles.farmerHeaderTitle}>
        {formatCell(firstLeaf.farmerName)}
      </Text>
      <Text style={styles.farmerHeaderRow}>
        Account No: {formatCell(firstLeaf.accountNumber)}
      </Text>
    </View>
  );
}

function VarietyBlockHeader({ variety }: { variety: string }) {
  return (
    <View style={styles.varietyHeader}>
      <Text style={styles.varietyHeaderTitle}>Variety: {variety}</Text>
    </View>
  );
}

function GenericBlockHeader({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.genericHeader}>
      <Text style={styles.genericHeaderTitle}>
        {label}: {value}
      </Text>
    </View>
  );
}

const GROUP_LABELS: Record<string, string> = {
  farmerName: 'Farmer',
  accountNumber: 'Account No.',
  date: 'Date',
  variety: 'Variety',
  storageCategory: 'Category',
  remarks: 'Remarks',
};

interface NamedSummaryRow {
  name: string;
  quantity: number;
  passes: number;
}

interface VarietyBagSizeSummaryRow {
  variety: string;
  bagSize: string;
  quantity: number;
}

interface StorageReportTableSummary {
  byFarmer: NamedSummaryRow[];
  byCategory: NamedSummaryRow[];
  byVariety: NamedSummaryRow[];
  byVarietyAndBagSize: VarietyBagSizeSummaryRow[];
  totalQuantity: number;
  totalPasses: number;
}

function toNum(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function sumBagQuantity(row: StorageReportRow): number {
  return Object.values(row.bagSizesQuantities ?? {}).reduce(
    (sum, qty) => sum + toNum(qty),
    0
  );
}

function computeStorageReportSummary(
  rows: StorageReportRow[]
): StorageReportTableSummary {
  const farmerMap = new Map<string, NamedSummaryRow>();
  const categoryMap = new Map<string, NamedSummaryRow>();
  const varietyMap = new Map<string, NamedSummaryRow>();
  const varietyBagMap = new Map<string, VarietyBagSizeSummaryRow>();

  let totalQuantity = 0;
  let totalPasses = 0;

  for (const row of rows) {
    const farmerName = (row.farmerName ?? '').trim() || '—';
    const category = (row.storageCategory ?? '').trim() || '—';
    const variety = (row.variety ?? '').trim() || '—';
    const rowQuantity = sumBagQuantity(row);

    totalQuantity += rowQuantity;
    totalPasses += 1;

    const upsertNamed = (map: Map<string, NamedSummaryRow>, name: string) => {
      const existing = map.get(name);
      if (existing) {
        existing.quantity += rowQuantity;
        existing.passes += 1;
      } else {
        map.set(name, { name, quantity: rowQuantity, passes: 1 });
      }
    };

    upsertNamed(farmerMap, farmerName);
    upsertNamed(categoryMap, category);
    upsertNamed(varietyMap, variety);

    for (const [bagSize, qtyRaw] of Object.entries(
      row.bagSizesQuantities ?? {}
    )) {
      const qty = toNum(qtyRaw);
      if (qty === 0) continue;
      const key = `${variety}||${bagSize}`;
      const existing = varietyBagMap.get(key);
      if (existing) {
        existing.quantity += qty;
      } else {
        varietyBagMap.set(key, { variety, bagSize, quantity: qty });
      }
    }
  }

  const byNameSorter = (a: NamedSummaryRow, b: NamedSummaryRow) =>
    a.name.localeCompare(b.name);
  const byVarietyAndBagSizeSorter = (
    a: VarietyBagSizeSummaryRow,
    b: VarietyBagSizeSummaryRow
  ) => {
    const v = a.variety.localeCompare(b.variety);
    if (v !== 0) return v;
    return a.bagSize.localeCompare(b.bagSize);
  };

  return {
    byFarmer: Array.from(farmerMap.values()).sort(byNameSorter),
    byCategory: Array.from(categoryMap.values()).sort(byNameSorter),
    byVariety: Array.from(varietyMap.values()).sort(byNameSorter),
    byVarietyAndBagSize: Array.from(varietyBagMap.values()).sort(
      byVarietyAndBagSizeSorter
    ),
    totalQuantity,
    totalPasses,
  };
}

const SUMMARY_COLUMNS_NAMED = [
  { key: 'name', label: 'Name', width: '55%' },
  { key: 'passes', label: 'Passes', width: '20%' },
  { key: 'quantity', label: 'Bags', width: '25%' },
] as const;

function SummaryNamedTable({
  title,
  labelForName,
  rows,
  overallPasses,
  overallQuantity,
}: {
  title: string;
  labelForName: string;
  rows: NamedSummaryRow[];
  overallPasses: number;
  overallQuantity: number;
}) {
  return (
    <View style={styles.summarySection}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <View style={styles.summaryTable}>
        <View style={styles.summaryTableHeader}>
          {SUMMARY_COLUMNS_NAMED.map((col, i) => (
            <Text
              key={col.key}
              style={[
                col.key === 'name'
                  ? styles.summaryCellLeft
                  : styles.summaryCell,
                i === SUMMARY_COLUMNS_NAMED.length - 1
                  ? styles.summaryCellLast
                  : {},
                { width: col.width },
              ]}
            >
              {col.key === 'name' ? labelForName : col.label}
            </Text>
          ))}
        </View>
        {rows.length === 0 ? (
          <View style={styles.summaryTableRow}>
            <Text
              style={[
                styles.summaryCellLeft,
                styles.summaryCellLast,
                { width: '100%', paddingVertical: 4 },
              ]}
            >
              No data
            </Text>
          </View>
        ) : (
          <>
            {rows.map((row) => (
              <View key={row.name} style={styles.summaryTableRow}>
                <Text
                  style={[
                    styles.summaryCellLeft,
                    { width: SUMMARY_COLUMNS_NAMED[0].width },
                  ]}
                >
                  {row.name}
                </Text>
                <Text
                  style={[
                    styles.summaryCell,
                    { width: SUMMARY_COLUMNS_NAMED[1].width },
                  ]}
                >
                  {row.passes}
                </Text>
                <Text
                  style={[
                    styles.summaryCell,
                    styles.summaryCellLast,
                    { width: SUMMARY_COLUMNS_NAMED[2].width },
                  ]}
                >
                  {row.quantity}
                </Text>
              </View>
            ))}
            <View style={styles.summaryTableRowTotal}>
              <Text
                style={[
                  styles.summaryCellLeft,
                  { width: SUMMARY_COLUMNS_NAMED[0].width },
                ]}
              >
                Total
              </Text>
              <Text
                style={[
                  styles.summaryCell,
                  { width: SUMMARY_COLUMNS_NAMED[1].width },
                ]}
              >
                {overallPasses}
              </Text>
              <Text
                style={[
                  styles.summaryCell,
                  styles.summaryCellLast,
                  { width: SUMMARY_COLUMNS_NAMED[2].width },
                ]}
              >
                {overallQuantity}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function SummaryVarietyBagTable({
  rows,
  overallQuantity,
}: {
  rows: VarietyBagSizeSummaryRow[];
  overallQuantity: number;
}) {
  const bagSizes = Array.from(new Set(rows.map((r) => r.bagSize))).sort(
    (a, b) => a.localeCompare(b)
  );
  const varieties = Array.from(new Set(rows.map((r) => r.variety))).sort(
    (a, b) => a.localeCompare(b)
  );

  const qtyByVariety = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const byBag = qtyByVariety.get(row.variety) ?? new Map<string, number>();
    byBag.set(row.bagSize, (byBag.get(row.bagSize) ?? 0) + row.quantity);
    qtyByVariety.set(row.variety, byBag);
  }

  const colWidths = {
    variety: 32,
    total: 13,
    bag: bagSizes.length > 0 ? (100 - 32 - 13) / bagSizes.length : 55,
  };

  const columnTotals: Record<string, number> = {};
  for (const size of bagSizes) columnTotals[size] = 0;
  for (const variety of varieties) {
    const byBag = qtyByVariety.get(variety);
    for (const size of bagSizes) {
      const qty = byBag?.get(size) ?? 0;
      columnTotals[size] += qty;
    }
  }

  const fmtInt = (n: number) => n.toLocaleString();

  return (
    <View style={styles.summarySection}>
      <Text style={styles.summaryTitle}>Variety + bag size wise summary</Text>
      <View style={styles.summaryTable}>
        <View style={styles.summaryTableHeader}>
          <Text
            style={[styles.summaryCellLeft, { width: `${colWidths.variety}%` }]}
          >
            Varieties
          </Text>
          {bagSizes.map((bagSize) => (
            <Text
              key={bagSize}
              style={[styles.summaryCell, { width: `${colWidths.bag}%` }]}
            >
              {bagSize}
            </Text>
          ))}
          <Text
            style={[
              styles.summaryCell,
              styles.summaryCellLast,
              { width: `${colWidths.total}%` },
            ]}
          >
            Total
          </Text>
        </View>
        {varieties.length === 0 ? (
          <View style={styles.summaryTableRow}>
            <Text
              style={[
                styles.summaryCellLeft,
                styles.summaryCellLast,
                { width: '100%', paddingVertical: 4 },
              ]}
            >
              No data
            </Text>
          </View>
        ) : (
          <>
            {varieties.map((variety) => {
              const byBag = qtyByVariety.get(variety);
              const rowTotal = bagSizes.reduce(
                (sum, size) => sum + (byBag?.get(size) ?? 0),
                0
              );
              return (
                <View key={variety} style={styles.summaryTableRow}>
                  <Text
                    style={[
                      styles.summaryCellLeft,
                      { width: `${colWidths.variety}%` },
                    ]}
                  >
                    {variety}
                  </Text>
                  {bagSizes.map((size) => {
                    const qty = byBag?.get(size) ?? 0;
                    return (
                      <Text
                        key={`${variety}-${size}`}
                        style={[
                          styles.summaryCell,
                          { width: `${colWidths.bag}%` },
                        ]}
                      >
                        {fmtInt(qty)}
                      </Text>
                    );
                  })}
                  <Text
                    style={[
                      styles.summaryCell,
                      styles.summaryCellLast,
                      { width: `${colWidths.total}%` },
                    ]}
                  >
                    {fmtInt(rowTotal)}
                  </Text>
                </View>
              );
            })}
            <View style={styles.summaryTableRowTotal}>
              <Text
                style={[
                  styles.summaryCellLeft,
                  { width: `${colWidths.variety}%` },
                ]}
              >
                Bag Total
              </Text>
              {bagSizes.map((size) => (
                <Text
                  key={`bag-total-${size}`}
                  style={[styles.summaryCell, { width: `${colWidths.bag}%` }]}
                >
                  {fmtInt(columnTotals[size] ?? 0)}
                </Text>
              ))}
              <Text
                style={[
                  styles.summaryCell,
                  styles.summaryCellLast,
                  { width: `${colWidths.total}%` },
                ]}
              >
                {fmtInt(overallQuantity)}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function ReportSummaryPage({
  companyName,
  dateRangeLabel,
  reportTitle,
  summary,
}: {
  companyName: string;
  dateRangeLabel: string;
  reportTitle: string;
  summary: StorageReportTableSummary;
}) {
  return (
    <Page size="A4" style={styles.summaryPage}>
      <ReportHeader
        companyName={companyName}
        dateRangeLabel={dateRangeLabel}
        reportTitle={`${reportTitle} — Summary`}
      />
      <View style={[styles.summarySection, styles.summarySectionFirst]}>
        <Text style={styles.summaryTitle}>Overall summary</Text>
        <View style={styles.summaryTable}>
          <View style={styles.summaryTableRowTotal}>
            <Text
              style={[
                styles.summaryCellLeft,
                { width: SUMMARY_COLUMNS_NAMED[0].width },
              ]}
            >
              Total
            </Text>
            <Text
              style={[
                styles.summaryCell,
                { width: SUMMARY_COLUMNS_NAMED[1].width },
              ]}
            >
              {summary.totalPasses}
            </Text>
            <Text
              style={[
                styles.summaryCell,
                styles.summaryCellLast,
                { width: SUMMARY_COLUMNS_NAMED[2].width },
              ]}
            >
              {summary.totalQuantity}
            </Text>
          </View>
        </View>
      </View>

      <SummaryNamedTable
        title="Farmer wise summary"
        labelForName="Farmer"
        rows={summary.byFarmer}
        overallPasses={summary.totalPasses}
        overallQuantity={summary.totalQuantity}
      />

      <SummaryNamedTable
        title="Category wise summary"
        labelForName="Category"
        rows={summary.byCategory}
        overallPasses={summary.totalPasses}
        overallQuantity={summary.totalQuantity}
      />

      <SummaryNamedTable
        title="Variety wise summary"
        labelForName="Variety"
        rows={summary.byVariety}
        overallPasses={summary.totalPasses}
        overallQuantity={summary.totalQuantity}
      />

      <SummaryVarietyBagTable
        rows={summary.byVarietyAndBagSize}
        overallQuantity={summary.totalQuantity}
      />
    </Page>
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
  const summary = computeStorageReportSummary(rows);

  const bagSizesOrdered: string[] = [];
  const bagSizeSeen = new Set<string>();
  for (const r of rows) {
    for (const size of Object.keys(r.bagSizesQuantities ?? {})) {
      if (bagSizeSeen.has(size)) continue;
      bagSizeSeen.add(size);
      bagSizesOrdered.push(size);
    }
  }

  const bagSizeTotals: Record<string, number> = {};
  for (const r of rows) {
    for (const [size, qty] of Object.entries(r.bagSizesQuantities ?? {})) {
      bagSizeTotals[size] = (bagSizeTotals[size] ?? 0) + qty;
    }
  }

  const useSnapshot =
    tableSnapshot &&
    tableSnapshot.rows.length > 0 &&
    (tableSnapshot.grouping.length > 0 ||
      tableSnapshot.visibleColumnIds.length > 0);

  const visibleColumnIds =
    useSnapshot && tableSnapshot!.visibleColumnIds.length > 0
      ? tableSnapshot!.visibleColumnIds
      : (() => {
          const baseIds = ALL_BASE_COLUMNS.map((c) => c.id);
          const totalIdx = baseIds.indexOf('totalBags');
          const bagIds = bagSizesOrdered.map((s) => `bagSize:${s}`);
          if (totalIdx < 0) return [...baseIds, ...bagIds];
          return [
            ...baseIds.slice(0, totalIdx + 1),
            ...bagIds,
            ...baseIds.slice(totalIdx + 1),
          ];
        })();

  const columnsForPdf = getColumnsForPdf(visibleColumnIds);

  const grouping = useSnapshot ? tableSnapshot!.grouping : [];

  if (useSnapshot && grouping.length > 0) {
    const sections = buildSectionsFromSnapshot(tableSnapshot!);
    const columnsForGroupedTable = getColumnsForPdfExcluding(
      visibleColumnIds,
      grouping
    );

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <ReportHeader
            companyName={companyName}
            dateRangeLabel={dateRangeLabel}
            reportTitle={reportTitle}
          />
          {sections.map((section, sectionIndex) => {
            const isFirstSection = sectionIndex === 0;
            return (
              <View
                key={sectionIndex}
                style={[
                  styles.farmerSection,
                  isFirstSection ? styles.farmerSectionFirst : {},
                ]}
              >
                {grouping.map((_, depth) => {
                  const h = section.headers[depth];
                  if (!h) return null;
                  if (h.groupingColumnId === 'farmerName')
                    return (
                      <FarmerBlockHeader
                        key={depth}
                        firstLeaf={section.leaves[0] ?? h.firstLeaf}
                      />
                    );
                  if (h.groupingColumnId === 'variety')
                    return (
                      <VarietyBlockHeader
                        key={depth}
                        variety={h.displayValue}
                      />
                    );
                  return (
                    <GenericBlockHeader
                      key={depth}
                      label={
                        GROUP_LABELS[h.groupingColumnId] ?? h.groupingColumnId
                      }
                      value={h.displayValue}
                    />
                  );
                })}
                <View style={styles.tableContainer}>
                  <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                      {columnsForGroupedTable.map((col, i) => (
                        <Text
                          key={col.id}
                          style={[
                            col.align === 'left'
                              ? styles.cellLeft
                              : styles.cell,
                            i === columnsForGroupedTable.length - 1
                              ? styles.cellLast
                              : {},
                            { width: col.width },
                          ]}
                        >
                          {col.label}
                        </Text>
                      ))}
                    </View>
                    {section.leaves.length === 0 ? (
                      <View style={styles.tableRow}>
                        <Text
                          style={[
                            styles.cellLeft,
                            styles.cellLast,
                            { width: '100%', paddingVertical: 8 },
                          ]}
                        >
                          No rows in this group.
                        </Text>
                      </View>
                    ) : (
                      <>
                        {section.leaves.map((row) => (
                          <TableRow
                            key={row.id}
                            row={row}
                            columns={columnsForGroupedTable}
                          />
                        ))}
                        <TotalsRow
                          totalBags={section.leaves.reduce(
                            (sum, r) => sum + (r.totalBags ?? 0),
                            0
                          )}
                          bagSizeTotals={section.leaves.reduce(
                            (acc, r) => {
                              for (const [size, qty] of Object.entries(
                                r.bagSizesQuantities ?? {}
                              )) {
                                acc[size] = (acc[size] ?? 0) + qty;
                              }
                              return acc;
                            },
                            {} as Record<string, number>
                          )}
                          columns={columnsForGroupedTable}
                        />
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
          <View style={styles.tableContainer}>
            <View style={styles.table}>
              <TotalsRow
                totalBags={totalBags}
                bagSizeTotals={bagSizeTotals}
                columns={getColumnsForPdf(visibleColumnIds)}
              />
            </View>
          </View>
        </Page>
        <ReportSummaryPage
          companyName={companyName}
          dateRangeLabel={dateRangeLabel}
          reportTitle={reportTitle}
          summary={summary}
        />
      </Document>
    );
  }

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
                  key={col.id}
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
                <TotalsRow
                  totalBags={totalBags}
                  bagSizeTotals={bagSizeTotals}
                  columns={columnsForPdf}
                />
              </>
            )}
          </View>
        </View>
      </Page>
      <ReportSummaryPage
        companyName={companyName}
        dateRangeLabel={dateRangeLabel}
        reportTitle={reportTitle}
        summary={summary}
      />
    </Document>
  );
}

export default StorageReportTablePdf;
