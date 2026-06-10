import { useMemo } from "react"
import { ChevronRight, Package } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookingSummaryTable } from "@/features/booking/components/booking-summary-table"
import {
  PLACEHOLDER_BOOKED_SUMMARY,
  PLACEHOLDER_TOTAL_SUMMARY,
} from "@/features/booking/lib/booking-summary-placeholder"
import {
  buildBookingSummaryTable,
  computeNetAvailable,
  formatBookingBagCount,
} from "@/features/booking/lib/booking-summary-utils"
import { cn } from "@/lib/utils"

// Future: totalQuery, bookedQuery: UseQueryResult<BookingVarietySummary[], Error>

type BookingSummaryCollapsibleSectionProps = {
  title: string
  description: string
  grandTotal: number
  children: React.ReactNode
}

function BookingSummaryCollapsibleSection({
  title,
  description,
  grandTotal,
  children,
}: BookingSummaryCollapsibleSectionProps) {
  return (
    <Collapsible
      defaultOpen={false}
      className="group overflow-hidden rounded-lg border border-border"
    >
      <CollapsibleTrigger
        className={cn(
          "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/30 data-[state=open]:bg-muted/20 sm:px-5",
        )}
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-heading text-sm font-semibold text-foreground sm:text-base">
            {title}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm font-medium tabular-nums text-primary">
            {formatBookingBagCount(grandTotal)} bags
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90"
            aria-hidden
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border bg-muted/10 px-3 py-4 sm:px-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function BookingSummary() {
  const totalTable = useMemo(
    () => buildBookingSummaryTable(PLACEHOLDER_TOTAL_SUMMARY),
    [],
  )
  const bookedTable = useMemo(
    () => buildBookingSummaryTable(PLACEHOLDER_BOOKED_SUMMARY),
    [],
  )
  const netTable = useMemo(() => {
    const netData = computeNetAvailable(
      PLACEHOLDER_TOTAL_SUMMARY,
      PLACEHOLDER_BOOKED_SUMMARY,
    )
    return buildBookingSummaryTable(netData)
  }, [])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold sm:text-lg">
                <Package className="size-5 text-primary" aria-hidden />
                Net available for booking
              </CardTitle>
              <CardDescription>
                Remaining stock after booked quantities are subtracted from total
                inventory.
              </CardDescription>
            </div>
            <div className="rounded-lg border border-border bg-primary/10 px-4 py-2.5 text-right">
              <p className="text-xs font-medium text-muted-foreground">
                Net total
              </p>
              <p className="font-heading text-xl font-semibold tabular-nums text-primary">
                {formatBookingBagCount(netTable.grandTotal)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <BookingSummaryTable
            table={netTable}
            emptyMessage="No net availability data for the selected period."
          />
        </CardContent>
      </Card>

      <BookingSummaryCollapsibleSection
        title="Total stock"
        description="Full inventory available across varieties and bag sizes."
        grandTotal={totalTable.grandTotal}
      >
        <BookingSummaryTable
          table={totalTable}
          emptyMessage="No total stock data for the selected period."
        />
      </BookingSummaryCollapsibleSection>

      <BookingSummaryCollapsibleSection
        title="Booked quantities"
        description="Bags already committed through booking gate passes."
        grandTotal={bookedTable.grandTotal}
      >
        <BookingSummaryTable
          table={bookedTable}
          emptyMessage="No booked quantity data for the selected period."
        />
      </BookingSummaryCollapsibleSection>
    </div>
  )
}
