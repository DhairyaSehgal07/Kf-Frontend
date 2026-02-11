import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchSelector } from '@/components/forms/search-selector';
import { ArrowDown, ArrowUp, Columns, User, Calendar } from 'lucide-react';

export interface GradingFiltersBarProps {
  varietyFilter: string;
  onVarietyFilterChange: (value: string) => void;
  voucherSort: 'asc' | 'desc';
  onVoucherSortChange: (sort: 'asc' | 'desc') => void;
  groupBy: 'farmer' | 'date';
  onGroupByChange: (group: 'farmer' | 'date') => void;
  varieties: string[];
  tableSizes: string[];
  visibleColumns: Set<string>;
  onColumnToggle: (size: string) => void;
  hasGradingData: boolean;
}

export const GradingFiltersBar = memo(function GradingFiltersBar({
  varietyFilter,
  onVarietyFilterChange,
  voucherSort,
  onVoucherSortChange,
  groupBy,
  onGroupByChange,
  varieties,
  tableSizes,
  visibleColumns,
  onColumnToggle,
  hasGradingData,
}: GradingFiltersBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-custom text-foreground text-lg font-semibold">
            Grading Gate Passes
          </h3>
          <p className="font-custom text-muted-foreground text-sm">
            {hasGradingData
              ? 'Select variety, then sort and group vouchers. Allocate quantities in each pass card below.'
              : 'Load grading gate passes to see orders.'}
          </p>
        </div>
        {hasGradingData && tableSizes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-custom gap-2"
              >
                <Columns className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-custom">
                Toggle Columns
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tableSizes.map((size) => (
                <DropdownMenuCheckboxItem
                  key={size}
                  checked={visibleColumns.has(size)}
                  onCheckedChange={() => onColumnToggle(size)}
                  className="font-custom"
                >
                  {size}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {hasGradingData && (
        <div className="border-border/60 bg-muted/30 flex flex-wrap items-end gap-x-5 gap-y-4 rounded-xl border px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="storage-grading-variety-filter"
              className="font-custom text-muted-foreground text-xs leading-none font-medium"
            >
              Variety
            </label>
            <SearchSelector
              id="storage-grading-variety-filter"
              options={varieties.map((v) => ({ value: v, label: v }))}
              placeholder="Select variety"
              onSelect={(value) => onVarietyFilterChange(value ?? '')}
              value={varietyFilter}
              buttonClassName="font-custom h-10 w-[160px] sm:w-[180px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-custom text-muted-foreground text-xs leading-none font-medium">
              Sort by voucher
            </span>
            <div className="flex h-10 items-center gap-1.5">
              <Button
                type="button"
                variant={voucherSort === 'asc' ? 'default' : 'outline'}
                size="sm"
                className="font-custom h-10 gap-1.5 px-3"
                onClick={() => onVoucherSortChange('asc')}
              >
                <ArrowUp className="h-4 w-4" />
                Ascending
              </Button>
              <Button
                type="button"
                variant={voucherSort === 'desc' ? 'default' : 'outline'}
                size="sm"
                className="font-custom h-10 gap-1.5 px-3"
                onClick={() => onVoucherSortChange('desc')}
              >
                <ArrowDown className="h-4 w-4" />
                Descending
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-custom text-muted-foreground text-xs leading-none font-medium">
              Group by
            </span>
            <div className="flex h-10 items-center gap-1.5">
              <Button
                type="button"
                variant={groupBy === 'farmer' ? 'default' : 'outline'}
                size="sm"
                className="font-custom h-10 gap-1.5 px-3"
                onClick={() => onGroupByChange('farmer')}
              >
                <User className="h-4 w-4" />
                Farmer
              </Button>
              <Button
                type="button"
                variant={groupBy === 'date' ? 'default' : 'outline'}
                size="sm"
                className="font-custom h-10 gap-1.5 px-3"
                onClick={() => onGroupByChange('date')}
              >
                <Calendar className="h-4 w-4" />
                Date
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
