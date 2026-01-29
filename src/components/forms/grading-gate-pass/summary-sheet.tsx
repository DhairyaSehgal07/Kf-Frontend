import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

import { FileText, Calendar, Package, Layers, Loader2 } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface GradingSummaryFormValues {
  date: string;
  sizeEntries: Array<{
    size: string;
    quantity: number;
    bagType: string;
    weightPerBagKg: number;
  }>;
  remarks?: string;
}

export interface GradingSummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherNumberDisplay: string | null;
  variety: string;
  formValues: GradingSummaryFormValues;
  isPending: boolean;
  isLoadingVoucher: boolean;
  gatePassNo: number;
  onSubmit: () => void;
}

/* -------------------------------------------------------------------------- */
/*                              Compact Row UI                                */
/* -------------------------------------------------------------------------- */

const SummaryRow = memo(function SummaryRow({
  label,
  value,
  subValue,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border px-3 py-2">
      {Icon && (
        <Icon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
      )}

      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
          {label}
        </p>

        <p className="text-foreground truncate text-sm font-medium">{value}</p>

        {subValue && (
          <p className="text-muted-foreground truncate text-xs">{subValue}</p>
        )}
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                                Main Sheet                                  */
/* -------------------------------------------------------------------------- */

export const GradingSummarySheet = memo(function GradingSummarySheet({
  open,
  onOpenChange,
  voucherNumberDisplay,
  variety,
  formValues,
  isPending,
  isLoadingVoucher,
  gatePassNo,
  onSubmit,
}: GradingSummarySheetProps) {
  const totalBags = formValues.sizeEntries.reduce(
    (sum, row) => sum + row.quantity,
    0
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-lg"
      >
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-xl font-semibold">
            Grading Gate Pass Summary
          </SheetTitle>

          <SheetDescription className="text-sm">
            Review before creating the grading gate pass
          </SheetDescription>
        </SheetHeader>

        {/* ------------------------------------------------------------------ */}
        {/* Scrollable Content                                                 */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {voucherNumberDisplay && (
              <SummaryRow
                label="Voucher"
                value={voucherNumberDisplay}
                icon={FileText}
              />
            )}

            <SummaryRow label="Date" value={formValues.date} icon={Calendar} />

            <SummaryRow
              label="Variety"
              value={variety}
              icon={Package}
            />

            {formValues.remarks?.trim() && (
              <SummaryRow label="Remarks" value={formValues.remarks} />
            )}
          </div>

          {/* Size-wise entries */}
          <div className="border-border/60 mt-4 rounded-lg border p-3">
            <h4 className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <Layers className="h-3.5 w-3.5" />
              Size-wise entries
            </h4>
            <div className="space-y-2">
              {formValues.sizeEntries.map((row) => (
                <div
                  key={row.size}
                  className="border-border/40 bg-muted/20 flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{row.size}</span>
                  <span className="text-muted-foreground">
                    Qty: {row.quantity} · {row.bagType} · Wt: {row.weightPerBagKg}{' '}
                    kg
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlight Metric */}
          <div className="bg-muted/40 mt-4 flex items-center justify-between rounded-lg px-4 py-3">
            <span className="text-muted-foreground text-xs tracking-wide uppercase">
              Total Bags
            </span>

            <span className="text-xl font-bold">{totalBags}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Footer                                                             */}
        {/* ------------------------------------------------------------------ */}

        <SheetFooter className="bg-background border-t px-5 py-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="lg"
              className="w-full font-semibold sm:flex-1"
              onClick={onSubmit}
              disabled={isPending || isLoadingVoucher || !gatePassNo}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Grading Gate Pass'
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});
