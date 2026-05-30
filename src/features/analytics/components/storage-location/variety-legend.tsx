import { collectVarieties } from "../../lib/variety-colors"
import type { StorageLocationChamber } from "../../types/storage-location-wise"
import { VarietyPill } from "./variety-pill"

export function StorageLocationVarietyLegend({
  chambers,
}: {
  chambers: StorageLocationChamber[]
}) {
  const varieties = collectVarieties(chambers)

  if (varieties.length === 0) return null

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3">
      <p className="text-sm font-medium text-foreground">Variety legend</p>
      <div className="flex flex-wrap gap-2">
        {varieties.map((variety) => (
          <VarietyPill key={variety} variety={variety} showQuantity={false} />
        ))}
      </div>
    </div>
  )
}
