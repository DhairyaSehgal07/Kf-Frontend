import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import {
  formatBagCount,
  getLevelQuantity,
  getVarietyQuantity,
} from "../../lib/storage-location-utils"
import type {
  StorageLocationChamber,
  StorageLocationFloor,
  StorageLocationQuantityMode,
  StorageLocationRow,
} from "../../types/storage-location-wise"
import { VarietyPill } from "./variety-pill"

function StockProgress({
  value,
  max,
  className,
}: {
  value: number
  max: number
  className?: string
}) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${formatBagCount(value)} of ${formatBagCount(max)} bags`}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

function RowItem({
  row,
  floorQuantity,
  mode,
  varietyFilter,
}: {
  row: StorageLocationRow
  floorQuantity: number
  mode: StorageLocationQuantityMode
  varietyFilter: string
}) {
  const rowQuantity = getLevelQuantity(row, mode)
  const isEmpty = row.currentQuantity === 0
  const visibleVarieties = row.varieties.filter((variety) => {
    const quantity = getVarietyQuantity(variety, mode)
    if (quantity <= 0) return false
    if (varietyFilter === "all") return true
    return variety.variety === varietyFilter
  })

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-background px-3 py-3",
        isEmpty && "opacity-70",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm font-medium text-foreground",
              isEmpty && "line-through decoration-muted-foreground/60",
            )}
          >
            Row {row.row}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.varietyCount} variet{row.varietyCount === 1 ? "y" : "ies"}
          </p>
        </div>
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {formatBagCount(rowQuantity)}{" "}
          <span className="text-xs font-normal text-muted-foreground">bags</span>
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <StockProgress value={rowQuantity} max={floorQuantity} />
        <div className="flex flex-wrap gap-1.5">
          {visibleVarieties.map((variety) => (
            <VarietyPill
              key={`${row.row}-${variety.variety}`}
              variety={variety.variety}
              stock={variety}
              mode={mode}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FloorAccordion({
  floor,
  chamberId,
  mode,
  varietyFilter,
}: {
  floor: StorageLocationFloor
  chamberId: string
  mode: StorageLocationQuantityMode
  varietyFilter: string
}) {
  const floorQuantity = getLevelQuantity(floor, mode)
  const visibleVarieties = floor.varieties.filter((variety) => {
    const quantity = getVarietyQuantity(variety, mode)
    if (quantity <= 0) return false
    if (varietyFilter === "all") return true
    return variety.variety === varietyFilter
  })

  return (
    <AccordionItem value={`${chamberId}-${floor.floor}`}>
      <AccordionTrigger className="px-3 py-3 hover:no-underline">
        <div className="flex min-w-0 flex-1 flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between sm:pr-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Floor {floor.floor}
            </p>
            <p className="text-xs text-muted-foreground">
              {floor.rows.length} row{floor.rows.length === 1 ? "" : "s"} ·{" "}
              {floor.varietyCount} variet{floor.varietyCount === 1 ? "y" : "ies"}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {formatBagCount(floorQuantity)} bags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visibleVarieties.slice(0, 4).map((variety) => (
                <VarietyPill
                  key={`${floor.floor}-${variety.variety}`}
                  variety={variety.variety}
                  stock={variety}
                  mode={mode}
                />
              ))}
              {visibleVarieties.length > 4 ? (
                <span className="text-xs text-muted-foreground">
                  +{visibleVarieties.length - 4} more
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="flex flex-col gap-2">
          {floor.rows.map((row) => (
            <RowItem
              key={`${floor.floor}-${row.row}`}
              row={row}
              floorQuantity={floorQuantity}
              mode={mode}
              varietyFilter={varietyFilter}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function StorageLocationChamberCard({
  chamber,
  mode,
  varietyFilter,
}: {
  chamber: StorageLocationChamber
  mode: StorageLocationQuantityMode
  varietyFilter: string
}) {
  const chamberQuantity = getLevelQuantity(chamber, mode)

  return (
    <Card className="min-w-0">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="font-heading text-base font-semibold">
          Chamber {chamber.chamber}
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="tabular-nums font-medium text-foreground">
            {formatBagCount(chamberQuantity)} bags
          </span>
          <span aria-hidden>·</span>
          <span>
            {chamber.floors.length} floor
            {chamber.floors.length === 1 ? "" : "s"}
          </span>
          <span aria-hidden>·</span>
          <span>
            {chamber.varietyCount} variet
            {chamber.varietyCount === 1 ? "y" : "ies"}
          </span>
        </CardDescription>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {chamber.varieties
            .filter((variety) => getVarietyQuantity(variety, mode) > 0)
            .map((variety) => (
              <VarietyPill
                key={`${chamber.chamber}-${variety.variety}`}
                variety={variety.variety}
                stock={variety}
                mode={mode}
              />
            ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Accordion type="multiple" className="rounded-none border-0">
          {chamber.floors.map((floor) => (
            <FloorAccordion
              key={`${chamber.chamber}-${floor.floor}`}
              floor={floor}
              chamberId={chamber.chamber}
              mode={mode}
              varietyFilter={varietyFilter}
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
