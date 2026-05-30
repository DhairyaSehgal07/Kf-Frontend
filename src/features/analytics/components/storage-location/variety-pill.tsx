import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { getVarietyChartColor } from "../../lib/variety-colors"
import { formatBagCount, getVarietyQuantity } from "../../lib/storage-location-utils"
import type {
  StorageLocationQuantityMode,
  VarietyStock,
} from "../../types/storage-location-wise"

type VarietyPillProps = {
  variety: string
  quantity?: number
  mode?: StorageLocationQuantityMode
  stock?: VarietyStock
  className?: string
  showQuantity?: boolean
}

export function VarietyPill({
  variety,
  quantity,
  mode = "current",
  stock,
  className,
  showQuantity = true,
}: VarietyPillProps) {
  const color = getVarietyChartColor(variety)
  const displayQuantity =
    quantity ??
    (stock ? getVarietyQuantity(stock, mode) : undefined)

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-auto max-w-full gap-1.5 rounded-md border py-0.5 pr-2 pl-1.5 text-xs font-medium",
        className,
      )}
      title={variety}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="truncate">{variety}</span>
      {showQuantity && displayQuantity != null ? (
        <span className="tabular-nums text-muted-foreground">
          {formatBagCount(displayQuantity)}
        </span>
      ) : null}
    </Badge>
  )
}
