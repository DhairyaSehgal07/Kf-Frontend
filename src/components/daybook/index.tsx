import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import type { DaybookEntry } from '@/types/daybook';
import {
  IncomingVoucher,
  GradingVoucher,
  StorageVoucher,
  type IncomingVoucherData,
} from './vouchers';
import { ContractTabPanel } from './ContractTabPanel';
import { useGetIncomingGatePasses } from '@/services/store-admin/incoming-gate-pass/useGetIncomingGatePasses';
import { useGetGradingGatePasses } from '@/services/store-admin/grading-gate-pass/useGetGradingGatePasses';
import { useGetStorageGatePasses } from '@/services/store-admin/storage-gate-pass/useGetStorageGatePasses';
import type { IncomingGatePassWithLink } from '@/types/incoming-gate-pass';
import type { GradingGatePass } from '@/types/grading-gate-pass';
import type { StorageGatePassWithLink } from '@/types/storage-gate-pass';

/** Map API response to props for IncomingVoucher (handles populated or plain link) */
function mapIncomingPassToVoucherProps(pass: IncomingGatePassWithLink) {
  const rawLink = pass.farmerStorageLinkId;
  const link =
    rawLink && typeof rawLink === 'object' && !Array.isArray(rawLink)
      ? (rawLink as unknown as Record<string, unknown>)
      : undefined;
  type FarmerShape = {
    name?: string;
    address?: string;
    mobileNumber?: string;
  };
  const farmer = link
    ? ((link.farmerId ?? link.farmer) as FarmerShape | undefined)
    : undefined;
  return {
    voucher: {
      _id: pass._id,
      category: pass.category,
      gatePassNo: pass.gatePassNo,
      manualGatePassNumber: pass.manualGatePassNumber,
      date: pass.date,
      variety: pass.variety,
      truckNumber: pass.truckNumber,
      bagsReceived: pass.bagsReceived,
      status: pass.status,
      weightSlip: pass.weightSlip,
      remarks: pass.remarks,
      gradingSummary: pass.gradingSummary,
      createdBy:
        pass.createdBy ?? (link?.linkedById as { name?: string } | undefined),
    } satisfies IncomingVoucherData,
    farmerName: farmer?.name,
    farmerAccount: link?.accountNumber as number | undefined,
    farmerAddress: farmer?.address,
    farmerMobile: farmer?.mobileNumber,
  };
}

/** Map API response to props for GradingVoucher. Uses weightSlipDetails when present for net weight and wastage by weight. */
function mapGradingPassToVoucherProps(pass: GradingGatePass) {
  const link = pass.farmerStorageLinkId;
  const linkObj =
    link && typeof link === 'object' && !Array.isArray(link)
      ? (link as {
          _id?: string;
          farmerId?: { name?: string };
          accountNumber?: number;
        })
      : undefined;
  const farmerName = linkObj?.farmerId?.name;
  const farmerAccount = linkObj?.accountNumber;
  const linkId = typeof link === 'string' ? link : linkObj?._id;

  const incomingRefs = pass.weightSlipDetails?.incomingGatePassIds?.length
    ? pass.weightSlipDetails.incomingGatePassIds
    : pass.incomingGatePassIds;
  const incomingBagsCount = incomingRefs?.reduce(
    (sum, ref) => sum + (ref.bagsReceived ?? 0),
    0
  );
  const incomingNetKg = pass.weightSlipDetails?.incomingGatePassIds?.reduce(
    (sum, ref) => {
      const ws = ref.weightSlip;
      if (ws?.grossWeightKg != null && ws?.tareWeightKg != null) {
        return sum + (ws.grossWeightKg - ws.tareWeightKg);
      }
      return sum;
    },
    0
  );

  return {
    voucher: {
      _id: pass._id,
      gatePassNo: pass.gatePassNo,
      manualGatePassNumber: pass.manualGatePassNumber,
      date: pass.date,
      variety: pass.variety,
      orderDetails: pass.orderDetails,
      allocationStatus: pass.allocationStatus,
      remarks: pass.remarks,
      createdBy: pass.createdBy,
    },
    farmerName,
    farmerAccount,
    farmerStorageLinkId: linkId,
    incomingBagsCount:
      incomingBagsCount && incomingBagsCount > 0
        ? incomingBagsCount
        : undefined,
    incomingNetKg:
      incomingNetKg != null && incomingNetKg > 0 ? incomingNetKg : undefined,
    incomingGatePassIds: incomingRefs?.length ? incomingRefs : undefined,
  };
}

interface DaybookEntryCardProps {
  entry: DaybookEntry;
}

const DaybookEntryCard = memo(function DaybookEntryCard({
  entry,
}: DaybookEntryCardProps) {
  const incoming = entry.incoming as IncomingVoucherData | undefined;
  const farmer = entry.farmer;
  const farmerName = farmer?.name;
  const farmerAccount = farmer?.accountNumber;
  const farmerAddress = farmer?.address;
  const farmerMobile = farmer?.mobileNumber;

  return (
    <>
      {incoming ? (
        <IncomingVoucher
          voucher={incoming}
          farmerName={farmerName}
          farmerAccount={farmerAccount}
          farmerAddress={farmerAddress}
          farmerMobile={farmerMobile}
        />
      ) : (
        <p className="text-muted-foreground font-custom py-6 text-center text-sm">
          No incoming voucher.
        </p>
      )}
    </>
  );
});

export { DaybookEntryCard };

const DaybookPage = memo(function DaybookPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'Date' | 'Voucher Number'>(
    'Voucher Number'
  );
  const [incomingStatusFilter, setIncomingStatusFilter] = useState<
    'graded' | 'ungraded' | undefined
  >(undefined);

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);
    return () => debouncedSetSearch.cancel();
  }, [searchQuery, debouncedSetSearch]);

  const setLimitAndResetPage = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const {
    data: incomingData,
    isLoading: incomingLoading,
    isFetching: incomingFetching,
    refetch: refetchIncoming,
  } = useGetIncomingGatePasses({
    page,
    limit,
    sortOrder,
    sortBy: 'gatePassNo',
    gatePassNo: debouncedSearch.trim() || undefined,
    status: incomingStatusFilter,
  });

  const {
    data: gradingGatePassesRaw,
    isLoading: gradingLoading,
    isFetching: gradingFetching,
    refetch: refetchGrading,
  } = useGetGradingGatePasses({
    page,
    limit,
    sortOrder,
    sortBy: 'gatePassNo',
    gatePassNo: debouncedSearch.trim() || undefined,
  });

  const {
    data: storageGatePassesRaw = [],
    isLoading: storageLoading,
    isFetching: storageFetching,
    refetch: refetchStorage,
  } = useGetStorageGatePasses();

  const storageGatePasses = useMemo(
    () => (Array.isArray(storageGatePassesRaw) ? storageGatePassesRaw : []),
    [storageGatePassesRaw]
  );

  const filteredAndSortedStoragePasses = useMemo(() => {
    const trimmed = debouncedSearch.trim();
    let list = storageGatePasses;
    if (trimmed) {
      // Exact gate pass number only (e.g. "3" matches 3, not 13 or 23)
      if (!/^\d+$/.test(trimmed)) {
        list = [];
      } else {
        const num = Number(trimmed);
        list = list.filter(
          (pass: StorageGatePassWithLink) =>
            pass.gatePassNo === num || pass.manualGatePassNumber === num
        );
      }
    }
    const sorted = [...list].sort((a, b) => {
      const aVal =
        sortBy === 'Date'
          ? new Date(a.date ?? 0).getTime()
          : Number(a.gatePassNo ?? 0);
      const bVal =
        sortBy === 'Date'
          ? new Date(b.date ?? 0).getTime()
          : Number(b.gatePassNo ?? 0);
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [storageGatePasses, debouncedSearch, sortBy, sortOrder]);

  const incomingGatePasses = useMemo(
    () => incomingData?.list ?? [],
    [incomingData]
  );
  const incomingPagination = incomingData?.pagination;
  const incomingTotalPages = incomingPagination?.totalPages ?? 1;
  const incomingHasPrev = page > 1;
  const incomingHasNext = page < incomingTotalPages;

  const gradingGatePasses = useMemo(
    () => gradingGatePassesRaw?.list ?? [],
    [gradingGatePassesRaw]
  );

  const gradingPagination = gradingGatePassesRaw?.pagination;
  const gradingTotalPages = gradingPagination?.totalPages ?? 1;
  const gradingHasPrev = page > 1;
  const gradingHasNext = page < gradingTotalPages;

  const totalPages = 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const incomingTotal = incomingPagination?.total ?? incomingGatePasses.length;

  const [placeholderCount, setPlaceholderCount] = useState(
    () => Math.floor(Math.random() * 20) + 1
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPlaceholderCount(() => Math.floor(Math.random() * 20) + 1);
    const t = setTimeout(() => setIsRefreshing(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-6">
      <div className="space-y-4 sm:space-y-6">
        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="font-custom flex h-auto w-full flex-nowrap overflow-x-auto">
            <TabsTrigger
              value="incoming"
              className="min-w-0 flex-1 shrink-0 px-3 sm:px-4"
            >
              <span className="sm:hidden">Inc</span>
              <span className="hidden sm:inline">Incoming</span>
            </TabsTrigger>
            <TabsTrigger
              value="grading"
              className="min-w-0 flex-1 shrink-0 px-3 sm:px-4"
            >
              <span className="sm:hidden">Gra</span>
              <span className="hidden sm:inline">Grading</span>
            </TabsTrigger>
            <TabsTrigger
              value="storage"
              className="min-w-0 flex-1 shrink-0 px-3 sm:px-4"
            >
              <span className="sm:hidden">Sto</span>
              <span className="hidden sm:inline">Storage</span>
            </TabsTrigger>
            <TabsTrigger
              value="dispatch"
              className="min-w-0 flex-1 shrink-0 px-3 sm:px-4"
            >
              <span className="sm:hidden">Dis</span>
              <span className="hidden sm:inline">Dispatch</span>
            </TabsTrigger>
            <TabsTrigger
              value="outgoing"
              className="min-w-0 flex-1 shrink-0 px-3 sm:px-4"
            >
              <span className="sm:hidden">Out</span>
              <span className="hidden sm:inline">Outgoing</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="incoming" className="mt-0 outline-none">
            <ContractTabPanel
              addButtonLabel="Add Incoming"
              addButtonTo="/store-admin/incoming"
              placeholderCount={incomingTotal}
              isRefreshing={incomingFetching}
              onRefresh={() => refetchIncoming()}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOrderOnly
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              onSortPageReset={() => setPage(1)}
              limit={limit}
              setLimitAndResetPage={setLimitAndResetPage}
              page={page}
              totalPages={incomingTotalPages}
              hasPrev={incomingHasPrev}
              hasNext={incomingHasNext}
              setPage={setPage}
              statusFilter={incomingStatusFilter}
              onStatusFilterChange={(value) => {
                setIncomingStatusFilter(value);
                setPage(1);
              }}
            >
              {incomingLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden p-0">
                      <div className="border-border bg-muted/30 px-3 py-2 sm:px-4 sm:py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="mt-1.5 h-2 w-full rounded-full" />
                      </div>
                      <div className="space-y-2 border-b px-4 py-3">
                        <div className="flex gap-4">
                          {[...Array(4)].map((__, j) => (
                            <Skeleton key={j} className="h-4 w-14" />
                          ))}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-24 rounded-lg" />
                          <Skeleton className="h-9 w-9 rounded-lg" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : incomingGatePasses.length === 0 ? (
                <Card>
                  <CardContent className="py-8 pt-6 text-center">
                    <p className="font-custom text-muted-foreground">
                      No incoming gate passes yet.
                    </p>
                    <Button className="font-custom mt-4" asChild>
                      <Link to="/store-admin/incoming">
                        Add Incoming Gate Pass
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                incomingGatePasses.map((pass) => {
                  const props = mapIncomingPassToVoucherProps(pass);
                  return (
                    <IncomingVoucher
                      key={pass._id}
                      voucher={props.voucher}
                      farmerName={props.farmerName}
                      farmerAccount={props.farmerAccount}
                      farmerAddress={props.farmerAddress}
                      farmerMobile={props.farmerMobile}
                    />
                  );
                })
              )}
            </ContractTabPanel>
          </TabsContent>
          <TabsContent value="grading" className="mt-0 outline-none">
            <ContractTabPanel
              addButtonLabel="Add Grading"
              addButtonTo="/store-admin/grading"
              placeholderCount={
                gradingPagination?.total ?? gradingGatePasses.length
              }
              isRefreshing={gradingFetching}
              onRefresh={() => refetchGrading()}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOrderOnly
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              onSortPageReset={() => setPage(1)}
              limit={limit}
              setLimitAndResetPage={setLimitAndResetPage}
              page={page}
              totalPages={gradingTotalPages}
              hasPrev={gradingHasPrev}
              hasNext={gradingHasNext}
              setPage={setPage}
            >
              {gradingLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden p-0">
                      <div className="border-border bg-muted/30 px-3 py-2 sm:px-4 sm:py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="mt-1.5 h-2 w-full rounded-full" />
                      </div>
                      <div className="space-y-2 border-b px-4 py-3">
                        <div className="flex gap-4">
                          {[...Array(4)].map((__, j) => (
                            <Skeleton key={j} className="h-4 w-14" />
                          ))}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-24 rounded-lg" />
                          <Skeleton className="h-9 w-9 rounded-lg" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : gradingGatePasses.length === 0 ? (
                <Card>
                  <CardContent className="py-8 pt-6 text-center">
                    <p className="font-custom text-muted-foreground">
                      No grading gate passes yet.
                    </p>
                    <Button className="font-custom mt-4" asChild>
                      <Link to="/store-admin/grading">
                        Add Grading Gate Pass
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                gradingGatePasses.map((pass) => {
                  const props = mapGradingPassToVoucherProps(pass);
                  return (
                    <GradingVoucher
                      key={pass._id}
                      voucher={props.voucher}
                      farmerName={props.farmerName}
                      farmerAccount={props.farmerAccount}
                      farmerStorageLinkId={props.farmerStorageLinkId}
                      incomingBagsCount={props.incomingBagsCount}
                      incomingNetKg={props.incomingNetKg}
                      incomingGatePassIds={props.incomingGatePassIds}
                    />
                  );
                })
              )}
            </ContractTabPanel>
          </TabsContent>
          <TabsContent value="storage" className="mt-0 outline-none">
            <ContractTabPanel
              addButtonLabel="Add Storage"
              addButtonTo="/store-admin/storage"
              placeholderCount={filteredAndSortedStoragePasses.length}
              isRefreshing={storageFetching}
              onRefresh={() => refetchStorage()}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
              onSortPageReset={() => setPage(1)}
              limit={limit}
              setLimitAndResetPage={setLimitAndResetPage}
              page={page}
              totalPages={totalPages}
              hasPrev={hasPrev}
              hasNext={hasNext}
              setPage={setPage}
            >
              {storageLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden p-0">
                      <div className="border-border bg-muted/30 px-3 py-2 sm:px-4 sm:py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="mt-1.5 h-2 w-full rounded-full" />
                      </div>
                      <div className="space-y-2 border-b px-4 py-3">
                        <div className="flex gap-4">
                          {[...Array(4)].map((__, j) => (
                            <Skeleton key={j} className="h-4 w-14" />
                          ))}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-24 rounded-lg" />
                          <Skeleton className="h-9 w-9 rounded-lg" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredAndSortedStoragePasses.length === 0 ? (
                <Card>
                  <CardContent className="py-8 pt-6 text-center">
                    <p className="font-custom text-muted-foreground">
                      No storage gate passes yet.
                    </p>
                    <Button className="font-custom mt-4" asChild>
                      <Link to="/store-admin/storage">
                        Add Storage Gate Pass
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredAndSortedStoragePasses.map((pass) => (
                    <StorageVoucher key={pass._id} voucher={pass} />
                  ))}
                </div>
              )}
            </ContractTabPanel>
          </TabsContent>
          <TabsContent value="dispatch" className="mt-0 outline-none">
            <ContractTabPanel
              addButtonLabel="Add Dispatch"
              addButtonTo="/store-admin/nikasi"
              placeholderCount={placeholderCount}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
              onSortPageReset={() => setPage(1)}
              limit={limit}
              setLimitAndResetPage={setLimitAndResetPage}
              page={page}
              totalPages={totalPages}
              hasPrev={hasPrev}
              hasNext={hasNext}
              setPage={setPage}
            />
          </TabsContent>
          <TabsContent value="outgoing" className="mt-0 outline-none">
            <ContractTabPanel
              addButtonLabel="Add Outgoing"
              addButtonTo="/store-admin/outgoing"
              placeholderCount={placeholderCount}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
              onSortPageReset={() => setPage(1)}
              limit={limit}
              setLimitAndResetPage={setLimitAndResetPage}
              page={page}
              totalPages={totalPages}
              hasPrev={hasPrev}
              hasNext={hasNext}
              setPage={setPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
});

export default DaybookPage;
