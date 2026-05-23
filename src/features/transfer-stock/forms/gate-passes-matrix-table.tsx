import { Fragment, useCallback, useMemo, useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ClipboardList } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GatePassCell } from "@/features/transfer-stock/forms/gate-pass-cell"
import {
  TransferAllocationDialog,
  type AllocationDialogTarget,
} from "@/features/transfer-stock/forms/transfer-allocation-dialog"
import type {
  DatePassGroup,
  StorageGatePass,
} from "@/features/transfer-stock/types/storage-gate-pass"
import {
  allocationKey,
  getBagSlotsForSize,
  type BagSlotDetail,
} from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { cn } from "@/lib/utils"

type GatePassesMatrixTableProps = {
  displayGroups: DatePassGroup[]
  visibleSizes: string[]
  selectedPassIds: Set<string>
  onPassToggle: (passId: string) => void
  allocations: Record<string, number>
  onAllocationChange: (key: string, quantity: number) => void
  onAllocationClear: (key: string) => void
  isLoading?: boolean
  hasFilteredData?: boolean
  hasActiveFilters?: boolean
}

export function GatePassesMatrixTable({
  displayGroups,
  visibleSizes,
  selectedPassIds,
  onPassToggle,
  allocations,
  onAllocationChange,
  onAllocationClear,
  isLoading = false,
  hasFilteredData = true,
  hasActiveFilters = false,
}: GatePassesMatrixTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTarget, setDialogTarget] = useState<AllocationDialogTarget | null>(
    null
  )

  const flatPasses = useMemo(
    () => displayGroups.flatMap((g) => g.passes),
    [displayGroups]
  )

  const handleSlotClick = useCallback(
    (pass: StorageGatePass, sizeName: string, slot: BagSlotDetail) => {
      const key = allocationKey(pass._id, sizeName, slot.bagIndex)
      setDialogTarget({
        pass,
        sizeName,
        slot,
        allocationKey: key,
        currentQuantity: slot.currentQuantity,
      })
      setDialogOpen(true)
    },
    []
  )

  const columns = useMemo<ColumnDef<StorageGatePass>[]>(() => {
    const sizeColumns: ColumnDef<StorageGatePass>[] = visibleSizes.map(
      (sizeName) => ({
        id: `size-${sizeName}`,
        header: () => (
          <span className="whitespace-nowrap text-xs font-medium">{sizeName}</span>
        ),
        cell: ({ row }) => {
          const pass = row.original
          const slots = getBagSlotsForSize(pass, sizeName)
          return (
            <GatePassCell
              pass={pass}
              sizeName={sizeName}
              slots={slots}
              allocations={allocations}
              onSlotClick={handleSlotClick}
            />
          )
        },
        size: 140,
      })
    )

    return [
      {
        id: "select",
        size: 48,
        header: () => (
          <span className="sr-only">Select voucher</span>
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedPassIds.has(row.original._id)}
            onCheckedChange={() => onPassToggle(row.original._id)}
            aria-label={`Select gate pass ${row.original.gatePassNo}`}
          />
        ),
        enableSorting: false,
      },
      {
        id: "voucher",
        header: () => (
          <span className="text-xs font-medium text-muted-foreground">
            R. Voucher
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium tabular-nums text-foreground">
            #{row.original.gatePassNo}
          </span>
        ),
        size: 96,
      },
      ...sizeColumns,
    ]
  }, [
    visibleSizes,
    allocations,
    selectedPassIds,
    onPassToggle,
    handleSlotClick,
  ])

  const table = useReactTable({
    data: flatPasses,
    columns,
    getRowId: (row) => row._id,
    getCoreRowModel: getCoreRowModel(),
  })

  const passIdToRow = useMemo(() => {
    const map = new Map<string, ReturnType<typeof table.getRowModel>["rows"][number]>()
    for (const row of table.getRowModel().rows) {
      map.set(row.original._id, row)
    }
    return map
  }, [table])

  const columnCount = columns.length
  const dialogInitialQty = dialogTarget
    ? allocations[dialogTarget.allocationKey] ?? 0
    : 0

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!hasFilteredData) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Empty className="border-0 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No matching gate passes"
                : "No gate passes to show"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Try different filters or clear the search."
                : "Choose a variety to display gate passes, or check back when stock is available."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <Table className="min-w-max">
          <TableHeader className="sticky top-0 z-10 bg-muted/50 [&_tr]:border-b [&_tr]:hover:bg-transparent">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-10 px-3 text-muted-foreground",
                      index === 0 && "sticky left-0 z-20 w-12 bg-muted/50 px-2",
                      index === 1 &&
                        "sticky left-12 z-20 min-w-[5.5rem] bg-muted/50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {displayGroups.map((group) => (
              <Fragment key={group.dateKey}>
                <TableRow
                  className="hover:bg-transparent"
                >
                  <TableCell
                    colSpan={columnCount}
                    className="bg-muted/30 px-3 py-2"
                  >
                    <span className="font-heading text-sm font-semibold text-primary">
                      {group.dateLabel}
                    </span>
                  </TableCell>
                </TableRow>
                {group.passes.map((pass) => {
                  const row = passIdToRow.get(pass._id)
                  if (!row) return null
                  return (
                    <TableRow
                      key={pass._id}
                      className="even:bg-muted/15"
                      data-selected={selectedPassIds.has(pass._id) || undefined}
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-3 py-2.5 align-top",
                            index === 0 &&
                              "sticky left-0 z-10 bg-background even:bg-muted/15",
                            index === 1 &&
                              "sticky left-12 z-10 min-w-[5.5rem] bg-background shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)] even:bg-muted/15"
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <TransferAllocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        target={dialogTarget}
        initialQuantity={dialogInitialQty}
        onApply={onAllocationChange}
        onClear={onAllocationClear}
      />
    </>
  )
}
