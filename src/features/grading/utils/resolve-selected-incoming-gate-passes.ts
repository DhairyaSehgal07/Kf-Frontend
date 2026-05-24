import type { GradingSelectIncomingGatePasses } from "@/features/grading/types"

export function resolveSelectedIncomingGatePasses(
  selectedIds: readonly string[],
  allGatePasses: readonly GradingSelectIncomingGatePasses[],
): GradingSelectIncomingGatePasses[] {
  const idSet = new Set(selectedIds)
  return allGatePasses.filter((gatePass) => idSet.has(gatePass._id))
}
