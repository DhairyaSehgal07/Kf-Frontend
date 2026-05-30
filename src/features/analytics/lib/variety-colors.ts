import { getAnalyticsChartColor } from "./chart-palette"

/** Known potato varieties — stable color index across the dashboard. */
export const KNOWN_VARIETIES = [
  "K. Jyoti",
  "K. Pukhraj",
  "Khyati",
  "Kuroda",
  "Lav Kar",
  "Himalini",
  "Suriya",
] as const

const varietyColorIndex = new Map<string, number>(
  KNOWN_VARIETIES.map((variety, index) => [variety, index]),
)

export function getVarietyChartColor(variety: string): string {
  const knownIndex = varietyColorIndex.get(variety)
  if (knownIndex != null) return getAnalyticsChartColor(knownIndex)

  let hash = 0
  for (let index = 0; index < variety.length; index += 1) {
    hash = (hash + variety.charCodeAt(index) * (index + 1)) % 997
  }
  return getAnalyticsChartColor(hash)
}

export function collectVarieties(
  chambers: Array<{ varieties: Array<{ variety: string }> }>,
): string[] {
  const set = new Set<string>()
  for (const chamber of chambers) {
    for (const item of chamber.varieties) {
      if (item.variety.trim()) set.add(item.variety)
    }
  }
  const known = KNOWN_VARIETIES.filter((variety) => set.has(variety))
  const rest = [...set]
    .filter((variety) => !known.includes(variety as (typeof KNOWN_VARIETIES)[number]))
    .sort((a, b) => a.localeCompare(b))
  return [...known, ...rest]
}
