import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import {
  getStorageLocationWise,
  storageLocationWiseQueryKey,
} from "../api/get-storage-location-wise"
import {
  getStorageSummary,
  storageSummaryQueryKey,
} from "../api/get-storage-summary"
import type { AnalyticsDateParams } from "../types"

import { AnalyticsStorageSummaryTable } from "./analytics-storage-summary-table"
import { AnalyticsStorageLocationDashboard } from "./storage-location/analytics-storage-location-dashboard"

type AnalyticsStorageTabProps = AnalyticsDateParams

const AnalyticsStorageTab = ({
  dateFrom,
  dateTo,
}: AnalyticsStorageTabProps) => {
  const params = useMemo(
    () => ({ dateFrom, dateTo }),
    [dateFrom, dateTo],
  )

  const storageSummaryQuery = useQuery({
    queryKey: storageSummaryQueryKey(params),
    queryFn: () => getStorageSummary(params),
  })

  const storageLocationWiseQuery = useQuery({
    queryKey: storageLocationWiseQueryKey(params),
    queryFn: () => getStorageLocationWise(params),
  })

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsStorageSummaryTable query={storageSummaryQuery} />
      <AnalyticsStorageLocationDashboard query={storageLocationWiseQuery} />
    </div>
  )
}

export default AnalyticsStorageTab
