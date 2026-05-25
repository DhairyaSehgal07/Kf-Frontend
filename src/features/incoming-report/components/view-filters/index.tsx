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

export function ViewFiltersSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-w-0 flex-1 gap-1.5 border-primary text-primary hover:bg-primary/10 hover:text-primary lg:flex-none"
          aria-label="View filters"
        >
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          <span className="truncate">View filters</span>
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
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger value="grouping">Grouping</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="filters">
              <FiltersTab />
            </TabsContent>

            <TabsContent value="columns" >
            <ColumnsTab/>
            </TabsContent>

            <TabsContent value="grouping" >
            <GroupingTab/>
            </TabsContent>

            <TabsContent value="advanced" >
            <AdvancedTab/>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <SheetFooter className="border-t border-border/40 px-5 py-4">
          <Button
            type="submit"
            size="sm"
            className="w-full gap-1.5"
          >
            <CheckCircle2 className="size-3.5" />
            Apply changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}