import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import {
  dailyMonthlyTrendQueryKey,
  getDailyMonthlyTrend,
} from "../api/get-daily-monthly-trend"
import {
  getVarietyDistribution,
  varietyDistributionQueryKey,
} from "../api/get-variety-distribution"
import type { AnalyticsDateParams } from "../types"

import { AnalyticsJsonSection } from "./analytics-json-section"

type AnalyticsIncomingTabProps = AnalyticsDateParams

const AnalyticsIncomingTab = ({ dateFrom, dateTo }: AnalyticsIncomingTabProps) => {
  const params = useMemo(
    () => ({ dateFrom, dateTo }),
    [dateFrom, dateTo],
  )

  const varietyDistributionQuery = useQuery({
    queryKey: varietyDistributionQueryKey(params),
    queryFn: () => getVarietyDistribution(params),
  })

  const dailyMonthlyTrendQuery = useQuery({
    queryKey: dailyMonthlyTrendQueryKey(params),
    queryFn: () => getDailyMonthlyTrend(params),
  })

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsJsonSection
        title="Variety distribution"
        description="Incoming analytics by variety for the applied date range"
        errorTitle="Variety distribution could not be loaded"
        query={varietyDistributionQuery}
      />

      <AnalyticsJsonSection
        title="Daily / monthly trend"
        description="Incoming daily and monthly trend for the applied date range"
        errorTitle="Daily / monthly trend could not be loaded"
        query={dailyMonthlyTrendQuery}
      />
    </div>
  )
}

export default AnalyticsIncomingTab
