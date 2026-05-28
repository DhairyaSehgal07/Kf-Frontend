import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import {
  areaWiseSizeDistributionQueryKey,
  getAreaWiseSizeDistribution,
} from "../api/get-area-wise-size-distribution"
import {
  getSizeDistribution,
  sizeDistributionQueryKey,
} from "../api/get-size-distribution"
import type { AnalyticsDateParams } from "../types"

import { AnalyticsJsonSection } from "./analytics-json-section"

type AnalyticsGradingTabProps = AnalyticsDateParams

const AnalyticsGradingTab = ({ dateFrom, dateTo }: AnalyticsGradingTabProps) => {
  const params = useMemo(
    () => ({ dateFrom, dateTo }),
    [dateFrom, dateTo],
  )

  const sizeDistributionQuery = useQuery({
    queryKey: sizeDistributionQueryKey(params),
    queryFn: () => getSizeDistribution(params),
  })

  const areaWiseSizeDistributionQuery = useQuery({
    queryKey: areaWiseSizeDistributionQueryKey(params),
    queryFn: () => getAreaWiseSizeDistribution(params),
  })

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsJsonSection
        title="Size distribution"
        description="Grading analytics by size for the applied date range"
        errorTitle="Size distribution could not be loaded"
        query={sizeDistributionQuery}
      />

      <AnalyticsJsonSection
        title="Area-wise size distribution"
        description="Grading analytics by area and size for the applied date range"
        errorTitle="Area-wise size distribution could not be loaded"
        query={areaWiseSizeDistributionQuery}
      />
    </div>
  )
}

export default AnalyticsGradingTab
