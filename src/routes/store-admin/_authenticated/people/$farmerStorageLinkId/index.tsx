import { useCallback, useMemo, useState } from 'react';
import { createFileRoute, Link, useRouterState } from '@tanstack/react-router';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowUpFromLine,
  Layers,
  Warehouse,
  Truck,
  ArrowDownToLine,
  Hash,
  Package,
  Edit,
  FileSpreadsheet,
  FileText,
  Clock,
} from 'lucide-react';
import type { FarmerStorageLink } from '@/types/farmer';
import type { StockLedgerRow } from '@/components/pdf/stockLedgerPdfTypes';
import type { IncomingGatePassWithLink } from '@/types/incoming-gate-pass';
import type { IncomingVoucherData } from '@/components/daybook/vouchers/types';
import type { GradingGatePass } from '@/types/grading-gate-pass';
import { ContractTabPanel } from '@/components/daybook/ContractTabPanel';
import { IncomingVoucher } from '@/components/daybook/vouchers/incoming-voucher';
import { GradingVoucher } from '@/components/daybook/vouchers/grading-voucher';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { downloadStockLedgerExcel } from '@/utils/stockLedgerExcel';
import { EditFarmerModal } from '@/components/forms/edit-farmer-modal';
import { useGetIncomingGatePassesOfSingleFarmer } from '@/services/store-admin/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import { useGetGradingPassesOfSingleFarmer } from '@/services/store-admin/grading-gate-pass/useGetGradingPassesOfSingleFarmer';
import { JUTE_BAG_WEIGHT } from '@/components/forms/grading/constants';
import { computeGradingOrderTotals } from '@/components/daybook/vouchers/grading-voucher-calculations';

export const Route = createFileRoute(
  '/store-admin/_authenticated/people/$farmerStorageLinkId/'
)({
  component: PeopleDetailPage,
});

type AggregateBags = {
  totalBagsIncoming: number;
  totalBagsUngraded: number;
  totalBagsGraded: number;
  totalBagsStored: number;
  totalBagsNikasi: number;
  totalBagsOutgoing: number;
};

const EMPTY_AGGREGATE_BAGS: AggregateBags = {
  totalBagsIncoming: 0,
  totalBagsUngraded: 0,
  totalBagsGraded: 0,
  totalBagsStored: 0,
  totalBagsNikasi: 0,
  totalBagsOutgoing: 0,
};

const EMPTY_STOCK_LEDGER_ROWS: StockLedgerRow[] = [];

/** Format date as "27th February , 2026" */
function formatLongDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
          ? 'rd'
          : 'th';
  const month = d.toLocaleDateString('en-GB', { month: 'long' });
  const year = d.getFullYear();
  return `${day}${suffix} ${month} , ${year}`;
}

/** Map API response to props for IncomingVoucher (handles populated farmerStorageLinkId) */
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

/** Map grading gate pass from API to props for GradingVoucher. Uses weightSlipDetails when present for net weight and wastage by weight. */
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

  const incomingRefs = pass.weightSlipDetails?.incomingGatePassIds?.length
    ? pass.weightSlipDetails.incomingGatePassIds
    : pass.incomingGatePassIds;
  const incomingBagsCount =
    incomingRefs?.reduce((sum, ref) => sum + (ref.bagsReceived ?? 0), 0) ?? 0;
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
    incomingBagsCount: incomingBagsCount > 0 ? incomingBagsCount : undefined,
    incomingNetKg:
      incomingNetKg != null && incomingNetKg > 0 ? incomingNetKg : undefined,
    incomingGatePassIds: incomingRefs?.length ? incomingRefs : undefined,
  };
}

function PeopleDetailPage() {
  const link = useRouterState({
    select: (state) =>
      (state.location.state as { link?: FarmerStorageLink } | undefined)?.link,
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isPdfOpening, setIsPdfOpening] = useState(false);
  const [stockLedgerDialogOpen, setStockLedgerDialogOpen] = useState(false);

  const openStockLedgerPdf = useCallback(() => {
    if (!link) return;
    const farmerName = link.farmerId.name;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(
        '<html><body style="font-family:sans-serif;padding:2rem;text-align:center;color:#666;">Generating PDF…</body></html>'
      );
    }
    setIsPdfOpening(true);
    Promise.all([
      import('@react-pdf/renderer'),
      import('@/components/pdf/StockLedgerPdf'),
    ])
      .then(([{ pdf }, { StockLedgerPdf: StockLedgerPdfComponent }]) => {
        return pdf(
          <StockLedgerPdfComponent
            farmerName={farmerName}
            rows={EMPTY_STOCK_LEDGER_ROWS}
          />
        ).toBlob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        if (win) win.location.href = url;
        else window.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      })
      .finally(() => setIsPdfOpening(false));
  }, [link]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!link) {
    return (
      <main className="mx-auto max-w-300 px-4 pt-6 pb-16 sm:px-8 sm:py-24">
        <p className="font-custom text-muted-foreground">Farmer not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-6">
      <div className="space-y-4 sm:space-y-6">
        <ContractTabContent
          link={link}
          getInitials={getInitials}
          setEditModalOpen={setEditModalOpen}
          setStockLedgerDialogOpen={setStockLedgerDialogOpen}
          stockLedgerDialogOpen={stockLedgerDialogOpen}
          isPdfOpening={isPdfOpening}
          openStockLedgerPdf={openStockLedgerPdf}
          downloadStockLedgerExcel={downloadStockLedgerExcel}
        />
      </div>

      <EditFarmerModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        link={link}
      />
    </main>
  );
}

type PersonalInfoCardProps = {
  link: FarmerStorageLink;
  getInitials: (name: string) => string;
  aggregateBags: AggregateBags;
  setEditModalOpen: (open: boolean) => void;
  setStockLedgerDialogOpen: (open: boolean) => void;
  stockLedgerDialogOpen: boolean;
  isPdfOpening: boolean;
  openStockLedgerPdf: () => void;
  downloadStockLedgerExcel: (farmerName: string) => void;
};

function PersonalInfoCard({
  link,
  getInitials,
  aggregateBags,
  setEditModalOpen,
  setStockLedgerDialogOpen,
  stockLedgerDialogOpen,
  isPdfOpening,
  openStockLedgerPdf,
  downloadStockLedgerExcel,
}: PersonalInfoCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 shadow-lg sm:h-24 sm:w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold sm:text-3xl">
                  {getInitials(link.farmerId.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h1 className="font-custom text-2xl font-bold tracking-tight sm:text-3xl">
                  {link.farmerId.name}
                </h1>
                <Badge variant="secondary" className="w-fit">
                  <Hash />
                  {link.accountNumber}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setEditModalOpen(true)}
              aria-label="Edit farmer"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="default"
              className="gap-2 rounded-xl"
              disabled={isPdfOpening}
              onClick={() => setStockLedgerDialogOpen(true)}
            >
              {isPdfOpening ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  View Stock Ledger
                </>
              )}
            </Button>
          </div>

          <Dialog
            open={stockLedgerDialogOpen}
            onOpenChange={setStockLedgerDialogOpen}
          >
            <DialogContent
              className="font-custom sm:max-w-md"
              showCloseButton={true}
            >
              <DialogHeader>
                <DialogTitle>Stock Ledger</DialogTitle>
              </DialogHeader>
              <p className="font-custom text-muted-foreground text-sm">
                Choose how you want to view or download the stock ledger.
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="default"
                  className="gap-2"
                  disabled={isPdfOpening}
                  onClick={() => {
                    setStockLedgerDialogOpen(false);
                    openStockLedgerPdf();
                  }}
                >
                  {isPdfOpening ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      View PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    if (!link) return;
                    setStockLedgerDialogOpen(false);
                    downloadStockLedgerExcel(link.farmerId.name);
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download Excel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Separator />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 dark:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <ArrowUpFromLine className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Incoming
                  </p>
                  <p className="font-custom text-xl font-bold">
                    {aggregateBags.totalBagsIncoming.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 dark:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Clock className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Ungraded
                  </p>
                  <p className="font-custom text-xl font-bold">
                    {aggregateBags.totalBagsUngraded.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 dark:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Layers className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Grading
                  </p>
                  <p className="font-custom text-xl font-bold">
                    {aggregateBags.totalBagsGraded.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 dark:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Warehouse className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Storage
                  </p>
                  <p className="font-custom text-xl font-bold">
                    {aggregateBags.totalBagsStored.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 dark:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Truck className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Dispatch
                  </p>
                  <p className="font-custom text-xl font-bold">
                    {aggregateBags.totalBagsNikasi.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 dark:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <ArrowDownToLine className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Outgoing
                  </p>
                  <p className="font-custom text-xl font-bold">
                    {aggregateBags.totalBagsOutgoing.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContractIncomingContent({ link }: { link: FarmerStorageLink }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<
    'graded' | 'ungraded' | undefined
  >(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: incomingPasses = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetIncomingGatePassesOfSingleFarmer(link._id);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = incomingPasses;
    if (q) {
      list = list.filter((pass) => {
        const gatePassNo = String(pass.gatePassNo ?? '').toLowerCase();
        const manual = String(pass.manualGatePassNumber ?? '').toLowerCase();
        return gatePassNo.includes(q) || manual.includes(q);
      });
    }
    if (statusFilter === 'graded') {
      list = list.filter((p) => p.gradingSummary?.graded === true);
    } else if (statusFilter === 'ungraded') {
      list = list.filter((p) => p.gradingSummary?.graded !== true);
    }
    const sorted = [...list].sort((a, b) => {
      const aDate = new Date(a.date ?? 0).getTime();
      const bDate = new Date(b.date ?? 0).getTime();
      const aNo = Number(a.gatePassNo ?? 0);
      const bNo = Number(b.gatePassNo ?? 0);
      if (sortOrder === 'asc') {
        return aDate !== bDate ? aDate - bDate : aNo - bNo;
      }
      return aDate !== bDate ? bDate - aDate : bNo - aNo;
    });
    return sorted;
  }, [incomingPasses, searchQuery, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / limit));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const paginated = useMemo(
    () => filteredAndSorted.slice((page - 1) * limit, page * limit),
    [filteredAndSorted, page, limit]
  );

  const setLimitAndResetPage = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return (
    <ContractTabPanel
      addButtonLabel="Add Incoming"
      addButtonTo="/store-admin/incoming"
      placeholderCount={filteredAndSorted.length}
      isRefreshing={isFetching}
      onRefresh={() => refetch()}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      sortOrderOnly
      sortOrder={sortOrder}
      onSortOrderChange={setSortOrder}
      onSortPageReset={() => setPage(1)}
      limit={limit}
      setLimitAndResetPage={setLimitAndResetPage}
      page={page}
      totalPages={totalPages}
      hasPrev={hasPrev}
      hasNext={hasNext}
      setPage={setPage}
      statusFilter={statusFilter}
      onStatusFilterChange={(value) => {
        setStatusFilter(value);
        setPage(1);
      }}
    >
      {isLoading ? (
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
      ) : paginated.length === 0 ? (
        <Card>
          <CardContent className="py-8 pt-6 text-center">
            <p className="font-custom text-muted-foreground">
              No incoming gate passes yet.
            </p>
            <Button className="font-custom mt-4" asChild>
              <Link to="/store-admin/incoming">Add Incoming Gate Pass</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {paginated.map((pass) => {
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
          })}
        </div>
      )}
    </ContractTabPanel>
  );
}

function ContractGradingContent({ link }: { link: FarmerStorageLink }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: gradingPasses = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetGradingPassesOfSingleFarmer(link._id);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = gradingPasses;
    if (q) {
      list = list.filter((pass) => {
        const gatePassNo = String(pass.gatePassNo ?? '').toLowerCase();
        const manual = String(pass.manualGatePassNumber ?? '').toLowerCase();
        return gatePassNo.includes(q) || manual.includes(q);
      });
    }
    const sorted = [...list].sort((a, b) => {
      const aDate = new Date(a.date ?? 0).getTime();
      const bDate = new Date(b.date ?? 0).getTime();
      const aNo = Number(a.gatePassNo ?? 0);
      const bNo = Number(b.gatePassNo ?? 0);
      if (sortOrder === 'asc') {
        return aDate !== bDate ? aDate - bDate : aNo - bNo;
      }
      return aDate !== bDate ? bDate - aDate : bNo - aNo;
    });
    return sorted;
  }, [gradingPasses, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / limit));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const paginated = useMemo(
    () => filteredAndSorted.slice((page - 1) * limit, page * limit),
    [filteredAndSorted, page, limit]
  );

  const setLimitAndResetPage = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return (
    <ContractTabPanel
      addButtonLabel="Add Grading"
      addButtonTo="/store-admin/grading"
      placeholderCount={filteredAndSorted.length}
      isRefreshing={isFetching}
      onRefresh={() => refetch()}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      sortOrderOnly
      sortOrder={sortOrder}
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
      {isLoading ? (
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
      ) : paginated.length === 0 ? (
        <Card>
          <CardContent className="py-8 pt-6 text-center">
            <p className="font-custom text-muted-foreground">
              No grading gate passes yet.
            </p>
            <Button className="font-custom mt-4" asChild>
              <Link to="/store-admin/grading">Add Grading Gate Pass</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {paginated.map((pass) => {
            const props = mapGradingPassToVoucherProps(pass);
            return (
              <GradingVoucher
                key={pass._id}
                voucher={props.voucher}
                farmerName={props.farmerName}
                farmerAccount={props.farmerAccount}
                incomingBagsCount={props.incomingBagsCount}
                incomingNetKg={props.incomingNetKg}
                incomingGatePassIds={props.incomingGatePassIds}
              />
            );
          })}
        </div>
      )}
    </ContractTabPanel>
  );
}

function ContractTabContent({
  link,
  getInitials,
  setEditModalOpen,
  setStockLedgerDialogOpen,
  stockLedgerDialogOpen,
  isPdfOpening,
  openStockLedgerPdf,
  downloadStockLedgerExcel,
}: Omit<PersonalInfoCardProps, 'aggregateBags'>) {
  const { data: incomingPasses = [] } = useGetIncomingGatePassesOfSingleFarmer(
    link._id
  );
  const { data: gradingPasses = [] } = useGetGradingPassesOfSingleFarmer(
    link._id
  );

  const aggregateBags = useMemo(
    (): AggregateBags => ({
      ...EMPTY_AGGREGATE_BAGS,
      totalBagsIncoming: incomingPasses.reduce(
        (sum, p) => sum + (p.bagsReceived ?? 0),
        0
      ),
      totalBagsUngraded: incomingPasses
        .filter((p) => p.gradingSummary?.graded !== true)
        .reduce((sum, p) => sum + (p.bagsReceived ?? 0), 0),
      totalBagsGraded: gradingPasses.reduce((sum, pass) => {
        const passInitial = (pass.orderDetails ?? []).reduce(
          (s, od) => s + (od.initialQuantity ?? 0),
          0
        );
        return sum + passInitial;
      }, 0),
    }),
    [incomingPasses, gradingPasses]
  );

  /** Format wastage to 2 decimal places */
  const formatWastage = (value: number) =>
    value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /** Row: one or more incoming passes (clubbed if they share a grading pass) + that grading pass's details */
  type IncomingGradingRow = {
    id: string;
    incomingPasses: IncomingGatePassWithLink[];
    gradingPass: GradingGatePass | null;
    /** Total bags received for clubbed incomings */
    bagsReceived: number;
    /** From grading orderDetails (sum initialQuantity); undefined if no grading */
    totalGradedBags: number | undefined;
    /** Wastage bags (incoming bags - graded bags); undefined if no grading */
    wastageBags: number | undefined;
    /** Wastage % of incoming bags; undefined if no grading */
    wastagePercent: number | undefined;
    /** Incoming net weight (kg) from weight slip details; undefined if no weight data */
    incomingNetKg: number | undefined;
    /** Bardana weight (kg) = bagsReceived × JUTE_BAG_WEIGHT (0.7 kg); undefined if no weight row */
    bardanaKg: number | undefined;
    /** Incoming net product (kg) = incomingNetKg − bardanaKg; used for wastage calc (matches grading-voucher) */
    incomingNetProductKg: number | undefined;
    /** Grading bardana (kg) = bag weight deducted by type (JUTE 0.7 kg, LENO 0.06 kg per bag); undefined if no grading */
    gradingBardanaKg: number | undefined;
    /** Total graded weight (kg) from order details after bag deduction; undefined if no grading */
    totalGradedWeightKg: number | undefined;
    /** Wastage by weight (kg) = incomingNetProductKg − totalGradedWeightKg; undefined if no weight data */
    wastageKg: number | undefined;
    /** Wastage % of incoming net product; undefined if no weight data */
    wastagePercentByWeight: number | undefined;
  };

  const incomingTableRows = useMemo((): IncomingGradingRow[] => {
    const incomingById = new Map(incomingPasses.map((p) => [p._id, p]));
    const incomingUsed = new Set<string>();
    const rows: IncomingGradingRow[] = [];

    for (const gp of gradingPasses) {
      const refs = gp.incomingGatePassIds ?? [];
      const groupIncoming: IncomingGatePassWithLink[] = [];
      for (const ref of refs) {
        const inc = incomingById.get(ref._id);
        if (inc) {
          groupIncoming.push(inc);
          incomingUsed.add(inc._id);
        }
      }
      if (groupIncoming.length === 0) continue;

      const bagsReceived = groupIncoming.reduce(
        (s, p) => s + (p.bagsReceived ?? 0),
        0
      );
      const totalGradedBags = (gp.orderDetails ?? []).reduce(
        (s, od) => s + (od.initialQuantity ?? 0),
        0
      );
      const wastageBags = bagsReceived - totalGradedBags;
      const wastagePercent =
        bagsReceived > 0 ? (wastageBags / bagsReceived) * 100 : undefined;

      const { totalGradedWeightKg, totalBagWeightDeductionKg } =
        computeGradingOrderTotals(gp.orderDetails ?? []);
      const incomingRefsWithWeight =
        gp.weightSlipDetails?.incomingGatePassIds ??
        gp.incomingGatePassIds ??
        [];
      const incomingNetKg = incomingRefsWithWeight.reduce((sum, ref) => {
        const ws = ref.weightSlip;
        if (ws?.grossWeightKg != null && ws?.tareWeightKg != null) {
          return sum + (ws.grossWeightKg - ws.tareWeightKg);
        }
        return sum;
      }, 0);
      const hasIncomingNet = incomingNetKg != null && incomingNetKg > 0;
      const bardanaKg = bagsReceived * JUTE_BAG_WEIGHT;
      const incomingNetProductKg = hasIncomingNet
        ? incomingNetKg - bardanaKg
        : undefined;
      const hasNetProduct =
        incomingNetProductKg != null && incomingNetProductKg > 0;
      const wastageKg =
        hasNetProduct && totalGradedWeightKg != null
          ? Math.max(0, incomingNetProductKg - totalGradedWeightKg)
          : undefined;
      const wastagePercentByWeight =
        hasNetProduct && wastageKg != null
          ? (wastageKg / incomingNetProductKg) * 100
          : undefined;

      rows.push({
        id: gp._id,
        incomingPasses: groupIncoming,
        gradingPass: gp,
        bagsReceived,
        totalGradedBags,
        wastageBags,
        wastagePercent,
        incomingNetKg:
          incomingNetKg != null && incomingNetKg > 0
            ? incomingNetKg
            : undefined,
        bardanaKg: hasIncomingNet ? bardanaKg : undefined,
        incomingNetProductKg:
          incomingNetProductKg != null && incomingNetProductKg > 0
            ? incomingNetProductKg
            : undefined,
        gradingBardanaKg:
          totalBagWeightDeductionKg != null && totalBagWeightDeductionKg > 0
            ? totalBagWeightDeductionKg
            : undefined,
        totalGradedWeightKg:
          totalGradedWeightKg != null && totalGradedWeightKg > 0
            ? totalGradedWeightKg
            : undefined,
        wastageKg,
        wastagePercentByWeight,
      });
    }

    for (const inc of incomingPasses) {
      if (incomingUsed.has(inc._id)) continue;
      rows.push({
        id: `ungraded-${inc._id}`,
        incomingPasses: [inc],
        gradingPass: null,
        bagsReceived: inc.bagsReceived ?? 0,
        totalGradedBags: undefined,
        wastageBags: undefined,
        wastagePercent: undefined,
        incomingNetKg: undefined,
        bardanaKg: undefined,
        incomingNetProductKg: undefined,
        gradingBardanaKg: undefined,
        totalGradedWeightKg: undefined,
        wastageKg: undefined,
        wastagePercentByWeight: undefined,
      });
    }

    return rows.sort((a, b) => {
      const aDate = new Date(a.incomingPasses[0]?.date ?? 0).getTime();
      const bDate = new Date(b.incomingPasses[0]?.date ?? 0).getTime();
      return bDate - aDate;
    });
  }, [incomingPasses, gradingPasses]);

  const incomingTableColumns = useMemo<ColumnDef<IncomingGradingRow>[]>(
    () => [
      {
        accessorFn: (row) =>
          row.incomingPasses.map((p) => p.gatePassNo).join(', '),
        id: 'gatePassNo',
        header: () => (
          <span className="font-custom font-bold">Gate pass number</span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium tabular-nums">
            {row.original.incomingPasses
              .map((p) => `#${p.gatePassNo ?? '—'}`)
              .join(', ')}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.incomingPasses[0]?.date,
        id: 'date',
        header: () => <span className="font-custom font-bold">Date</span>,
        cell: ({ row }) => (
          <span className="font-custom font-medium">
            {row.original.incomingPasses
              .map((p) => formatLongDate(p.date))
              .join(', ')}
          </span>
        ),
      },
      {
        accessorKey: 'bagsReceived',
        header: () => (
          <span className="font-custom font-bold">Bags received</span>
        ),
        cell: ({ getValue }) => (
          <span className="font-custom font-medium tabular-nums">
            {((getValue() as number) ?? 0).toLocaleString('en-IN')}
          </span>
        ),
      },
      {
        accessorKey: 'incomingNetKg',
        header: () => (
          <span className="font-custom font-bold">Incoming net (kg)</span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium tabular-nums">
            {row.original.incomingNetKg != null
              ? formatWastage(row.original.incomingNetKg)
              : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'bardanaKg',
        header: () => (
          <span className="font-custom font-bold">Bardana (kg)</span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium tabular-nums">
            {row.original.bardanaKg != null
              ? formatWastage(row.original.bardanaKg)
              : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'incomingNetProductKg',
        header: () => (
          <span className="font-custom font-bold">Net product (kg)</span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium tabular-nums">
            {row.original.incomingNetProductKg != null
              ? formatWastage(row.original.incomingNetProductKg)
              : '—'}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.gradingPass?.gatePassNo,
        id: 'gradingGatePassNo',
        header: () => (
          <span className="font-custom font-bold">Grading gate pass no.</span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium tabular-nums">
            {row.original.gradingPass != null
              ? `#${row.original.gradingPass.gatePassNo ?? '—'}`
              : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'totalGradedBags',
        header: () => (
          <span className="font-custom font-bold">Total graded bags</span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium tabular-nums">
            {row.original.totalGradedBags != null
              ? row.original.totalGradedBags.toLocaleString('en-IN')
              : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'gradingBardanaKg',
        header: () => (
          <span className="font-custom font-bold">Grading bardana (kg)</span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium tabular-nums">
            {row.original.gradingBardanaKg != null
              ? formatWastage(row.original.gradingBardanaKg)
              : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'totalGradedWeightKg',
        header: () => (
          <span className="font-custom font-bold">
            Total graded weight (kg)
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium tabular-nums">
            {row.original.totalGradedWeightKg != null
              ? formatWastage(row.original.totalGradedWeightKg)
              : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'wastageKg',
        header: () => (
          <span className="font-custom font-bold">Wastage (kg)</span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium text-red-500 tabular-nums">
            {row.original.wastageKg != null
              ? formatWastage(row.original.wastageKg)
              : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'wastagePercentByWeight',
        header: () => (
          <span className="font-custom font-bold">Wastage (%)</span>
        ),
        cell: ({ row }) => (
          <span className="font-custom font-medium text-red-500 tabular-nums">
            {row.original.wastagePercentByWeight != null
              ? `${formatWastage(row.original.wastagePercentByWeight)}%`
              : '—'}
          </span>
        ),
      },
    ],
    []
  );

  const incomingTable = useReactTable({
    data: incomingTableRows,
    columns: incomingTableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableMetrics = useMemo(() => {
    const totalIncomingBags = incomingTableRows.reduce(
      (s, r) => s + r.bagsReceived,
      0
    );
    const gradedRows = incomingTableRows.filter(
      (r) => r.totalGradedBags != null && r.gradingPass != null
    );
    const totalGradedBags = gradedRows.reduce(
      (s, r) => s + (r.totalGradedBags ?? 0),
      0
    );
    const totalIncomingForGraded = gradedRows.reduce(
      (s, r) => s + r.bagsReceived,
      0
    );
    const conversionPercentBags =
      totalIncomingForGraded > 0
        ? (totalGradedBags / totalIncomingForGraded) * 100
        : null;
    const incomingPassCount = incomingTableRows.reduce(
      (s, r) => s + r.incomingPasses.length,
      0
    );
    const gradingPassCount = incomingTableRows.filter(
      (r) => r.gradingPass != null
    ).length;

    const rowsWithWeight = gradedRows.filter(
      (r) => r.incomingNetProductKg != null && r.incomingNetProductKg > 0
    );
    const totalIncomingNetKg = rowsWithWeight.reduce(
      (s, r) => s + (r.incomingNetKg ?? 0),
      0
    );
    const totalBardanaKg = rowsWithWeight.reduce(
      (s, r) => s + (r.bardanaKg ?? 0),
      0
    );
    const totalIncomingNetProductKg = rowsWithWeight.reduce(
      (s, r) => s + (r.incomingNetProductKg ?? 0),
      0
    );
    const totalGradedWeightKg = rowsWithWeight.reduce(
      (s, r) => s + (r.totalGradedWeightKg ?? 0),
      0
    );
    const totalGradingBardanaKg = gradedRows.reduce(
      (s, r) => s + (r.gradingBardanaKg ?? 0),
      0
    );
    const totalWastageKg = rowsWithWeight.reduce(
      (s, r) => s + (r.wastageKg ?? 0),
      0
    );
    const overallWastagePercentByWeight =
      totalIncomingNetProductKg > 0
        ? (totalWastageKg / totalIncomingNetProductKg) * 100
        : null;
    const avgWastagePercentByWeight =
      rowsWithWeight.length > 0
        ? rowsWithWeight.reduce(
            (s, r) => s + (r.wastagePercentByWeight ?? 0),
            0
          ) / rowsWithWeight.length
        : null;
    const conversionPercentByWeight =
      totalIncomingNetProductKg > 0
        ? (totalGradedWeightKg / totalIncomingNetProductKg) * 100
        : null;

    return {
      totalIncomingBags,
      totalGradedBags,
      conversionPercentBags,
      incomingPassCount,
      gradingPassCount,
      totalIncomingNetKg,
      totalBardanaKg,
      totalIncomingNetProductKg,
      totalGradingBardanaKg,
      totalGradedWeightKg,
      totalWastageKg,
      overallWastagePercentByWeight,
      avgWastagePercentByWeight,
      conversionPercentByWeight,
    };
  }, [incomingTableRows]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PersonalInfoCard
        link={link}
        getInitials={getInitials}
        aggregateBags={aggregateBags}
        setEditModalOpen={setEditModalOpen}
        setStockLedgerDialogOpen={setStockLedgerDialogOpen}
        stockLedgerDialogOpen={stockLedgerDialogOpen}
        isPdfOpening={isPdfOpening}
        openStockLedgerPdf={openStockLedgerPdf}
        downloadStockLedgerExcel={downloadStockLedgerExcel}
      />

      <Card className="border-border rounded-xl shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
          <div>
            <h2 className="font-custom text-xl font-bold tracking-tight sm:text-2xl">
              Incoming & grading
            </h2>
            <p className="font-custom text-muted-foreground mt-1 text-sm">
              Incoming gate passes and their respective grading gate pass
              details.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Incoming passes
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.incomingPassCount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Grading passes
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.gradingPassCount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Total incoming bags
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.totalIncomingBags.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Incoming net (kg)
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.totalIncomingNetKg != null &&
                tableMetrics.totalIncomingNetKg > 0
                  ? tableMetrics.totalIncomingNetKg.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '—'}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Bardana (kg)
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.totalBardanaKg != null &&
                tableMetrics.totalBardanaKg > 0
                  ? tableMetrics.totalBardanaKg.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '—'}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Net product (kg)
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.totalIncomingNetProductKg != null &&
                tableMetrics.totalIncomingNetProductKg > 0
                  ? tableMetrics.totalIncomingNetProductKg.toLocaleString(
                      'en-IN',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : '—'}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Total graded bags
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.totalGradedBags.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Grading bardana (kg)
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.totalGradingBardanaKg != null &&
                tableMetrics.totalGradingBardanaKg > 0
                  ? tableMetrics.totalGradingBardanaKg.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '—'}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Total graded weight (kg)
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.totalGradedWeightKg != null &&
                tableMetrics.totalGradedWeightKg > 0
                  ? tableMetrics.totalGradedWeightKg.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '—'}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Conversion rate
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold tabular-nums">
                {tableMetrics.conversionPercentByWeight != null
                  ? `${tableMetrics.conversionPercentByWeight.toLocaleString(
                      'en-IN',
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}%`
                  : tableMetrics.conversionPercentBags != null
                    ? `${tableMetrics.conversionPercentBags.toLocaleString(
                        'en-IN',
                        {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        }
                      )}% (bags)`
                    : '—'}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Total wastage (kg)
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold text-red-500 tabular-nums">
                {tableMetrics.totalWastageKg != null &&
                tableMetrics.totalWastageKg > 0
                  ? tableMetrics.totalWastageKg.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '—'}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Avg wastage %
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold text-red-500 tabular-nums">
                {tableMetrics.avgWastagePercentByWeight != null
                  ? `${tableMetrics.avgWastagePercentByWeight.toLocaleString(
                      'en-IN',
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}%`
                  : '—'}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground font-custom text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Overall wastage %
              </p>
              <p className="font-custom mt-0.5 text-lg font-semibold text-red-500 tabular-nums">
                {tableMetrics.overallWastagePercentByWeight != null
                  ? `${tableMetrics.overallWastagePercentByWeight.toLocaleString(
                      'en-IN',
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}%`
                  : '—'}
              </p>
            </div>
          </div>

          <div className="border-border overflow-x-auto rounded-lg border">
            <Table className="border-collapse">
              <TableHeader>
                {incomingTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-border bg-muted hover:bg-muted"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-custom border-border border px-4 py-2 font-bold"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {incomingTable.getRowModel().rows?.length ? (
                  incomingTable.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.original.id}
                      className="border-border hover:bg-transparent"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="font-custom border-border border px-4 py-2"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell
                      colSpan={incomingTableColumns.length}
                      className="font-custom text-muted-foreground border-border h-24 border px-4 py-2 text-center"
                    >
                      No incoming gate passes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {incomingTableRows.length > 0 && (
                <TableFooter>
                  <TableRow className="border-border bg-muted/50 hover:bg-muted/50 font-semibold">
                    <TableHead className="font-custom border-border border px-4 py-2">
                      Total
                    </TableHead>
                    <TableCell className="font-custom border-border border px-4 py-2">
                      —
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 tabular-nums">
                      {tableMetrics.totalIncomingBags.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 tabular-nums">
                      {tableMetrics.totalIncomingNetKg != null &&
                      tableMetrics.totalIncomingNetKg > 0
                        ? tableMetrics.totalIncomingNetKg.toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : '—'}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 tabular-nums">
                      {tableMetrics.totalBardanaKg != null &&
                      tableMetrics.totalBardanaKg > 0
                        ? tableMetrics.totalBardanaKg.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 tabular-nums">
                      {tableMetrics.totalIncomingNetProductKg != null &&
                      tableMetrics.totalIncomingNetProductKg > 0
                        ? tableMetrics.totalIncomingNetProductKg.toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : '—'}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2">
                      —
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 tabular-nums">
                      {tableMetrics.totalGradedBags.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 tabular-nums">
                      {tableMetrics.totalGradingBardanaKg != null &&
                      tableMetrics.totalGradingBardanaKg > 0
                        ? tableMetrics.totalGradingBardanaKg.toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : '—'}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 tabular-nums">
                      {tableMetrics.totalGradedWeightKg != null &&
                      tableMetrics.totalGradedWeightKg > 0
                        ? tableMetrics.totalGradedWeightKg.toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : '—'}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 text-red-500 tabular-nums">
                      {tableMetrics.totalWastageKg != null &&
                      tableMetrics.totalWastageKg > 0
                        ? tableMetrics.totalWastageKg.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 text-red-500 tabular-nums">
                      {tableMetrics.overallWastagePercentByWeight != null
                        ? `${tableMetrics.overallWastagePercentByWeight.toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}%`
                        : '—'}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="font-custom bg-muted flex h-10 w-full flex-nowrap overflow-x-auto rounded-xl p-1 sm:max-w-none">
          <TabsTrigger
            value="incoming"
            className="min-w-0 flex-1 shrink-0 rounded-lg px-3 sm:px-4"
          >
            Incoming
          </TabsTrigger>
          <TabsTrigger
            value="grading"
            className="min-w-0 flex-1 shrink-0 rounded-lg px-3 sm:px-4"
          >
            Grading
          </TabsTrigger>
          <TabsTrigger
            value="storage"
            className="min-w-0 flex-1 shrink-0 rounded-lg px-3 sm:px-4"
          >
            Storage
          </TabsTrigger>
          <TabsTrigger
            value="dispatch"
            className="min-w-0 flex-1 shrink-0 rounded-lg px-3 sm:px-4"
          >
            Dispatch
          </TabsTrigger>
          <TabsTrigger
            value="outgoing"
            className="min-w-0 flex-1 shrink-0 rounded-lg px-3 sm:px-4"
          >
            Outgoing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="incoming" className="mt-4 outline-none">
          <ContractIncomingContent link={link} />
        </TabsContent>
        <TabsContent value="grading" className="mt-4 outline-none">
          <ContractGradingContent link={link} />
        </TabsContent>
        <TabsContent value="storage" className="mt-4 outline-none">
          <Card>
            <CardContent className="py-8 pt-6 text-center">
              <p className="font-custom text-muted-foreground">
                No storage gate passes yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dispatch" className="mt-4 outline-none">
          <Card>
            <CardContent className="py-8 pt-6 text-center">
              <p className="font-custom text-muted-foreground">
                No dispatch gate passes yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="outgoing" className="mt-4 outline-none">
          <Card>
            <CardContent className="py-8 pt-6 text-center">
              <p className="font-custom text-muted-foreground">
                No outgoing gate passes yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
