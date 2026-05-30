import type {
  StorageLocationChamber,
  StorageLocationQuantityMode,
  StorageLocationWiseData,
  VarietyAggregate,
  VarietyLocationEntry,
  VarietyStock,
} from "../types/storage-location-wise"

const bagFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
})

export function formatBagCount(value: number): string {
  return bagFormatter.format(value)
}

export function getVarietyQuantity(
  item: VarietyStock,
  mode: StorageLocationQuantityMode,
): number {
  if (mode === "current") return item.currentQuantity
  if (mode === "initial") return item.initialQuantity
  return item.quantityRemoved
}

export function getLevelQuantity(
  item: {
    initialQuantity: number
    currentQuantity: number
    quantityRemoved: number
  },
  mode: StorageLocationQuantityMode,
): number {
  if (mode === "current") return item.currentQuantity
  if (mode === "initial") return item.initialQuantity
  return item.quantityRemoved
}

export function computeDashboardTotals(
  chambers: StorageLocationChamber[],
  mode: StorageLocationQuantityMode,
) {
  const totalStock = chambers.reduce(
    (sum, chamber) => sum + getLevelQuantity(chamber, mode),
    0,
  )
  const totalRemoved = chambers.reduce(
    (sum, chamber) => sum + chamber.quantityRemoved,
    0,
  )
  const chamberTotals = chambers.map((chamber) => ({
    chamber: chamber.chamber,
    quantity: getLevelQuantity(chamber, mode),
  }))
  const varietySet = new Set<string>()
  for (const chamber of chambers) {
    for (const variety of chamber.varieties) {
      if (variety.variety.trim()) varietySet.add(variety.variety)
    }
  }

  return {
    totalStock,
    totalRemoved,
    chamberTotals,
    varietyCount: varietySet.size,
  }
}

export function aggregateVarietySummary(
  chambers: StorageLocationChamber[],
  mode: StorageLocationQuantityMode,
): VarietyAggregate[] {
  const byVariety = new Map<string, VarietyAggregate>()

  for (const chamber of chambers) {
    for (const floor of chamber.floors) {
      for (const row of floor.rows) {
        for (const variety of row.varieties) {
          const quantity = getVarietyQuantity(variety, mode)
          if (quantity <= 0) continue

          const entry: VarietyLocationEntry = {
            chamber: chamber.chamber,
            floor: floor.floor,
            row: row.row,
            quantity,
          }

          const existing = byVariety.get(variety.variety)
          if (existing) {
            existing.totalQuantity += quantity
            existing.locations.push(entry)
          } else {
            byVariety.set(variety.variety, {
              variety: variety.variety,
              totalQuantity: quantity,
              locations: [entry],
            })
          }
        }
      }
    }
  }

  return [...byVariety.values()].sort((a, b) =>
    b.totalQuantity - a.totalQuantity || a.variety.localeCompare(b.variety),
  )
}

export type StorageLocationFilters = {
  searchQuery: string
  varietyFilter: string
}

function matchesSearch(
  chamber: string,
  floor: string,
  searchQuery: string,
): boolean {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return true
  return (
    chamber.toLowerCase().includes(query) ||
    floor.toLowerCase().includes(query) ||
    `chamber ${chamber}`.includes(query) ||
    `floor ${floor}`.includes(query)
  )
}

function rowHasVariety(
  row: StorageLocationChamber["floors"][number]["rows"][number],
  varietyFilter: string,
  mode: StorageLocationQuantityMode,
): boolean {
  if (varietyFilter === "all") return true
  return row.varieties.some(
    (variety) =>
      variety.variety === varietyFilter &&
      getVarietyQuantity(variety, mode) > 0,
  )
}

export function filterStorageLocationData(
  data: StorageLocationWiseData,
  filters: StorageLocationFilters,
  mode: StorageLocationQuantityMode,
): StorageLocationWiseData {
  const { searchQuery, varietyFilter } = filters

  const chambers = data.chambers
    .map((chamber) => {
      const floors = chamber.floors
        .map((floor) => {
          if (!matchesSearch(chamber.chamber, floor.floor, searchQuery)) {
            return null
          }

          const rows = floor.rows.filter((row) =>
            rowHasVariety(row, varietyFilter, mode),
          )
          if (rows.length === 0) return null

          return { ...floor, rows }
        })
        .filter((floor): floor is NonNullable<typeof floor> => floor != null)

      if (floors.length === 0) return null
      return { ...chamber, floors }
    })
    .filter((chamber): chamber is NonNullable<typeof chamber> => chamber != null)

  return { chambers }
}

export function normalizeStorageLocationData(data: unknown): StorageLocationWiseData {
  if (
    data &&
    typeof data === "object" &&
    "chambers" in data &&
    Array.isArray((data as StorageLocationWiseData).chambers)
  ) {
    return data as StorageLocationWiseData
  }

  return { chambers: [] }
}
