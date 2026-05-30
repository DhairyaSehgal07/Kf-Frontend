import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatBagCount } from "../../lib/storage-location-utils"
import type { VarietyAggregate } from "../../types/storage-location-wise"
import { VarietyPill } from "./variety-pill"

export function StorageLocationVarietySummary({
  aggregates,
}: {
  aggregates: VarietyAggregate[]
}) {
  if (aggregates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No variety data for the selected filters.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {aggregates.map((aggregate) => (
        <Card key={aggregate.variety} className="min-w-0">
          <CardHeader className="gap-3 border-b border-border/60 pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="font-heading text-base font-semibold">
                  {aggregate.variety}
                </CardTitle>
                <VarietyPill
                  variety={aggregate.variety}
                  quantity={aggregate.totalQuantity}
                />
              </div>
              <CardDescription className="text-sm tabular-nums text-foreground">
                {formatBagCount(aggregate.totalQuantity)} bags total
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                      Chamber
                    </TableHead>
                    <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                      Floor
                    </TableHead>
                    <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                      Row
                    </TableHead>
                    <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                      Quantity
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregate.locations.map((location) => (
                    <TableRow
                      key={`${aggregate.variety}-${location.chamber}-${location.floor}-${location.row}`}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <TableCell className="px-3 py-2.5 font-medium text-foreground">
                        {location.chamber}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-foreground">
                        {location.floor}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-foreground">
                        {location.row}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {formatBagCount(location.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
