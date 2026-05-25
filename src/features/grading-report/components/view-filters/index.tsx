import { useState } from 'react';
import type { ColumnFiltersState, Table } from '@tanstack/react-table';
import { CheckCircle2, RotateCcw, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GradingGatePassReportRow } from '@/features/grading-report/api/types';
import FiltersTab from './filters-tab';

interface ViewFiltersSheetProps {
  table: Table<GradingGatePassReportRow>;
}

export function ViewFiltersSheet({ table }: ViewFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draftColumnFilters, setDraftColumnFilters] = useState<ColumnFiltersState>(
    () => table.getState().columnFilters,
  );
  const activeFilterCount = table.getState().columnFilters.length;
  const hasDraftViewChanges = draftColumnFilters.length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftColumnFilters(table.getState().columnFilters);
    }

    setOpen(nextOpen);
  };

  const handleApplyChanges = () => {
    table.setColumnFilters(draftColumnFilters);
    setOpen(false);
  };

  const handleResetChanges = () => {
    setDraftColumnFilters([]);
    table.setColumnFilters([]);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10 hover:text-primary dark:border-border dark:bg-muted/20 dark:text-foreground dark:hover:bg-muted/40 dark:hover:text-foreground min-w-0 flex-1 gap-1.5 lg:flex-none"
          aria-label="View grading report filters"
        >
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          <span className="truncate">
            View filters
            {activeFilterCount > 0 ? ` (${activeFilterCount.toLocaleString('en-IN')})` : ''}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-2xl lg:data-[side=right]:max-w-3xl"
      >
        <SheetHeader className="border-border/40 border-b py-4 pr-14 pl-5">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <SlidersHorizontal className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 space-y-0.5 text-left">
              <SheetTitle className="text-base leading-none font-semibold">View Settings</SheetTitle>
              <SheetDescription className="text-muted-foreground text-xs leading-snug">
                Manage grading report filters and table view settings.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="filters">
              <FiltersTab
                table={table}
                draftColumnFilters={draftColumnFilters}
                onDraftColumnFiltersChange={setDraftColumnFilters}
              />
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="border-border/40 grid grid-cols-1 gap-2 border-t px-5 py-4 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            disabled={!hasDraftViewChanges}
            onClick={handleResetChanges}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
          <Button type="button" size="sm" className="w-full gap-1.5" onClick={handleApplyChanges}>
            <CheckCircle2 className="size-3.5" aria-hidden />
            Apply changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
