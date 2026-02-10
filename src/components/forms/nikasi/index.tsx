import { Fragment, memo, useMemo, useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DatePicker } from '@/components/forms/date-picker';
import { SearchSelector } from '@/components/forms/search-selector';
import { useGetReceiptVoucherNumber } from '@/services/store-admin/functions/useGetVoucherNumber';
import { useGetGradingGatePasses } from '@/services/store-admin/grading-gate-pass/useGetGradingGatePasses';
import { useCreateBulkNikasiGatePasses } from '@/services/store-admin/nikasi-gate-pass/useCreateBulkNikasiGatePasses';
import { toast } from 'sonner';
import {
  formatDate,
  formatDateToISO,
  parseDateToTimestamp,
} from '@/lib/helpers';
import type { GradingGatePass } from '@/types/grading-gate-pass';
import type { CreateNikasiGatePassGradingEntry } from '@/types/nikasi-gate-pass';
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Columns,
  Trash2,
} from 'lucide-react';
import { QuantityRemoveDialog } from '@/components/forms/storage/quantity-remove-dialog';
import { GradingGatePassCell } from '@/components/forms/storage/grading-gate-pass-cell';
import {
  NikasiSummarySheet,
  type NikasiSummaryGradingEntry,
  type NikasiSummaryFormValues,
} from './summary-sheet';

/** Collect unique sizes from all grading passes, sorted */
function getUniqueSizes(passes: GradingGatePass[]): string[] {
  const set = new Set<string>();
  for (const pass of passes) {
    for (const detail of pass.orderDetails ?? []) {
      if (detail.size) set.add(detail.size);
    }
  }
  return Array.from(set).sort();
}

/** Collect unique varieties from all grading passes, sorted */
function getUniqueVarieties(passes: GradingGatePass[]): string[] {
  const set = new Set<string>();
  for (const pass of passes) {
    if (pass.variety?.trim()) set.add(pass.variety.trim());
  }
  return Array.from(set).sort();
}

/** Get order detail for a given size from a grading pass */
function getOrderDetailForSize(
  pass: GradingGatePass,
  size: string
): { currentQuantity: number; initialQuantity: number } | null {
  const detail = pass.orderDetails?.find((d) => d.size === size);
  if (!detail) return null;
  return {
    currentQuantity: detail.currentQuantity ?? 0,
    initialQuantity: detail.initialQuantity ?? 0,
  };
}

/** Get farmer storage link ID from a pass (string) */
function getFarmerStorageLinkId(pass: GradingGatePass): string {
  if (typeof pass.farmerStorageLinkId === 'string')
    return pass.farmerStorageLinkId;
  const nested = pass.incomingGatePassId?.farmerStorageLinkId;
  if (nested && typeof nested === 'object' && '_id' in nested)
    return (nested as { _id: string })._id;
  return pass._id;
}

/** Get farmer name from a pass (when incoming ref is populated) */
function getFarmerName(pass: GradingGatePass): string {
  const nested = pass.incomingGatePassId?.farmerStorageLinkId;
  if (nested && typeof nested === 'object' && 'farmerId' in nested) {
    const farmer = (nested as { farmerId?: { name?: string } }).farmerId;
    if (farmer?.name) return farmer.name;
  }
  return 'Unknown farmer';
}

export interface GroupedByFarmer {
  farmerStorageLinkId: string;
  farmerName: string;
  passes: GradingGatePass[];
}

/** Group passes by farmer and sort within each group by date (asc = oldest first, desc = newest first) */
function groupPassesByFarmer(
  passes: GradingGatePass[],
  dateSort: 'asc' | 'desc'
): GroupedByFarmer[] {
  const byLink = Object.groupBy(passes, (pass) =>
    getFarmerStorageLinkId(pass)
  ) as Partial<Record<string, GradingGatePass[]>>;
  const groups: GroupedByFarmer[] = Object.entries(byLink).map(
    ([linkId, passList]) => {
      const list = passList ?? [];
      const farmerName = list[0] ? getFarmerName(list[0]) : 'Unknown farmer';
      const sorted = [...list].sort((a, b) => {
        const ta = parseDateToTimestamp(a.date);
        const tb = parseDateToTimestamp(b.date);
        if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
        return dateSort === 'asc' ? ta - tb : tb - ta;
      });
      return { farmerStorageLinkId: linkId, farmerName, passes: sorted };
    }
  );
  groups.sort((a, b) => {
    const dateA = a.passes[0] ? parseDateToTimestamp(a.passes[0].date) : 0;
    const dateB = b.passes[0] ? parseDateToTimestamp(b.passes[0].date) : 0;
    if (Number.isNaN(dateA) || Number.isNaN(dateB)) return 0;
    return dateSort === 'asc' ? dateA - dateB : dateB - dateA;
  });
  return groups;
}

type RemovedQuantities = Record<string, Record<string, number>>;

/** State for one nikasi pass in the bulk form */
export interface NikasiPassState {
  id: string;
  from: string;
  toField: string;
  date: string;
  remarks: string;
  removedQuantities: RemovedQuantities;
}

function createDefaultPass(id: string): NikasiPassState {
  return {
    id,
    from: '',
    toField: '',
    date: formatDate(new Date()),
    remarks: '',
    removedQuantities: {},
  };
}

export interface NikasiGatePassFormProps {
  farmerStorageLinkId: string;
  /** Ignored – all grading gate passes are shown. Kept for route/search compatibility. */
  gradingPassId?: string;
}

const NikasiGatePassForm = memo(function NikasiGatePassForm({
  farmerStorageLinkId,
}: NikasiGatePassFormProps) {
  const { data: voucherNumber, isLoading: isLoadingVoucher } =
    useGetReceiptVoucherNumber('nikasi-gate-pass');
  const { data: allGradingPasses = [], isLoading: isLoadingPasses } =
    useGetGradingGatePasses();

  const navigate = useNavigate();
  const { mutate: createBulkNikasiGatePasses, isPending } =
    useCreateBulkNikasiGatePasses();

  const varieties = useMemo(
    () => getUniqueVarieties(allGradingPasses),
    [allGradingPasses]
  );

  const [varietyFilter, setVarietyFilter] = useState<string>('');
  const [dateFilterFrom, setDateFilterFrom] = useState<string>('');
  const [dateFilterTo, setDateFilterTo] = useState<string>('');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('asc');
  const [isSummarySheetOpen, setIsSummarySheetOpen] = useState(false);

  const filteredAndSortedPasses = useMemo(() => {
    let list = allGradingPasses;
    if (varietyFilter) {
      list = list.filter((p) => p.variety?.trim() === varietyFilter);
    }
    const fromTs = dateFilterFrom ? parseDateToTimestamp(dateFilterFrom) : null;
    const toTs = dateFilterTo ? parseDateToTimestamp(dateFilterTo) : null;
    if (fromTs != null && !Number.isNaN(fromTs)) {
      list = list.filter((p) => parseDateToTimestamp(p.date) >= fromTs);
    }
    if (toTs != null && !Number.isNaN(toTs)) {
      list = list.filter((p) => parseDateToTimestamp(p.date) <= toTs);
    }
    return [...list].sort((a, b) => {
      const ta = parseDateToTimestamp(a.date);
      const tb = parseDateToTimestamp(b.date);
      if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
      return dateSort === 'asc' ? ta - tb : tb - ta;
    });
  }, [allGradingPasses, varietyFilter, dateFilterFrom, dateFilterTo, dateSort]);

  const groupedByFarmer = useMemo(
    () => groupPassesByFarmer(filteredAndSortedPasses, dateSort),
    [filteredAndSortedPasses, dateSort]
  );

  const [passes, setPasses] = useState<NikasiPassState[]>(() => [
    createDefaultPass(`pass-${Date.now()}`),
  ]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(
    () => new Set()
  );
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set()
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogNikasiPassId, setDialogNikasiPassId] = useState<string | null>(
    null
  );
  const [dialogPassId, setDialogPassId] = useState<string | null>(null);
  const [dialogSize, setDialogSize] = useState<string | null>(null);
  const [quantityInput, setQuantityInput] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [dialogMaxQuantity, setDialogMaxQuantity] = useState(0);

  const tableSizes = useMemo(
    () => getUniqueSizes(filteredAndSortedPasses),
    [filteredAndSortedPasses]
  );

  const visibleSizes = useMemo(() => {
    if (visibleColumns.size === 0 && tableSizes.length > 0) return tableSizes;
    return tableSizes.filter((s) => visibleColumns.has(s));
  }, [tableSizes, visibleColumns]);

  const updatePass = useCallback(
    (passId: string, patch: Partial<Omit<NikasiPassState, 'id'>>) => {
      setPasses((prev) =>
        prev.map((p) => (p.id === passId ? { ...p, ...patch } : p))
      );
    },
    []
  );

  const removePass = useCallback((passId: string) => {
    setPasses((prev) =>
      prev.length > 1 ? prev.filter((p) => p.id !== passId) : prev
    );
  }, []);

  const setRemoved = useCallback(
    (
      nikasiPassId: string,
      gradingPassId: string,
      size: string,
      quantity: number
    ) => {
      setPasses((prev) =>
        prev.map((p) => {
          if (p.id !== nikasiPassId) return p;
          const next = { ...p.removedQuantities };
          const passEntry = { ...(next[gradingPassId] ?? {}) };
          if (quantity <= 0) {
            delete passEntry[size];
          } else {
            passEntry[size] = quantity;
          }
          if (Object.keys(passEntry).length === 0) delete next[gradingPassId];
          else next[gradingPassId] = passEntry;
          return { ...p, removedQuantities: next };
        })
      );
    },
    []
  );

  const openDialog = useCallback(
    (nikasiPassId: string, gradingPass: GradingGatePass, size: string) => {
      const detail = getOrderDetailForSize(gradingPass, size);
      if (!detail || detail.currentQuantity <= 0) return;
      const pass = passes.find((p) => p.id === nikasiPassId);
      const existing = pass?.removedQuantities[gradingPass._id]?.[size] ?? 0;
      setDialogNikasiPassId(nikasiPassId);
      setDialogPassId(gradingPass._id);
      setDialogSize(size);
      setQuantityInput(existing > 0 ? String(existing) : '');
      setQuantityError('');
      setDialogMaxQuantity(detail.currentQuantity);
      setDialogOpen(true);
    },
    [passes]
  );

  const validateQuantity = useCallback(
    (input: string): string => {
      if (!input.trim()) return 'Quantity is required';
      const parsed = parseFloat(input);
      if (Number.isNaN(parsed)) return 'Enter a valid number';
      if (parsed < 0) return 'Quantity cannot be negative';
      if (parsed > dialogMaxQuantity)
        return `Quantity cannot exceed ${dialogMaxQuantity.toFixed(1)}`;
      return '';
    },
    [dialogMaxQuantity]
  );

  const handleQuantityInputChange = useCallback(
    (value: string) => {
      setQuantityInput(value);
      setQuantityError(validateQuantity(value));
    },
    [validateQuantity]
  );

  const handleQuantitySubmit = useCallback(() => {
    const err = validateQuantity(quantityInput);
    if (err) {
      setQuantityError(err);
      return;
    }
    const qty = parseFloat(quantityInput);
    if (dialogNikasiPassId && dialogPassId && dialogSize)
      setRemoved(dialogNikasiPassId, dialogPassId, dialogSize, qty);
    setDialogOpen(false);
    setDialogNikasiPassId(null);
    setDialogPassId(null);
    setDialogSize(null);
  }, [
    quantityInput,
    dialogNikasiPassId,
    dialogPassId,
    dialogSize,
    setRemoved,
    validateQuantity,
  ]);

  const handleQuantityRemove = useCallback(() => {
    if (dialogNikasiPassId && dialogPassId && dialogSize)
      setRemoved(dialogNikasiPassId, dialogPassId, dialogSize, 0);
    setDialogOpen(false);
    setDialogNikasiPassId(null);
    setDialogPassId(null);
    setDialogSize(null);
  }, [dialogNikasiPassId, dialogPassId, dialogSize, setRemoved]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setDialogNikasiPassId(null);
    setDialogPassId(null);
    setDialogSize(null);
  }, []);

  const handleColumnToggle = useCallback((size: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }, []);

  const handleOrderToggle = useCallback((passId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(passId)) next.delete(passId);
      else next.add(passId);
      return next;
    });
  }, []);

  const hasAnyQuantity = useMemo(
    () =>
      passes.some((p) =>
        Object.values(p.removedQuantities).some((sizes) =>
          Object.values(sizes).some((q) => q > 0)
        )
      ),
    [passes]
  );

  const handleNext = useCallback(() => {
    if (!hasAnyQuantity) return;
    setIsSummarySheetOpen(true);
  }, [hasAnyQuantity]);

  const voucherNumberDisplay =
    voucherNumber != null
      ? passes.length === 1
        ? `#${voucherNumber}`
        : `#${voucherNumber}–#${voucherNumber + passes.length - 1}`
      : null;
  const gatePassNo = voucherNumber ?? 0;

  const summaryFormValues = useMemo((): NikasiSummaryFormValues => {
    const passSummaries: NikasiSummaryFormValues['passes'] = passes.map(
      (pass) => {
        const gradingGatePasses: NikasiSummaryGradingEntry[] = Object.entries(
          pass.removedQuantities
        )
          .filter(([_, sizes]) => Object.values(sizes).some((q) => q > 0))
          .map(([gradingGatePassId, sizes]) => {
            const gp = filteredAndSortedPasses.find(
              (p) => p._id === gradingGatePassId
            );
            return {
              gradingGatePassId,
              gatePassNo: gp?.gatePassNo,
              date: gp?.date,
              allocations: Object.entries(sizes)
                .filter(([_, qty]) => qty > 0)
                .map(([size, quantityToAllocate]) => {
                  const detail = gp ? getOrderDetailForSize(gp, size) : null;
                  return {
                    size,
                    quantityToAllocate,
                    availableQuantity: detail?.currentQuantity ?? 0,
                  };
                }),
            };
          });
        const firstPassId = Object.keys(pass.removedQuantities).find((id) =>
          Object.values(pass.removedQuantities[id] ?? {}).some((q) => q > 0)
        );
        const firstPass = filteredAndSortedPasses.find(
          (p) => p._id === firstPassId
        );
        const variety = firstPass?.variety?.trim() ?? '';
        return {
          date: pass.date,
          from: pass.from,
          toField: pass.toField,
          remarks: pass.remarks,
          gradingGatePasses,
          variety,
        };
      }
    );
    return { passes: passSummaries };
  }, [passes, filteredAndSortedPasses]);

  const handleSubmit = useCallback(() => {
    if (!voucherNumber) return;
    const apiPasses = passes.map((pass, index) => {
      const gradingGatePasses: CreateNikasiGatePassGradingEntry[] =
        Object.entries(pass.removedQuantities)
          .filter(([_, sizes]) => Object.values(sizes).some((q) => q > 0))
          .map(([gradingGatePassId, sizes]) => ({
            gradingGatePassId,
            allocations: Object.entries(sizes)
              .filter(([_, qty]) => qty > 0)
              .map(([size, quantityToAllocate]) => ({
                size,
                quantityToAllocate,
              })),
          }));
      const firstPassId = Object.keys(pass.removedQuantities).find((id) =>
        Object.values(pass.removedQuantities[id] ?? {}).some((q) => q > 0)
      );
      const firstPass = filteredAndSortedPasses.find(
        (p) => p._id === firstPassId
      );
      const variety = firstPass?.variety?.trim() ?? '';
      return {
        farmerStorageLinkId,
        gatePassNo: voucherNumber + index,
        date: formatDateToISO(pass.date),
        variety,
        from: pass.from.trim(),
        toField: pass.toField.trim(),
        gradingGatePasses,
        remarks: pass.remarks.trim() || undefined,
      };
    });
    const passesWithAllocations = apiPasses.filter((p) =>
      p.gradingGatePasses.some((g) =>
        g.allocations.some((a) => a.quantityToAllocate > 0)
      )
    );
    if (passesWithAllocations.length === 0) return;
    createBulkNikasiGatePasses(
      { passes: passesWithAllocations },
      {
        onSuccess: () => {
          setPasses([createDefaultPass(`pass-${Date.now()}`)]);
          setIsSummarySheetOpen(false);
          navigate({ to: '/store-admin/daybook' });
        },
      }
    );
  }, [
    passes,
    voucherNumber,
    farmerStorageLinkId,
    filteredAndSortedPasses,
    createBulkNikasiGatePasses,
    navigate,
  ]);

  const hasGradingData = allGradingPasses.length > 0;
  const hasFilteredData =
    filteredAndSortedPasses.length > 0 && tableSizes.length > 0;
  const currentDialogPass = passes.find((p) => p.id === dialogNikasiPassId);
  const hasExistingQuantity =
    dialogNikasiPassId != null &&
    dialogPassId != null &&
    dialogSize != null &&
    (currentDialogPass?.removedQuantities[dialogPassId]?.[dialogSize] ?? 0) > 0;

  const isFormValid = passes.every(
    (p) =>
      (p.from ?? '').trim() !== '' &&
      (p.toField ?? '').trim() !== '' &&
      (p.date ?? '').trim() !== ''
  );

  return (
    <main className="font-custom mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="font-custom text-3xl font-bold text-[#333] sm:text-4xl dark:text-white">
          Create Nikasi Gate Pass
        </h1>

        {isLoadingVoucher ? (
          <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
            <span className="font-custom text-primary text-sm font-medium">
              Loading voucher number...
            </span>
          </div>
        ) : voucherNumberDisplay ? (
          <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
            <span className="font-custom text-primary text-sm font-medium">
              Nikasi Gate Pass {voucherNumberDisplay}
            </span>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNext();
        }}
        className="space-y-6"
      >
        <FieldGroup className="space-y-6">
          {passes.map((pass, passIndex) => (
            <Card key={pass.id} className="relative">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="font-custom text-xl">
                    Pass {passIndex + 1} — Gate pass details
                  </CardTitle>
                  <CardDescription className="font-custom text-muted-foreground text-sm">
                    From, To, Date and allocations for this nikasi gate pass.
                  </CardDescription>
                </div>
                {passes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="font-custom text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removePass(pass.id)}
                    aria-label={`Remove pass ${passIndex + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field>
                    <FieldLabel
                      htmlFor={`nikasi-from-${pass.id}`}
                      className="font-custom text-sm"
                    >
                      From
                    </FieldLabel>
                    <Input
                      id={`nikasi-from-${pass.id}`}
                      value={pass.from}
                      onChange={(e) =>
                        updatePass(pass.id, { from: e.target.value })
                      }
                      placeholder="e.g. Warehouse A"
                      className="font-custom"
                    />
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor={`nikasi-to-${pass.id}`}
                      className="font-custom text-sm"
                    >
                      To
                    </FieldLabel>
                    <Input
                      id={`nikasi-to-${pass.id}`}
                      value={pass.toField}
                      onChange={(e) =>
                        updatePass(pass.id, { toField: e.target.value })
                      }
                      placeholder="e.g. Location B"
                      className="font-custom"
                    />
                  </Field>
                  <Field>
                    <DatePicker
                      value={pass.date}
                      onChange={(value) =>
                        updatePass(pass.id, { date: value ?? '' })
                      }
                      label="Date"
                      id={`nikasi-date-${pass.id}`}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel
                    htmlFor={`nikasi-remarks-${pass.id}`}
                    className="font-custom text-sm"
                  >
                    Remarks
                  </FieldLabel>
                  <textarea
                    id={`nikasi-remarks-${pass.id}`}
                    value={pass.remarks}
                    onChange={(e) =>
                      updatePass(pass.id, { remarks: e.target.value })
                    }
                    placeholder="Max 500 characters"
                    maxLength={500}
                    rows={2}
                    className="border-input bg-background ring-offset-background focus-visible:ring-primary font-custom flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </Field>

                {/* Grading gate passes filters — above the table (once, in first pass) */}
                {passIndex === 0 && (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-custom text-foreground text-lg font-semibold">
                          Grading Gate Passes
                        </h3>
                        <p className="font-custom text-muted-foreground text-sm">
                          {hasGradingData
                            ? 'Filter list and choose columns. Allocate quantities in each pass card below.'
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
                                onCheckedChange={() => handleColumnToggle(size)}
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
                      <div className="border-border/60 bg-muted/30 flex flex-wrap items-end gap-3 rounded-lg border px-3 py-3 sm:gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="nikasi-grading-variety-filter"
                            className="font-custom text-muted-foreground text-xs font-medium"
                          >
                            Variety
                          </label>
                          <SearchSelector
                            id="nikasi-grading-variety-filter"
                            options={[
                              { value: '', label: 'All varieties' },
                              ...varieties.map((v) => ({ value: v, label: v })),
                            ]}
                            placeholder="All varieties"
                            onSelect={(value) => setVarietyFilter(value ?? '')}
                            defaultValue={varietyFilter || ''}
                            buttonClassName="font-custom w-[160px] sm:w-[180px]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="font-custom text-muted-foreground text-xs font-medium">
                            Date from
                          </span>
                          <DatePicker
                            value={dateFilterFrom}
                            onChange={(v) => setDateFilterFrom(v ?? '')}
                            id="nikasi-grading-date-from"
                            label=""
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="font-custom text-muted-foreground text-xs font-medium">
                            Date to
                          </span>
                          <DatePicker
                            value={dateFilterTo}
                            onChange={(v) => setDateFilterTo(v ?? '')}
                            id="nikasi-grading-date-to"
                            label=""
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="font-custom text-muted-foreground text-xs font-medium">
                            Sort by date
                          </span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant={
                                dateSort === 'desc' ? 'default' : 'outline'
                              }
                              size="sm"
                              className="font-custom gap-1.5"
                              onClick={() => setDateSort('desc')}
                            >
                              <ArrowDown className="h-4 w-4" />
                              Newest first
                            </Button>
                            <Button
                              type="button"
                              variant={
                                dateSort === 'asc' ? 'default' : 'outline'
                              }
                              size="sm"
                              className="font-custom gap-1.5"
                              onClick={() => setDateSort('asc')}
                            >
                              <ArrowUp className="h-4 w-4" />
                              Oldest first
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="font-custom text-muted-foreground text-sm">
                      Filter and column options apply to the allocation tables
                      in each pass below.
                    </p>
                  </div>
                )}

                {/* Grading table for this pass */}
                <div className="border-border/40 rounded-md border pt-2">
                  <p className="font-custom text-muted-foreground mb-2 px-2 text-xs font-medium">
                    Allocate from grading gate passes for this pass
                  </p>
                  {!isLoadingPasses &&
                    hasGradingData &&
                    hasFilteredData &&
                    visibleSizes.length > 0 && (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="font-custom text-foreground/80 w-[120px] font-medium">
                                R. Voucher
                              </TableHead>
                              {visibleSizes.map((size) => (
                                <TableHead
                                  key={size}
                                  className="font-custom text-foreground/80 font-medium"
                                >
                                  {size}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {groupedByFarmer.map((group) => (
                              <Fragment key={group.farmerStorageLinkId}>
                                <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                                  <TableCell
                                    colSpan={visibleSizes.length + 1}
                                    className="font-custom text-primary py-2.5 font-semibold"
                                  >
                                    {group.farmerName}
                                  </TableCell>
                                </TableRow>
                                {group.passes.map((gp) => (
                                  <TableRow
                                    key={gp._id}
                                    className="border-border/40 hover:bg-transparent"
                                  >
                                    <TableCell className="py-3">
                                      <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2.5">
                                          <Checkbox
                                            checked={selectedOrders.has(gp._id)}
                                            onCheckedChange={() =>
                                              handleOrderToggle(gp._id)
                                            }
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                          />
                                          <span className="font-custom text-foreground/90 font-medium">
                                            #{gp.gatePassNo}
                                          </span>
                                        </div>
                                        {gp.incomingGatePassId?.truckNumber && (
                                          <span className="font-custom text-muted-foreground pl-7 text-xs">
                                            {gp.incomingGatePassId.truckNumber}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    {visibleSizes.map((size) => {
                                      const detail = getOrderDetailForSize(
                                        gp,
                                        size
                                      );
                                      const removed =
                                        pass.removedQuantities[gp._id]?.[
                                          size
                                        ] ?? 0;
                                      if (!detail) {
                                        return (
                                          <TableCell
                                            key={size}
                                            className="py-1"
                                          >
                                            <div className="bg-muted/30 border-border/40 h-[58px] w-[70px] rounded-md border" />
                                          </TableCell>
                                        );
                                      }
                                      return (
                                        <TableCell key={size} className="py-1">
                                          <GradingGatePassCell
                                            variety={gp.variety}
                                            currentQuantity={
                                              detail.currentQuantity
                                            }
                                            initialQuantity={
                                              detail.initialQuantity
                                            }
                                            removedQuantity={removed}
                                            onClick={() =>
                                              openDialog(pass.id, gp, size)
                                            }
                                            onQuickRemove={() => {
                                              setRemoved(
                                                pass.id,
                                                gp._id,
                                                size,
                                                0
                                              );
                                            }}
                                            disabled={
                                              detail.currentQuantity <= 0
                                            }
                                          />
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                ))}
                              </Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  {!isLoadingPasses && hasGradingData && !hasFilteredData && (
                    <p className="font-custom text-muted-foreground py-4 text-center text-sm">
                      No passes match filters or no order details.
                    </p>
                  )}
                  {!isLoadingPasses && !hasGradingData && (
                    <p className="font-custom text-muted-foreground py-4 text-center text-sm">
                      No grading gate passes available.
                    </p>
                  )}
                  {isLoadingPasses && (
                    <p className="font-custom text-muted-foreground py-4 text-center text-sm">
                      Loading...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </FieldGroup>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:gap-4">
          <Button
            type="button"
            variant="outline"
            className="font-custom order-2 w-full sm:order-1 sm:w-auto"
            onClick={() => {
              setPasses([createDefaultPass(`pass-${Date.now()}`)]);
              toast.info('Form reset');
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="font-custom order-1 w-full px-8 font-bold sm:order-2 sm:w-auto"
            disabled={
              isLoadingVoucher ||
              voucherNumber == null ||
              !hasAnyQuantity ||
              !isFormValid
            }
          >
            Next: Review summary
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>

      <NikasiSummarySheet
        open={isSummarySheetOpen}
        onOpenChange={setIsSummarySheetOpen}
        voucherNumberDisplay={voucherNumberDisplay}
        formValues={summaryFormValues}
        isPending={isPending}
        isLoadingVoucher={isLoadingVoucher}
        gatePassNo={gatePassNo}
        onSubmit={handleSubmit}
      />

      <QuantityRemoveDialog
        open={dialogOpen}
        onOpenChange={(open) => !open && handleDialogClose()}
        quantityInput={quantityInput}
        quantityError={quantityError}
        maxQuantity={dialogMaxQuantity}
        hasExistingQuantity={!!hasExistingQuantity}
        onQuantityInputChange={handleQuantityInputChange}
        onQuantitySubmit={handleQuantitySubmit}
        onQuantityRemove={handleQuantityRemove}
        onClose={handleDialogClose}
      />
    </main>
  );
});

export default NikasiGatePassForm;
