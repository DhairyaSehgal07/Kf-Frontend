import { useMemo, useState } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import { AlertCircle, MapPin, RefreshCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import type { StorageLocationWiseData } from "../../api/get-storage-location-wise"
import { collectVarieties } from "../../lib/variety-colors"
import {
  aggregateVarietySummary,
  computeDashboardTotals,
  filterStorageLocationData,
} from "../../lib/storage-location-utils"
import type { StorageLocationQuantityMode } from "../../types/storage-location-wise"
import { StorageLocationChamberCard } from "./chamber-card"
import { StorageLocationSummaryCards } from "./summary-cards"
import { StorageLocationVarietyLegend } from "./variety-legend"
import { StorageLocationVarietySummary } from "./variety-summary"

export function AnalyticsStorageLocationDashboard({
  query,
}: {
  query: UseQueryResult<StorageLocationWiseData, Error>
}) {
  const [quantityMode, setQuantityMode] =
    useState<StorageLocationQuantityMode>("current")
  const [searchQuery, setSearchQuery] = useState("")
  const [varietyFilter, setVarietyFilter] = useState("all")

  const { data, error, isError, isLoading, isFetching, refetch } = query

  const allVarieties = useMemo(
    () => collectVarieties(data?.chambers ?? []),
    [data?.chambers],
  )

  const filteredData = useMemo(
    () =>
      filterStorageLocationData(
        data ?? { chambers: [] },
        { searchQuery, varietyFilter },
        quantityMode,
      ),
    [data, quantityMode, searchQuery, varietyFilter],
  )

  const totals = useMemo(
    () => computeDashboardTotals(data?.chambers ?? [], quantityMode),
    [data?.chambers, quantityMode],
  )

  const varietyAggregates = useMemo(
    () => aggregateVarietySummary(filteredData.chambers, quantityMode),
    [filteredData.chambers, quantityMode],
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (isError && data === undefined) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            Storage location-wise data could not be loaded
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">{error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={cn("mr-2 size-4", isFetching && "animate-spin")}
              aria-hidden
            />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const hasData = (data?.chambers.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-4">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold sm:text-lg">
            <MapPin className="size-5 text-primary" aria-hidden />
            Cold storage inventory
          </CardTitle>
          <CardDescription>
            Stock across chambers, floors, and rows by potato variety
          </CardDescription>
        </CardHeader>
      </Card>

      {hasData ? (
        <>
          <StorageLocationSummaryCards
            totalStock={totals.totalStock}
            totalRemoved={totals.totalRemoved}
            varietyCount={totals.varietyCount}
            chamberTotals={totals.chamberTotals}
          />

          <StorageLocationVarietyLegend chambers={data?.chambers ?? []} />

          <Card className="min-w-0">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <div className="relative min-w-0">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search chamber or floor"
                      className="h-11 pl-9 text-base"
                      aria-label="Search chamber or floor"
                    />
                  </div>

                  <Select value={varietyFilter} onValueChange={setVarietyFilter}>
                    <SelectTrigger className="h-11 w-full text-base">
                      <SelectValue placeholder="Filter by variety" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All varieties</SelectItem>
                      {allVarieties.map((variety) => (
                        <SelectItem key={variety} value={variety}>
                          {variety}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Tabs
                  value={quantityMode}
                  onValueChange={(value) =>
                    setQuantityMode(value as StorageLocationQuantityMode)
                  }
                >
                  <TabsList aria-label="Quantity view">
                    <TabsTrigger value="current">Current</TabsTrigger>
                    <TabsTrigger value="initial">Initial</TabsTrigger>
                    <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Tabs defaultValue="locations" className="w-full">
                <TabsList className="mb-4 h-auto w-full flex-wrap justify-start">
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                  <TabsTrigger value="varieties">Variety summary</TabsTrigger>
                </TabsList>

                <TabsContent value="locations" className="mt-0 outline-none">
                  {filteredData.chambers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No locations match the current search or filter.
                    </p>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {filteredData.chambers.map((chamber) => (
                        <StorageLocationChamberCard
                          key={chamber.chamber}
                          chamber={chamber}
                          mode={quantityMode}
                          varietyFilter={varietyFilter}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="varieties" className="mt-0 outline-none">
                  <StorageLocationVarietySummary aggregates={varietyAggregates} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              No storage location data for the selected date range.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
