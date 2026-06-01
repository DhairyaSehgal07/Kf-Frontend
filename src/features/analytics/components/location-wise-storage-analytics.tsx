import { useMemo, type ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Layers,
  MapPin,
  Package,
  RefreshCw,
  Rows3,
  type LucideIcon,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { GetStorageGatePassReportResponse } from "@/features/storage-report/api/types"
import type { StorageGatePass } from "@/features/storage/api/types"
import { cn } from "@/lib/utils"

import {
  buildVarietyColorMap,
  collectVarietiesFromTree,
} from "../lib/location-variety-colors"
import { buildLocationWiseStorageTree } from "../lib/location-wise-storage-utils"
import type {
  LocationWiseChamberNode,
  LocationWiseFarmerEntry,
  LocationWiseFloorNode,
  LocationWiseRowNode,
  LocationWiseStorageTree,
  LocationWiseVarietyNode,
  LocationWiseVarietySummaryItem,
} from "../types/location-wise-storage"

import {
  LocationSectionStatsLine,
  LocationSectionTotal,
  LocationSectionTrigger,
} from "./location-variety-summary"

const bagFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
})

function formatBags(value: number) {
  return bagFormatter.format(value)
}

function formatQuantityPair(current: number, initial: number) {
  return `${formatBags(current)} / ${formatBags(initial)}`
}

type LocationLevel = "chamber" | "floor" | "row" | "variety"

const levelStyles: Record<
  LocationLevel,
  {
    list: string
    item: string
    trigger: string
    content: string
    iconWrap: string
    layout: "stacked" | "inline"
  }
> = {
  chamber: {
    list: "",
    item: "w-full",
    trigger:
      "rounded-none border-0 bg-muted/40 px-4 py-4 hover:bg-muted/60 data-[state=open]:bg-muted/50",
    content: "border-t border-border bg-background px-4 py-4",
    iconWrap: "bg-primary/10 text-primary",
    layout: "stacked",
  },
  floor: {
    list: "flex flex-col gap-2",
    item: "rounded-lg border border-border bg-muted/25",
    trigger: "px-3 py-3.5 hover:bg-muted/40 sm:px-4",
    content: "border-t border-border/80 bg-background px-3 pb-3 sm:px-4",
    iconWrap: "bg-background text-foreground ring-1 ring-border",
    layout: "inline",
  },
  row: {
    list: "flex flex-col gap-2",
    item: "rounded-md border border-border/70 bg-background",
    trigger: "px-3 py-3 hover:bg-muted/30",
    content: "border-t border-border/60 bg-muted/15 px-3 pb-3",
    iconWrap: "bg-muted text-foreground",
    layout: "stacked",
  },
  variety: {
    list: "flex flex-col gap-2",
    item: "rounded-md border border-border/60 bg-background shadow-sm",
    trigger: "px-3 py-3 hover:bg-muted/25",
    content: "border-t border-border bg-background p-3",
    iconWrap: "bg-primary/10 text-primary",
    layout: "stacked",
  },
}

function LocationCollapsibleSection({
  level,
  title,
  statsParts,
  varietySummary,
  varietyColorMap,
  current,
  icon,
  includeBagsInStatsLine = false,
  children,
}: {
  level: LocationLevel
  title: string
  statsParts: string[]
  varietySummary: LocationWiseVarietySummaryItem[]
  varietyColorMap: Map<string, string>
  current: number
  icon: LucideIcon
  includeBagsInStatsLine?: boolean
  children: ReactNode
}) {
  const styles = levelStyles[level]

  return (
    <Collapsible className={cn("group", styles.item)}>
      <CollapsibleTrigger
        className={cn(
          styles.trigger,
          "flex w-full cursor-pointer items-start gap-3 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30",
        )}
      >
        <LocationSectionTrigger
          icon={icon}
          iconWrapClassName={styles.iconWrap}
          title={title}
          statsLine={
            <LocationSectionStatsLine
              bagCount={current}
              parts={statsParts}
              includeBags={includeBagsInStatsLine}
            />
          }
          varietySummary={varietySummary}
          varietyColorMap={varietyColorMap}
          layout={styles.layout}
        />
        <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
          <LocationSectionTotal current={current} />
          <ChevronDown
            className="size-4 text-muted-foreground group-data-[state=open]:hidden"
            aria-hidden
          />
          <ChevronUp
            className="hidden size-4 text-muted-foreground group-data-[state=open]:block"
            aria-hidden
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className={cn(styles.content, "overflow-visible")}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function FarmerEntriesTable({ entries }: { entries: LocationWiseFarmerEntry[] }) {
  return (
    <div className="relative w-full overflow-x-auto rounded-md border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted hover:bg-muted">
            <TableHead className="h-11 px-3 text-sm font-medium text-foreground">
              Farmer
            </TableHead>
            <TableHead className="h-11 px-3 text-right text-sm font-medium text-foreground">
              Account no.
            </TableHead>
            <TableHead className="h-11 px-3 text-sm font-medium text-foreground">
              Bag size &amp; type
            </TableHead>
            <TableHead className="h-11 px-3 text-right text-sm font-medium text-foreground">
              Current / initial
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow
              key={`${entry.gatePassId}-${entry.bagSize}-${entry.bagType}-${index}`}
              className="even:bg-muted/20"
            >
              <TableCell className="px-3 py-3">
                <span
                  className="block max-w-56 truncate text-sm font-medium text-foreground sm:max-w-xs"
                  title={entry.farmerName}
                >
                  {entry.farmerName}
                </span>
                <span className="text-xs text-muted-foreground">
                  Gate pass #{entry.gatePassNo}
                </span>
              </TableCell>
              <TableCell className="px-3 py-3 text-right text-sm tabular-nums text-foreground">
                {entry.farmerAccountNumber}
              </TableCell>
              <TableCell className="px-3 py-3 text-sm text-foreground">
                <span className="font-medium">{entry.bagSize}</span>
                <span className="text-muted-foreground"> · {entry.bagType}</span>
              </TableCell>
              <TableCell className="px-3 py-3 text-right text-sm font-medium tabular-nums text-foreground">
                {formatQuantityPair(entry.currentQuantity, entry.initialQuantity)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function VarietyList({
  varieties,
  varietyColorMap,
}: {
  varieties: LocationWiseVarietyNode[]
  varietyColorMap: Map<string, string>
}) {
  if (varieties.length === 0) return null

  return (
    <div className={levelStyles.variety.list}>
      {varieties.map((varietyNode) => (
        <LocationCollapsibleSection
          key={varietyNode.variety}
          level="variety"
          icon={Package}
          title={varietyNode.variety}
          statsParts={[
            `${varietyNode.entries.length} gate pass line${varietyNode.entries.length === 1 ? "" : "s"}`,
          ]}
          includeBagsInStatsLine
          varietySummary={[
            {
              variety: varietyNode.variety,
              currentQuantity: varietyNode.totalCurrentQuantity,
              initialQuantity: varietyNode.totalInitialQuantity,
            },
          ]}
          varietyColorMap={varietyColorMap}
          current={varietyNode.totalCurrentQuantity}
        >
          <FarmerEntriesTable entries={varietyNode.entries} />
        </LocationCollapsibleSection>
      ))}
    </div>
  )
}

function RowList({
  rows,
  varietyColorMap,
}: {
  rows: LocationWiseRowNode[]
  varietyColorMap: Map<string, string>
}) {
  if (rows.length === 0) return null

  return (
    <div className={levelStyles.row.list}>
      {rows.map((rowNode) => (
        <LocationCollapsibleSection
          key={rowNode.row}
          level="row"
          icon={Rows3}
          title={`Row ${rowNode.row}`}
          statsParts={[
            `${rowNode.varietyCount} variet${rowNode.varietyCount === 1 ? "y" : "ies"}`,
          ]}
          varietySummary={rowNode.varietySummary}
          varietyColorMap={varietyColorMap}
          current={rowNode.totalCurrentQuantity}
        >
          <VarietyList
            varieties={rowNode.varieties}
            varietyColorMap={varietyColorMap}
          />
        </LocationCollapsibleSection>
      ))}
    </div>
  )
}

function FloorList({
  floors,
  varietyColorMap,
}: {
  floors: LocationWiseFloorNode[]
  varietyColorMap: Map<string, string>
}) {
  if (floors.length === 0) return null

  return (
    <div className={levelStyles.floor.list}>
      {floors.map((floorNode) => (
        <LocationCollapsibleSection
          key={floorNode.floor}
          level="floor"
          icon={Layers}
          title={`Floor ${floorNode.floor}`}
          statsParts={[
            `${floorNode.rows.length} row${floorNode.rows.length === 1 ? "" : "s"}`,
            `${floorNode.varietyCount} variet${floorNode.varietyCount === 1 ? "y" : "ies"}`,
          ]}
          varietySummary={floorNode.varietySummary}
          varietyColorMap={varietyColorMap}
          current={floorNode.totalCurrentQuantity}
        >
          <RowList rows={floorNode.rows} varietyColorMap={varietyColorMap} />
        </LocationCollapsibleSection>
      ))}
    </div>
  )
}

function ChamberSection({
  chamberNode,
  varietyColorMap,
}: {
  chamberNode: LocationWiseChamberNode
  varietyColorMap: Map<string, string>
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <LocationCollapsibleSection
        level="chamber"
        icon={MapPin}
        title={`Chamber ${chamberNode.chamber}`}
        statsParts={[
          `${chamberNode.floors.length} floor${chamberNode.floors.length === 1 ? "" : "s"}`,
          `${chamberNode.varietyCount} variet${chamberNode.varietyCount === 1 ? "y" : "ies"}`,
        ]}
        varietySummary={chamberNode.varietySummary}
        varietyColorMap={varietyColorMap}
        current={chamberNode.totalCurrentQuantity}
        includeBagsInStatsLine
      >
        <FloorList floors={chamberNode.floors} varietyColorMap={varietyColorMap} />
      </LocationCollapsibleSection>
    </section>
  )
}

function ChamberList({
  chambers,
  varietyColorMap,
}: {
  chambers: LocationWiseChamberNode[]
  varietyColorMap: Map<string, string>
}) {
  if (chambers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
        <MapPin className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">No location data</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Gate passes in this date range do not have chamber, floor, or row
          assignments yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {chambers.map((chamberNode) => (
        <ChamberSection
          key={`chamber-${chamberNode.chamber}`}
          chamberNode={chamberNode}
          varietyColorMap={varietyColorMap}
        />
      ))}
    </div>
  )
}

function LocationWiseStorageSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </CardContent>
    </Card>
  )
}

function LocationWiseStorageError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string
  onRetry: () => void
  isRetrying: boolean
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          Could not load location-wise storage
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">{message}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full sm:w-auto"
        >
          <RefreshCw
            className={cn("mr-2 size-4", isRetrying && "animate-spin")}
            aria-hidden
          />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

export function LocationWiseStorageAnalytics({
  tree,
}: {
  tree: LocationWiseStorageTree
}) {
  const varietyColorMap = useMemo(() => {
    const varieties = collectVarietiesFromTree(tree)
    return buildVarietyColorMap(varieties)
  }, [tree])

  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="font-heading text-base font-semibold sm:text-lg">
          Location-wise storage
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Expand a chamber to drill down by floor, row, and variety. Each level
          shows a variety-wise bag summary.
        </CardDescription>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary" className="h-7 gap-1.5 px-2.5 text-sm font-normal">
            <MapPin className="size-3.5" aria-hidden />
            <span className="tabular-nums font-medium">{tree.chambers.length}</span>
            chambers
          </Badge>
          <Badge className="h-7 gap-1.5 px-2.5 text-sm font-normal">
            <ChevronRight className="size-3.5" aria-hidden />
            <span className="tabular-nums font-semibold">
              {formatBags(tree.totalCurrentQuantity)}
            </span>
            bags in storage
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ChamberList chambers={tree.chambers} varietyColorMap={varietyColorMap} />
      </CardContent>
    </Card>
  )
}

export function LocationWiseStorageAnalyticsFromPasses({
  storageGatePasses,
}: {
  storageGatePasses: StorageGatePass[]
}) {
  const tree = useMemo(
    () => buildLocationWiseStorageTree(storageGatePasses),
    [storageGatePasses],
  )

  return <LocationWiseStorageAnalytics tree={tree} />
}

export function LocationWiseStorageAnalyticsCard({
  query,
}: {
  query: UseQueryResult<GetStorageGatePassReportResponse, Error>
}) {
  const { data, error, isError, isLoading, isFetching, refetch } = query

  if (isLoading) {
    return <LocationWiseStorageSkeleton />
  }

  if (isError && data === undefined) {
    return (
      <LocationWiseStorageError
        message={
          error instanceof Error
            ? error.message
            : "Failed to load storage gate pass report"
        }
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  const passes = data?.data.storageGatePasses ?? []

  return <LocationWiseStorageAnalyticsFromPasses storageGatePasses={passes} />
}
