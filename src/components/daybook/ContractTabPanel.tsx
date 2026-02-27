import { type ReactNode, memo } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Item,
  ItemHeader,
  ItemMedia,
  ItemTitle,
  ItemActions,
  ItemFooter,
} from '@/components/ui/item';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import {
  Search,
  ChevronDown,
  RefreshCw,
  Receipt,
  ArrowUpFromLine,
} from 'lucide-react';
const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

export interface ContractTabPanelProps {
  /** Label for the primary action button (e.g. "Add Incoming", "Add Grading") */
  addButtonLabel: string;
  /** Route for the primary action button */
  addButtonTo: string;
  placeholderCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: 'Date' | 'Voucher Number';
  sortOrder: 'asc' | 'desc';
  onSortByChange: (value: 'Date' | 'Voucher Number') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onSortPageReset: () => void;
  limit: number;
  setLimitAndResetPage: (limit: number) => void;
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  setPage: (updater: (p: number) => number) => void;
  /** Optional content below controls (e.g. list of vouchers) */
  children?: ReactNode;
}

const ContractTabPanel = memo(function ContractTabPanel({
  addButtonLabel,
  addButtonTo,
  placeholderCount,
  isRefreshing,
  onRefresh,
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  onSortPageReset,
  limit,
  setLimitAndResetPage,
  page,
  totalPages,
  hasPrev,
  hasNext,
  setPage,
  children,
}: ContractTabPanelProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Voucher count + refresh (UI placeholder) */}
      <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
        <ItemHeader className="h-full">
          <div className="flex items-center gap-3">
            <ItemMedia variant="icon" className="rounded-lg">
              <Receipt className="text-primary h-5 w-5" />
            </ItemMedia>
            <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
              {placeholderCount}{' '}
              {placeholderCount === 1 ? 'voucher' : 'vouchers'}
            </ItemTitle>
          </div>
          <ItemActions>
            <Button
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              onClick={onRefresh}
              className="font-custom h-8 gap-2 rounded-lg px-3"
            >
              <RefreshCw
                className={`h-4 w-4 shrink-0 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </ItemActions>
        </ItemHeader>
      </Item>

      {/* Search, sort + add */}
      <Item
        variant="outline"
        size="sm"
        className="flex-col items-stretch gap-4 rounded-xl"
      >
        <div className="relative w-full">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by voucher number"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="font-custom focus-visible:ring-primary w-full pl-10 focus-visible:ring-2 focus-visible:ring-offset-2"
          />
        </div>
        <ItemFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-1 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-custom focus-visible:ring-primary w-full min-w-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto sm:min-w-40"
                >
                  <span className="hidden sm:inline">Sort by: </span>
                  <span className="sm:hidden">Sort: </span>
                  {sortBy === 'Voucher Number' ? (
                    <span className="truncate">Voucher No.</span>
                  ) : (
                    sortBy
                  )}
                  <span className="font-custom text-muted-foreground hidden sm:inline">
                    {' '}
                    · {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="font-custom">
                <DropdownMenuItem onClick={() => onSortByChange('Date')}>
                  Date
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSortByChange('Voucher Number')}
                >
                  Voucher Number
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onSortOrderChange('asc');
                    onSortPageReset();
                  }}
                >
                  Ascending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onSortOrderChange('desc');
                    onSortPageReset();
                  }}
                >
                  Descending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            className="font-custom h-10 w-full shrink-0 sm:w-auto"
            asChild
          >
            <Link to={addButtonTo}>
              <ArrowUpFromLine className="h-4 w-4 shrink-0" />
              {addButtonLabel}
            </Link>
          </Button>
        </ItemFooter>
      </Item>

      {children != null ? <div className="space-y-6">{children}</div> : null}

      {/* Pagination */}
      <Item
        variant="outline"
        size="sm"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="font-custom focus-visible:ring-primary rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {limit} per page
              <ChevronDown className="ml-1.5 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {LIMIT_OPTIONS.map((n) => (
              <DropdownMenuItem key={n} onClick={() => setLimitAndResetPage(n)}>
                {n} per page
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className="font-custom focus-visible:ring-primary cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-disabled={!hasPrev}
                onClick={(e) => {
                  e.preventDefault();
                  if (hasPrev) setPage((p) => Math.max(1, p - 1));
                }}
                style={
                  !hasPrev ? { pointerEvents: 'none', opacity: 0.5 } : undefined
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                isActive
                href="#"
                className="font-custom cursor-default"
                onClick={(e) => e.preventDefault()}
              >
                {page} / {totalPages}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                className="font-custom focus-visible:ring-primary cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-disabled={!hasNext}
                onClick={(e) => {
                  e.preventDefault();
                  if (hasNext) setPage((p) => Math.min(totalPages, p + 1));
                }}
                style={
                  !hasNext ? { pointerEvents: 'none', opacity: 0.5 } : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Item>
    </div>
  );
});

export { ContractTabPanel, LIMIT_OPTIONS as CONTRACT_TAB_LIMIT_OPTIONS };
