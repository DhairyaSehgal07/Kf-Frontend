import type { AggregationFn, ColumnDef } from "@tanstack/react-table"

import type {
  StorageGatePass,
  StorageGatePassBagSize,
} from "@/features/storage/api/types"

const numberFormatter = new Intl.NumberFormat("en-IN")

export type StorageQuantityMode = "current" | "initial"

const formatDate = (date: string) => {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate)
}

const formatQuantity = (quantity: number) => numberFormatter.format(quantity)
const sortText = { sortingFn: "text" as const, sortUndefined: "last" as const }
const sortNumeric = {
  sortingFn: "reportNumeric" as const,
  sortUndefined: "last" as const,
}
const sortDate = {
  sortingFn: "reportDate" as const,
  sortUndefined: "last" as const,
}
const reportEmptyAggregation: AggregationFn<StorageGatePass> = () => null
const reportSumAggregation: AggregationFn<StorageGatePass> = (
  columnId,
  leafRows,
) =>
  leafRows.reduce((sum, row) => {
    const value = row.getValue(columnId)

    return (
      sum + (typeof value === "number" && Number.isFinite(value) ? value : 0)
    )
  }, 0)
const aggregateNone = { aggregationFn: reportEmptyAggregation }
const aggregateSum = { aggregationFn: reportSumAggregation }

const getBagQuantity = (
  bag: StorageGatePassBagSize,
  quantityMode: StorageQuantityMode,
) => (quantityMode === "current" ? bag.currentQuantity : bag.initialQuantity)

const getBagSizeQuantity = (
  row: StorageGatePass,
  size: string,
  quantityMode: StorageQuantityMode,
) =>
  row.bagSizes
    .filter((bag) => bag.size === size)
    .reduce((total, bag) => total + getBagQuantity(bag, quantityMode), 0)

const renderBagSizeValue = (
  bag: StorageGatePassBagSize,
  quantityMode: StorageQuantityMode,
) => {
  const location = [bag.chamber, bag.floor, bag.row].filter(Boolean).join("-")
  const quantity = getBagQuantity(bag, quantityMode)

  return (
    <div className="space-y-0.5 tabular-nums">
      <div className="font-semibold text-foreground">
        {formatQuantity(quantity)}
      </div>
      <div className="text-muted-foreground">{bag.bagType}</div>
      {location ? (
        <div className="text-muted-foreground">({location})</div>
      ) : null}
    </div>
  )
}

const baseColumns: ColumnDef<StorageGatePass>[] = [
  {
    id: "name",
    accessorFn: (row) => row.farmerStorageLinkId.farmerId.name,
    header: "Name",
    meta: { emphasize: true, filterLabel: "Farmer" },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: "address",
    accessorFn: (row) => row.farmerStorageLinkId.farmerId.address ?? "-",
    header: "Address",
    meta: { filterLabel: "Farmer address", wrap: true },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: "accountNumber",
    accessorFn: (row) => row.farmerStorageLinkId.accountNumber,
    header: "Account Number",
    meta: { filterLabel: "Account number", numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "gatePassNo",
    header: "Gate Pass No",
    meta: { filterLabel: "Gate pass number", numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "manualGatePassNumber",
    header: "Manual Gate Pass No",
    meta: { filterLabel: "Manual gate pass number", numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => {
      const value = getValue<number | undefined>()

      return value == null ? "-" : <span className="tabular-nums">{value}</span>
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    meta: {
      filterLabel: "Date",
      filterValueFormatter: (value) => formatDate(String(value ?? "")),
      mono: true,
    },
    ...sortDate,
    ...aggregateNone,
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: "variety",
    header: "Variety",
    meta: { filterLabel: "Variety" },
    ...sortText,
    ...aggregateNone,
  },
  {
    accessorKey: "storageCategory",
    header: "Storage Category",
    meta: { filterLabel: "Storage category" },
    ...sortText,
    ...aggregateNone,
  },
]

const trailingColumns: ColumnDef<StorageGatePass>[] = [
  {
    id: "createdBy",
    accessorFn: (row) => row.createdBy?.name ?? "-",
    header: "Created By",
    meta: { filterLabel: "Created by" },
    ...sortText,
    ...aggregateNone,
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    meta: { filterLabel: "Remarks", wrap: true },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || "-",
  },
]

export function getStorageReportColumns(
  rows: StorageGatePass[],
  quantityMode: StorageQuantityMode = "current",
): ColumnDef<StorageGatePass>[] {
  const sizes = Array.from(
    new Set(rows.flatMap((row) => row.bagSizes.map((bag) => bag.size))),
  )

  const sizeColumns: ColumnDef<StorageGatePass>[] = sizes.map((size) => ({
    id: `size-${size}`,
    accessorFn: (row) => getBagSizeQuantity(row, size, quantityMode),
    header: size,
    meta: {
      align: "right",
      filterLabel: size,
      groupStart: true,
      numeric: true,
    },
    ...sortNumeric,
    ...aggregateSum,
    cell: ({ cell, getValue, row }) => {
      if (cell.getIsAggregated()) {
        return (
          <span className="tabular-nums">
            {formatQuantity(getValue<number>() ?? 0)}
          </span>
        )
      }

      const bags = row.original.bagSizes.filter((bag) => bag.size === size)

      if (!bags.length) return "-"

      return (
        <div className="space-y-3">
          {bags.map((bag, index) => (
            <div
              key={`${bag.size}-${bag.bagType}-${bag.chamber}-${bag.floor}-${bag.row}-${index}`}
            >
              {renderBagSizeValue(bag, quantityMode)}
            </div>
          ))}
        </div>
      )
    },
  }))

  return [...baseColumns, ...sizeColumns, ...trailingColumns]
}

export const columns: ColumnDef<StorageGatePass>[] = getStorageReportColumns([])