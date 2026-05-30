import { Boxes, Layers, Package, Sprout } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { formatBagCount } from "../../lib/storage-location-utils"

type SummaryCardsProps = {
  totalStock: number
  totalRemoved: number
  varietyCount: number
  chamberTotals: Array<{ chamber: string; quantity: number }>
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string
  value: string
  description: string
  icon: typeof Package
}) {
  return (
    <Card size="sm" className="gap-0">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="size-4 text-primary" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export function StorageLocationSummaryCards({
  totalStock,
  totalRemoved,
  varietyCount,
  chamberTotals,
}: SummaryCardsProps) {
  const chamberSummary = chamberTotals
    .map(({ chamber, quantity }) => `Ch ${chamber}: ${formatBagCount(quantity)}`)
    .join(" · ")

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Total stock"
        value={formatBagCount(totalStock)}
        description="Bags currently in storage across all chambers"
        icon={Package}
      />
      <MetricCard
        label="Varieties"
        value={String(varietyCount)}
        description="Distinct potato varieties in inventory"
        icon={Sprout}
      />
      <MetricCard
        label="Total removed"
        value={formatBagCount(totalRemoved)}
        description="Bags dispatched or removed from storage"
        icon={Boxes}
      />
      <Card size="sm" className="gap-0 sm:col-span-2 xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Per chamber</CardDescription>
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Layers className="size-4 text-primary" aria-hidden />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {chamberTotals.map(({ chamber, quantity }) => (
              <div
                key={chamber}
                className={cn(
                  "rounded-lg border border-border bg-muted/30 px-2.5 py-1.5",
                )}
              >
                <p className="text-xs text-muted-foreground">Ch {chamber}</p>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatBagCount(quantity)}
                </p>
              </div>
            ))}
          </div>
          {chamberSummary ? (
            <p className="text-xs leading-relaxed text-muted-foreground xl:hidden">
              {chamberSummary}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
