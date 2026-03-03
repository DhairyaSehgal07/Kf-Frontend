import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';
import { useGetIncomingGatePasses } from '@/services/store-admin/incoming-gate-pass/useGetIncomingGatePasses';
import type { IncomingGatePassWithLink } from '@/types/incoming-gate-pass';
import { formatDisplayDate } from '@/lib/helpers';

/** Incoming vouchers with gradingSummary.graded === true are excluded from the grading form. */
function isUngraded(pass: IncomingGatePassWithLink): boolean {
  return pass.gradingSummary?.graded !== true;
}

function getLinkId(pass: IncomingGatePassWithLink): string {
  const link = pass.farmerStorageLinkId;
  return typeof link === 'string' ? link : link._id;
}

export interface GradingFormStep1Props {
  /** Pre-selected IDs when opening from Daybook (e.g. single incoming pass in context). */
  initialSelectedIds?: string[];
  onNext: (incomingGatePassIds: string[]) => void;
}

export const GradingFormStep1 = memo(function GradingFormStep1({
  initialSelectedIds = [],
  onNext,
}: GradingFormStep1Props) {
  const { data: incomingGatePasses = [], isLoading } = useGetIncomingGatePasses(
    { limit: 500 }
  );
  const ungradedPasses = useMemo(
    () => incomingGatePasses.filter(isUngraded),
    [incomingGatePasses]
  );

  const [selectedFarmerStorageLinkId, setSelectedFarmerStorageLinkId] =
    useState<string>('');
  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const hasSyncedInitial = useRef(false);

  /** Unique farmers (by farmerStorageLinkId) from ungraded passes, for dropdown */
  const farmerOptions = useMemo((): Option<string>[] => {
    const byLinkId = new Map<string, { name: string; accountNumber: number }>();
    for (const pass of ungradedPasses) {
      const linkId = getLinkId(pass);
      const link = pass.farmerStorageLinkId;
      if (typeof link === 'object' && link?.farmerId && !byLinkId.has(linkId)) {
        byLinkId.set(linkId, {
          name: link.farmerId.name ?? 'Unknown',
          accountNumber: link.accountNumber ?? 0,
        });
      }
    }
    return Array.from(byLinkId.entries())
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .map(([value, { name, accountNumber }]) => ({
        value,
        label: `${name} (Account #${accountNumber})`,
        searchableText: `${name} ${accountNumber}`,
      }));
  }, [ungradedPasses]);

  /** Unique varieties for the selected farmer */
  const varietyOptions = useMemo((): Option<string>[] => {
    if (!selectedFarmerStorageLinkId) return [];
    const varieties = new Set<string>();
    for (const pass of ungradedPasses) {
      if (getLinkId(pass) === selectedFarmerStorageLinkId && pass.variety) {
        varieties.add(pass.variety);
      }
    }
    return Array.from(varieties)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({
        value,
        label: value,
        searchableText: value,
      }));
  }, [ungradedPasses, selectedFarmerStorageLinkId]);

  /** Gate passes to show for selection: only after farmer + variety selected */
  const passesForSelection = useMemo(() => {
    if (!selectedFarmerStorageLinkId || !selectedVariety) return [];
    return ungradedPasses.filter(
      (p) =>
        getLinkId(p) === selectedFarmerStorageLinkId &&
        p.variety === selectedVariety
    );
  }, [ungradedPasses, selectedFarmerStorageLinkId, selectedVariety]);

  useEffect(() => {
    if (hasSyncedInitial.current || ungradedPasses.length === 0) return;
    hasSyncedInitial.current = true;
    const ungradedIds = new Set(ungradedPasses.map((p) => p._id));
    const validInitial = initialSelectedIds.filter((id) => ungradedIds.has(id));
    const firstPass = ungradedPasses.find((p) => validInitial.includes(p._id));
    if (firstPass && validInitial.length > 0) {
      const linkId = getLinkId(firstPass);
      const variety = firstPass.variety ?? '';
      queueMicrotask(() => {
        setSelectedFarmerStorageLinkId(linkId);
        setSelectedVariety(variety);
        setSelectedIds(new Set(validInitial));
      });
    }
  }, [ungradedPasses, initialSelectedIds]);

  const handleFarmerChange = useCallback((value: string | '') => {
    setSelectedFarmerStorageLinkId(value);
    setSelectedVariety('');
    setSelectedIds(new Set());
  }, []);

  const handleVarietyChange = useCallback((value: string | '') => {
    setSelectedVariety(value);
    setSelectedIds(new Set());
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(passesForSelection.map((pass) => pass._id)));
  }, [passesForSelection]);

  const clearAll = useCallback(() => setSelectedIds(new Set()), []);

  const handleNext = useCallback(() => {
    onNext(Array.from(selectedIds));
  }, [onNext, selectedIds]);

  const selectedArray = Array.from(selectedIds);

  if (isLoading) {
    return (
      <div className="font-custom flex flex-col space-y-6">
        <p className="font-custom text-muted-foreground text-base">
          Loading incoming gate passes...
        </p>
      </div>
    );
  }

  if (ungradedPasses.length === 0) {
    return (
      <div className="font-custom flex flex-col space-y-6">
        <p className="font-custom text-muted-foreground text-base">
          {incomingGatePasses.length === 0
            ? 'No incoming gate passes found. Add incoming gate passes first.'
            : 'No ungraded incoming gate passes. All incoming vouchers have already been graded.'}
        </p>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="default"
            size="lg"
            className="font-custom px-8 font-bold"
            onClick={() => onNext([])}
            disabled
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  const showGatePassList =
    selectedFarmerStorageLinkId &&
    selectedVariety &&
    passesForSelection.length > 0;

  return (
    <div className="font-custom flex flex-col space-y-6">
      {/* 1. Farmer dropdown */}
      <div className="space-y-2">
        <label
          htmlFor="grading-step1-farmer"
          className="font-custom text-foreground text-sm font-medium"
        >
          Farmer
        </label>
        <SearchSelector
          id="grading-step1-farmer"
          options={farmerOptions}
          placeholder="Select farmer..."
          value={selectedFarmerStorageLinkId}
          onSelect={handleFarmerChange}
          emptyMessage="No farmers with ungraded gate passes."
          className="w-full"
        />
      </div>

      {/* 2. Variety dropdown (only when farmer selected) */}
      {selectedFarmerStorageLinkId && (
        <div className="space-y-2">
          <label
            htmlFor="grading-step1-variety"
            className="font-custom text-foreground text-sm font-medium"
          >
            Variety
          </label>
          <SearchSelector
            id="grading-step1-variety"
            options={varietyOptions}
            placeholder="Select variety..."
            value={selectedVariety}
            onSelect={handleVarietyChange}
            emptyMessage="No varieties for this farmer."
            className="w-full"
          />
        </div>
      )}

      {/* 3. Gate pass list (only when farmer + variety selected) */}
      {selectedFarmerStorageLinkId && selectedVariety && !showGatePassList && (
        <p className="font-custom text-muted-foreground text-sm">
          No ungraded incoming gate passes for this farmer and variety.
        </p>
      )}

      {showGatePassList && (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
              Select incoming gate passes
            </h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-custom"
                onClick={selectAll}
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-custom"
                onClick={clearAll}
              >
                Clear
              </Button>
            </div>
          </div>
          <p className="font-custom text-muted-foreground text-sm">
            Choose the incoming gate passes to reference in this grading
            voucher.
          </p>

          {/* Desktop: table */}
          <div className="border-border/60 hidden overflow-x-auto rounded-lg border md:block">
            <table className="font-custom w-full min-w-lg text-sm">
              <thead>
                <tr className="border-border/60 bg-muted/40 border-b">
                  <th className="text-muted-foreground w-10 px-3 py-2 text-left font-medium">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                    Gate Pass #
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                    Date
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                    Variety
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                    Truck
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                    Bags
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {passesForSelection.map((pass) => (
                  <tr
                    key={pass._id}
                    className="border-border/40 hover:bg-muted/20 border-b last:border-0"
                  >
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selectedIds.has(pass._id)}
                        onCheckedChange={() => toggle(pass._id)}
                        aria-label={`Select gate pass #${pass.gatePassNo}`}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{pass.gatePassNo}</td>
                    <td className="text-muted-foreground px-3 py-2">
                      {formatDisplayDate(pass.date)}
                    </td>
                    <td className="px-3 py-2">{pass.variety}</td>
                    <td className="text-muted-foreground px-3 py-2">
                      {pass.truckNumber || '—'}
                    </td>
                    <td className="px-3 py-2">{pass.bagsReceived}</td>
                    <td className="text-muted-foreground px-3 py-2">
                      {pass.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {passesForSelection.map((pass) => (
              <label
                key={pass._id}
                className="border-border/40 bg-muted/20 hover:bg-muted/30 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors"
              >
                <Checkbox
                  checked={selectedIds.has(pass._id)}
                  onCheckedChange={() => toggle(pass._id)}
                  aria-label={`Select gate pass #${pass.gatePassNo}`}
                  className="mt-0.5"
                />
                <div className="font-custom min-w-0 flex-1 text-sm">
                  <span className="font-semibold">#{pass.gatePassNo}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    · {pass.variety}
                  </span>
                  <p className="text-muted-foreground mt-1">
                    {formatDisplayDate(pass.date)} · {pass.bagsReceived} bags
                    {pass.truckNumber ? ` · ${pass.truckNumber}` : ''}
                  </p>
                  <p className="text-muted-foreground text-xs">{pass.status}</p>
                </div>
              </label>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <span className="text-muted-foreground font-custom text-sm">
          {selectedArray.length} selected
        </span>
        <Button
          type="button"
          variant="default"
          size="lg"
          className="font-custom px-8 font-bold"
          onClick={handleNext}
          disabled={selectedArray.length === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
});
