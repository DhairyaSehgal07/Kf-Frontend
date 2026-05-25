import type { ColumnDef } from "@tanstack/react-table"

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

const renderBagSizeValue = (
  bag: StorageGatePassBagSize,
  quantityMode: StorageQuantityMode,
) => {
  const location = [bag.chamber, bag.floor, bag.row].filter(Boolean).join("-")
  const quantity =
    quantityMode === "current" ? bag.currentQuantity : bag.initialQuantity

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
    meta: { emphasize: true },
  },
  {
    id: "address",
    accessorFn: (row) => row.farmerStorageLinkId.farmerId.address ?? "-",
    header: "Address",
    meta: { wrap: true },
  },
  {
    id: "accountNumber",
    accessorFn: (row) => row.farmerStorageLinkId.accountNumber,
    header: "Account Number",
    meta: { numeric: true },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "gatePassNo",
    header: "Gate Pass No",
    meta: { numeric: true },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "manualGatePassNumber",
    header: "Manual Gate Pass No",
    meta: { numeric: true },
    cell: ({ getValue }) => {
      const value = getValue<number | undefined>()

      return value == null ? "-" : <span className="tabular-nums">{value}</span>
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    meta: { mono: true },
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: "variety",
    header: "Variety",
  },
  {
    accessorKey: "storageCategory",
    header: "Storage Category",
  },
]

const trailingColumns: ColumnDef<StorageGatePass>[] = [
  {
    id: "createdBy",
    accessorFn: (row) => row.createdBy?.name ?? "-",
    header: "Created By",
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    meta: { wrap: true },
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
    header: size,
    meta: { align: "right", groupStart: true, numeric: true },
    cell: ({ row }) => {
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