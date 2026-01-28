import { memo, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';

import {
  Item,
  ItemMedia,
  ItemTitle,
  ItemHeader,
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
  Search,
  ChevronDown,
  RefreshCw,
  Receipt,
  ArrowUpFromLine,
} from 'lucide-react';
import { useGetIncomingGatePasses } from '@/services/store-admin/incoming-gate-pass/useGetIncomingGatePasses';
import IncomingGatePassVoucher from './incoming-gate-pass-voucher';
import type { IncomingGatePassWithLink } from '@/types/incoming-gate-pass';

const DaybookPage = memo(function DaybookPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'Date' | 'Voucher Number'>('Date');

  const {
    data: vouchers,
    isLoading,
    isFetching,
    refetch,
  } = useGetIncomingGatePasses();

  const filteredAndSortedVouchers: IncomingGatePassWithLink[] = useMemo(() => {
    const list = vouchers ?? [];

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = normalizedQuery
      ? list.filter((voucher) => {
          const farmerName =
            voucher.farmerStorageLinkId.farmerId.name.toLowerCase();
          const voucherNo = String(voucher.gatePassNo);
          const date = new Date(voucher.date).toLocaleDateString('en-IN');
          return (
            farmerName.includes(normalizedQuery) ||
            voucherNo.includes(normalizedQuery) ||
            date.includes(normalizedQuery)
          );
        })
      : list;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'Voucher Number') {
        return b.gatePassNo - a.gatePassNo;
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [vouchers, searchQuery, sortBy]);

  const voucherCount = vouchers?.length ?? 0;

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header: count + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <Receipt className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                {voucherCount} {voucherCount === 1 ? 'voucher' : 'vouchers'}
              </ItemTitle>
            </div>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}
                className="font-custom h-8 gap-2 rounded-lg px-3"
              >
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${
                    isFetching ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ItemActions>
          </ItemHeader>
        </Item>

        {/* Search + sort + add */}
        <Item
          variant="outline"
          size="sm"
          className="flex-col items-stretch gap-4 rounded-xl"
        >
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by voucher number, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-custom focus-visible:ring-primary w-full pl-10 focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          </div>
          <ItemFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-custom focus-visible:ring-primary w-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
                >
                  Sort by: {sortBy}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('Date')}>
                  Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('Voucher Number')}>
                  Voucher Number
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="font-custom h-10 w-full sm:w-auto" asChild>
              <Link to="/store-admin/incoming">
                <ArrowUpFromLine className="h-4 w-4 shrink-0" />
                Add Incoming
              </Link>
            </Button>
          </ItemFooter>
        </Item>

        {/* List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8 pt-6 text-center">
              <p className="font-custom text-muted-foreground">
                Loading vouchers...
              </p>
            </CardContent>
          </Card>
        ) : filteredAndSortedVouchers.length === 0 ? (
          <Card>
            <CardContent className="py-8 pt-6 text-center">
              <p className="font-custom text-muted-foreground">
                {searchQuery
                  ? 'No vouchers match your search.'
                  : 'No vouchers yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {filteredAndSortedVouchers.map((voucher) => (
              <IncomingGatePassVoucher key={voucher._id} voucher={voucher} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
});

export default DaybookPage;
