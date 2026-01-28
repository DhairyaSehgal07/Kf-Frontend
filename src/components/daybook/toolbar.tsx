import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SearchBar from './search-bar';
import FilterDropdowns from './filter-dropdown';
import ActionButtons from './action-buttons';

interface ToolbarProps {
  total: number | null;
  searchQuery: string;
  orderFilter: string;
  sortFilter: string;
  commodityFilter: string;
  onSearchChange: (query: string) => void;
  onOrderFilterChange: (filter: string) => void;
  onSortFilterChange: (filter: string) => void;
  onCommodityFilterChange: (filter: string) => void;
  onAddPayment?: () => void;
}

const Toolbar = memo(function Toolbar({
  total,
  searchQuery,
  orderFilter,
  sortFilter,
  commodityFilter,
  onSearchChange,
  onOrderFilterChange,
  onSortFilterChange,
  onCommodityFilterChange,
}: ToolbarProps) {
  return (
    <div className="pb-8 space-y-6">
      <Card className="w-full shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-secondary">
              <div className="h-5 w-5 rounded-sm bg-primary"></div>
            </div>
            <div>
              <span className="font-custom text-2xl sm:text-3xl font-bold text-[#333]">
                {total ?? '0'}
              </span>
              <span className="ml-2 font-custom text-base sm:text-lg text-gray-600">
                orders
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />

            <div className="flex flex-col gap-4 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <FilterDropdowns
                  orderFilter={orderFilter}
                  sortFilter={sortFilter}
                  commodityFilter={commodityFilter}
                  onOrderFilterChange={onOrderFilterChange}
                  onSortFilterChange={onSortFilterChange}
                  onCommodityFilterChange={onCommodityFilterChange}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <ActionButtons />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default Toolbar;
