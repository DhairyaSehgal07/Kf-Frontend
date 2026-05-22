import {
  MOCK_INCOMING_GATE_PASSES,
  resolveSelectedIncomingGatePasses,
} from "@/features/grading/data/mock-incoming-gate-passes"
import type { GradingSelectIncomingGatePasses } from "@/features/grading/types"
import { cn } from "@/lib/utils"

type IncomingGatePassesSummaryCardProps = {
  selectedIds: readonly string[]
  gatePasses?: readonly GradingSelectIncomingGatePasses[]
  className?: string
}

function formatBags(value: number) {
  return new Intl.NumberFormat("en-IN").format(value)
}

export function IncomingGatePassesSummaryCard({
  selectedIds,
  gatePasses: gatePassesProp,
  className,
}: IncomingGatePassesSummaryCardProps) {
  const gatePasses =
    gatePassesProp ??
    resolveSelectedIncomingGatePasses(selectedIds, MOCK_INCOMING_GATE_PASSES)

  if (gatePasses.length === 0) return null

  const totalBags = gatePasses.reduce(
    (sum, gatePass) => sum + gatePass.bagsReceived,
    0
  )

  return (
    <div
      className={cn(
        "w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
      aria-label="Selected incoming gate passes"
    >
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              Incoming Gate Pass #
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
              Bags
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {gatePasses.map((gatePass) => (
            <tr key={gatePass._id}>
              <td className="px-3 py-2 font-medium text-foreground tabular-nums">
                #{gatePass.manualGatePassNumber}
              </td>
              <td className="px-3 py-2 text-right font-medium text-muted-foreground tabular-nums">
                {formatBags(gatePass.bagsReceived)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-border">
          <tr>
            <td className="px-3 py-2 text-sm font-semibold text-foreground">
              Total
            </td>
            <td className="px-3 py-2 text-right text-sm font-semibold text-foreground tabular-nums">
              {formatBags(totalBags)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
