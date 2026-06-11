import { useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { bookingKeys } from "@/features/booking/api/query-keys"
import type { SummaryVariety } from "@/features/booking/api/summary-types"
import { useBookingStorageSummary } from "@/features/booking/api/use-booking-storage-summary"
import { useBookingSummary } from "@/features/booking/api/use-booking-summary"
import { buildNetAvailabilityMap } from "@/features/booking/lib/booking-availability"

export function useBookingAvailability() {
  const queryClient = useQueryClient()

  const cachedStorage = queryClient.getQueryData<SummaryVariety[]>(
    bookingKeys.storageSummary(),
  )
  const cachedBooked = queryClient.getQueryData<SummaryVariety[]>(
    bookingKeys.summary(),
  )

  const storageQuery = useBookingStorageSummary({
    initialData: cachedStorage,
  })
  const bookedQuery = useBookingSummary({
    initialData: cachedBooked,
  })

  const availabilityMap = useMemo(
    () =>
      buildNetAvailabilityMap(
        storageQuery.data ?? [],
        bookedQuery.data ?? [],
      ),
    [storageQuery.data, bookedQuery.data],
  )

  const isLoading =
    (storageQuery.isLoading && storageQuery.data === undefined) ||
    (bookedQuery.isLoading && bookedQuery.data === undefined)

  const isError =
    (storageQuery.isError && storageQuery.data === undefined) ||
    (bookedQuery.isError && bookedQuery.data === undefined)

  const isReady =
    !isLoading &&
    (availabilityMap.size > 0 ||
      (storageQuery.isFetched && bookedQuery.isFetched))

  return {
    availabilityMap,
    isLoading,
    isError,
    isReady,
    refetch: () => {
      void storageQuery.refetch()
      void bookedQuery.refetch()
    },
  }
}
