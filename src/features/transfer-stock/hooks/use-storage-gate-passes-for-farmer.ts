import { useEffect, useState } from "react"
import { getMockStorageGatePassesForFarmer } from "@/features/transfer-stock/data/mock-storage-gate-passes"
import type { StorageGatePass } from "@/features/transfer-stock/types/storage-gate-pass"

type UseStorageGatePassesForFarmerResult = {
  data: StorageGatePass[]
  isLoading: boolean
  error: Error | null
}

/**
 * Fetches storage gate passes for a farmer link.
 * Replace mock implementation with React Query + API when backend is ready:
 * GET /storage-gate-passes?farmerStorageLinkId=...
 */
export function useStorageGatePassesForFarmer(
  farmerStorageLinkId: string
): UseStorageGatePassesForFarmerResult {
  const [data, setData] = useState<StorageGatePass[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!farmerStorageLinkId.trim()) {
      setData([])
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const timer = window.setTimeout(() => {
      if (cancelled) return
      try {
        const passes = getMockStorageGatePassesForFarmer(farmerStorageLinkId)
        setData(passes)
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to load gate passes"))
        setData([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [farmerStorageLinkId])

  return { data, isLoading, error }
}
