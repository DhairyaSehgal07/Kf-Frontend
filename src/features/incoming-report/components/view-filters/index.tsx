import { useState } from "react"
import type {
  ColumnFiltersState,
  ColumnOrderState,
  GroupingState,
  Table,
  VisibilityState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SlidersHorizontal, CheckCircle2 } from "lucide-react"
import FiltersTab from "./filters-tab"
import ColumnsTab from "./columns-tab"
import GroupingTab from "./grouping-tab"
import AdvancedTab from "./advanced-tab"
import type { IncomingGatePassReportRow } from "@/features/incoming-report/api/types"
import type { AdvancedReportGlobalFilter } from "@/features/incoming-report/utils/report-filter-fns"

interface ViewFiltersSheetProps {
  table: Table<IncomingGatePassReportRow>
}

export function ViewFiltersSheet({ table }: ViewFiltersSheetProps) {
  const [open, setOpen] = useState(false)
  const [draftColumnFilters, setDraftColumnFilters] =
    useState<ColumnFiltersState>(() => table.getState().columnFilters)
  const [draftColumnVisibility, setDraftColumnVisibility] =
    useState<VisibilityState>(() => table.getState().columnVisibility)
  const [draftColumnOrder, setDraftColumnOrder] = useState<ColumnOrderState>(
    () => table.getState().columnOrder,
  )
  const [draftGrouping, setDraftGrouping] = useState<GroupingState>(
    () => table.getState().grouping,
  )
  const [draftGlobalFilter, setDraftGlobalFilter] =
    useState<AdvancedReportGlobalFilter>(() => ({
      logic: "AND",
      conditions: [],
      ...table.getState().globalFilter,
    }))
  const activeFilterCount = table.getState().columnFilters.length
  const activeGroupingCount = table.getState().grouping.length
  const activeAdvancedCount =
    table.getState().globalFilter?.conditions?.filter(
      (condition: { operator: string; value: string }) =>
        condition.operator === "isEmpty" ||
        condition.operator === "isNotEmpty" ||
        condition.value.trim().length > 0,
    ).length ?? 0
  const hiddenColumnCount = table
    .getAllLeafColumns()
    .filter((column) => table.getState().columnVisibility[column.id] === false)
    .length

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const tableState = table.getState()
      setDraftColumnFilters(tableState.columnFilters)
      setDraftColumnVisibility(tableState.columnVisibility)
      setDraftColumnOrder(tableState.columnOrder)
      setDraftGrouping(tableState.grouping)
      setDraftGlobalFilter({
        logic: "AND",
        conditions: [],
        ...tableState.globalFilter,
      })
    }
    setOpen(nextOpen)
  }

  const handleApplyChanges = () => {
    table.setColumnFilters(draftColumnFilters)
    table.setColumnVisibility(draftColumnVisibility)
    table.setColumnOrder(draftColumnOrder)
    table.setGrouping(draftGrouping)
    table.setExpanded(draftGrouping.length > 0 ? true : {})
    table.setGlobalFilter(draftGlobalFilter)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-w-0 flex-1 gap-1.5 border-primary text-primary hover:bg-primary/10 hover:text-primary lg:flex-none"
          aria-label="View filters"
        >
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          <span className="truncate">
            View filters
            {activeFilterCount > 0
              ? ` (${activeFilterCount.toLocaleString("en-IN")})`
              : ""}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-md"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        {/* Added pr-14 to ensure text doesn't overlap with the absolute close button */}
        <SheetHeader className="border-b border-border/40 pl-5 pr-14 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5 text-left">
              <SheetTitle className="text-base font-semibold leading-none">
                View Settings
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground leading-snug">
                Manage table filters, columns, and advanced display groupings.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Scrollable body ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="columns">
                Columns
                {hiddenColumnCount > 0 ? (
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {hiddenColumnCount.toLocaleString("en-IN")} hidden
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="grouping">
                Grouping
                {activeGroupingCount > 0 ? (
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {activeGroupingCount.toLocaleString("en-IN")}
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="advanced">
                Advanced
                {activeAdvancedCount > 0 ? (
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {activeAdvancedCount.toLocaleString("en-IN")}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="filters">
              <FiltersTab
                table={table}
                draftColumnFilters={draftColumnFilters}
                onDraftColumnFiltersChange={setDraftColumnFilters}
              />
            </TabsContent>

            <TabsContent value="columns">
              <ColumnsTab
                table={table}
                draftColumnVisibility={draftColumnVisibility}
                draftColumnOrder={draftColumnOrder}
                onDraftColumnVisibilityChange={setDraftColumnVisibility}
                onDraftColumnOrderChange={setDraftColumnOrder}
              />
            </TabsContent>

            <TabsContent value="grouping">
              <GroupingTab
                table={table}
                draftGrouping={draftGrouping}
                onDraftGroupingChange={setDraftGrouping}
              />
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedTab
                table={table}
                draftGlobalFilter={draftGlobalFilter}
                onDraftGlobalFilterChange={setDraftGlobalFilter}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <SheetFooter className="border-t border-border/40 px-5 py-4">
          <Button
            type="button"
            size="sm"
            className="w-full gap-1.5"
            onClick={handleApplyChanges}
          >
            <CheckCircle2 className="size-3.5" />
            Apply changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}