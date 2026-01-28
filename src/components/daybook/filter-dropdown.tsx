import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FilterDropdownsProps {
  orderFilter: string;
  sortFilter: string;
  commodityFilter: string;
  onOrderFilterChange: (filter: string) => void;
  onSortFilterChange: (filter: string) => void;
  onCommodityFilterChange: (filter: string) => void;
}

const FilterDropdowns = memo(function FilterDropdowns({
  orderFilter,
  sortFilter,
  commodityFilter,
  onOrderFilterChange,
  onSortFilterChange,
  onCommodityFilterChange,
}: FilterDropdownsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="truncate font-custom">{orderFilter}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full sm:w-auto">
          <DropdownMenuItem
            onClick={() => onOrderFilterChange('All Orders')}
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            All Orders
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onOrderFilterChange('Incoming')}
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Incoming
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onOrderFilterChange('Outgoing')}
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Outgoing
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="truncate font-custom">{commodityFilter}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full sm:w-auto">
          <DropdownMenuItem
            onClick={() => onCommodityFilterChange('All Commodities')}
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            All Commodities
          </DropdownMenuItem>
          {/* {commodities.map((commodity) => (
            <DropdownMenuItem
              key={commodity.name}
              onClick={() => onCommodityFilterChange(commodity.name)}
              className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {commodity.name}
            </DropdownMenuItem>
          ))} */}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="truncate font-custom">{sortFilter}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full sm:w-auto">
          <DropdownMenuItem
            onClick={() => onSortFilterChange('Latest First')}
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Latest First
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortFilterChange('Oldest First')}
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortFilterChange('Receipt Number')}
            className="font-custom focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Receipt Number
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

export default FilterDropdowns;
