import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  getStorageSummary,
  storageSummaryQueryKey,
  type StorageVarietySummary,
} from "../api/get-storage-summary"
import type { AnalyticsDateParams } from "../types"

import { AnalyticsJsonSection } from "./analytics-json-section"

type AnalyticsStorageTabProps = AnalyticsDateParams

type StorageQuantityMode = "current" | "initial"

const QUANTITY_MODE_COPY: Record<
  StorageQuantityMode,
  { title: string; description: string }
> = {
  current: {
    title: "Current quantity",
    description:
      "Bags currently in storage by variety, size, and bag type for the applied date range",
  },
  initial: {
    title: "Initial quantity",
    description:
      "Original stored quantities at intake by variety, size, and bag type for the applied date range",
  },
}

function mapStorageSummaryForMode(
  data: StorageVarietySummary[],
  mode: StorageQuantityMode,
) {
  const quantityKey =
    mode === "current" ? "currentQuantity" : "initialQuantity"

  return data.map((variety) => ({
    variety: variety.variety,
    quantity: variety[quantityKey],
    ...(mode === "current" ? { quantityRemoved: variety.quantityRemoved } : {}),
    sizes: variety.sizes.map((size) => ({
      size: size.size,
      quantity: size[quantityKey],
      ...(mode === "current" ? { quantityRemoved: size.quantityRemoved } : {}),
      byBagType: size.byBagType.map((bag) => ({
        bagType: bag.bagType,
        quantity: bag[quantityKey],
        ...(mode === "current" ? { quantityRemoved: bag.quantityRemoved } : {}),
      })),
    })),
  }))
}

const AnalyticsStorageTab = ({
  dateFrom,
  dateTo,
}: AnalyticsStorageTabProps) => {
  const [quantityMode, setQuantityMode] =
    useState<StorageQuantityMode>("current")

  const params = useMemo(
    () => ({ dateFrom, dateTo }),
    [dateFrom, dateTo],
  )

  const storageSummaryQuery = useQuery({
    queryKey: storageSummaryQueryKey(params),
    queryFn: () => getStorageSummary(params),
  })

  const displayData = useMemo(
    () =>
      storageSummaryQuery.data
        ? mapStorageSummaryForMode(storageSummaryQuery.data, quantityMode)
        : undefined,
    [storageSummaryQuery.data, quantityMode],
  )

  const { title, description } = QUANTITY_MODE_COPY[quantityMode]

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={quantityMode}
        onValueChange={(value) => setQuantityMode(value as StorageQuantityMode)}
      >
        <TabsList aria-label="Quantity view">
          <TabsTrigger value="current">Current Qty</TabsTrigger>
          <TabsTrigger value="initial">Initial Qty</TabsTrigger>
        </TabsList>
      </Tabs>

      <AnalyticsJsonSection
        title={title}
        description={description}
        errorTitle="Storage summary could not be loaded"
        query={storageSummaryQuery}
        data={displayData}
      />
    </div>
  )
}

export default AnalyticsStorageTab
