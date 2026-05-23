import { MapPin } from "lucide-react"
import type { StorageGatePass } from "@/features/transfer-stock/types/storage-gate-pass"
import {
  allocationKey,
  type BagSlotDetail,
  formatLocationShort,
} from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { cn } from "@/lib/utils"

type GatePassCellProps = {
  pass: StorageGatePass
  sizeName: string
  slots: BagSlotDetail[]
  allocations: Record<string, number>
  onSlotClick: (
    pass: StorageGatePass,
    sizeName: string,
    slot: BagSlotDetail
  ) => void
}

function EmptySeat() {
  return (
    <div
      className="flex h-11 min-w-[7.5rem] items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/20"
      aria-hidden
    />
  )
}

function SlotCard({
  pass,
  sizeName,
  slot,
  selectedQty,
  onClick,
}: {
  pass: StorageGatePass
  sizeName: string
  slot: BagSlotDetail
  selectedQty: number
  onClick: () => void
}) {
  const isSelected = selectedQty > 0
  const available = slot.currentQuantity

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-11 min-w-[7.5rem] flex-col gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border bg-card hover:bg-muted/50"
      )}
      aria-label={`${pass.variety}, ${sizeName}, ${formatLocationShort(slot)}, ${isSelected ? `${selectedQty} of ${available} selected` : `${available} available`}`}
    >
      <span className="truncate text-xs font-medium text-foreground">
        {pass.variety}
      </span>
      <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
        <MapPin className="size-3 shrink-0" aria-hidden />
        <span className="truncate">{formatLocationShort(slot)}</span>
      </span>
      <span className="text-right text-sm font-medium tabular-nums text-foreground">
        {isSelected ? (
          <>
            <span className="text-primary">{selectedQty.toLocaleString("en-IN")}</span>
            <span className="text-muted-foreground">
              {" "}
              / {available.toLocaleString("en-IN")}
            </span>
          </>
        ) : (
          available.toLocaleString("en-IN")
        )}
      </span>
    </button>
  )
}

export function GatePassCell({
  pass,
  sizeName,
  slots,
  allocations,
  onSlotClick,
}: GatePassCellProps) {
  if (slots.length === 0) {
    return <EmptySeat />
  }

  return (
    <div className="flex min-w-[7.5rem] flex-col gap-1.5">
      {slots.map((slot) => {
        const key = allocationKey(pass._id, sizeName, slot.bagIndex)
        const selectedQty = allocations[key] ?? 0
        return (
          <SlotCard
            key={key}
            pass={pass}
            sizeName={sizeName}
            slot={slot}
            selectedQty={selectedQty}
            onClick={() => onSlotClick(pass, sizeName, slot)}
          />
        )
      })}
    </div>
  )
}
