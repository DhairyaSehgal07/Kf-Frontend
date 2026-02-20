import { memo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FileText, User, Package, Loader2 } from 'lucide-react';

export type RentalQuantityRow = {
  sizeName: string;
  quantity: number;
  location?: { chamber: string; floor: string; row: string };
};

interface RentalSummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherNumberDisplay: string;
  farmerDisplayName: string;
  variety: string;
  quantityRows: RentalQuantityRow[];
  sizeOrder: readonly string[];
  totalBags: number;
  isPending: boolean;
  isLoadingVoucher: boolean;
  gatePassNo: number;
  onSubmit: () => void;
}

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
        <p className="font-custom text-muted-foreground text-[11px] tracking-wide uppercase">
          {label}
        </p>
        <p className="font-custom text-foreground truncate text-sm font-medium">
          {value}
        </p>
        {subValue && (
          <p className="font-custom text-muted-foreground truncate text-xs">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
});

export const RentalSummarySheet = memo(function RentalSummarySheet({
  open,
  onOpenChange,
  voucherNumberDisplay,
  farmerDisplayName,
  variety,
  quantityRows,
  totalBags,
  isPending,
  isLoadingVoucher,
  gatePassNo,
  onSubmit,
}: RentalSummarySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="font-custom flex w-full flex-col p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-custom text-xl font-semibold">
            Rental Incoming – Summary
          </SheetTitle>
          <SheetDescription className="font-custom text-sm">
            Review before creating the rental incoming gate pass
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {voucherNumberDisplay && (
              <SummaryRow
                label="Voucher"
                value={voucherNumberDisplay}
                icon={FileText}
              />
            )}
            <SummaryRow label="Farmer" value={farmerDisplayName} icon={User} />
            <SummaryRow label="Variety" value={variety || '—'} icon={Package} />
          </div>

          {quantityRows.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="font-custom text-muted-foreground text-[11px] tracking-wide uppercase">
                Quantities by size
              </p>
              <div className="space-y-1.5">
                {quantityRows.map((row) => {
                  const loc = row.location;
                  const locStr =
                    loc &&
                    loc.chamber?.trim() &&
                    loc.floor?.trim() &&
                    loc.row?.trim()
                      ? `${loc.chamber}-${loc.floor}-${loc.row}`
                      : null;
                  return (
                    <div
                      key={row.sizeName}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span className="font-custom text-foreground text-sm font-medium">
                        {row.sizeName}
                      </span>
                      <div className="text-right">
                        <span className="font-custom text-foreground text-sm font-medium">
                          {row.quantity} bags
                        </span>
                        {locStr && (
                          <p className="font-custom text-muted-foreground text-xs">
                            {locStr}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-muted/40 mt-4 flex items-center justify-between rounded-lg px-4 py-3">
            <span className="font-custom text-muted-foreground text-xs tracking-wide uppercase">
              Total Bags
            </span>
            <span className="font-custom text-xl font-bold">{totalBags}</span>
          </div>
        </div>

        <SheetFooter className="bg-background border-t px-5 py-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="font-custom w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="lg"
              className="font-custom w-full font-semibold sm:flex-1"
              onClick={onSubmit}
              disabled={isPending || isLoadingVoucher || !gatePassNo}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </span>
              ) : (
                'Create Rental Incoming Gate Pass'
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});
