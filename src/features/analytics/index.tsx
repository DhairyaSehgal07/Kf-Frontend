import { useState } from "react"
import { BarChart3, RefreshCw } from "lucide-react"

import { DatePickerInput } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import Overview from "./components/overview"

const AnalyticsPage = () => {
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()

  const handleApply = () => {
    // TODO: load analytics for the selected date range
  }

  const handleReset = () => {
    setFromDate(undefined)
    setToDate(undefined)
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>Analytics</ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          <DatePickerInput
            id="analytics-from"
            label="From"
            placeholder="Start date"
            value={fromDate}
            onChange={setFromDate}
            className="min-w-0 sm:max-w-[220px] sm:flex-1"
          />

          <DatePickerInput
            id="analytics-to"
            label="To"
            placeholder="End date"
            value={toDate}
            onChange={setToDate}
            className="min-w-0 sm:max-w-[220px] sm:flex-1"
          />

          <div className="flex gap-2 sm:shrink-0">
            <Button className="flex-1 sm:flex-none" onClick={handleApply}>
              Apply
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      <section>
        <Overview/>
     </section>
    </div>
  )
}

export default AnalyticsPage
