import { memo } from 'react';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type EditStorageSummaryRow = {
  size: string;
  quantity: number;
  chamber: string;
  floor: string;
  row: string;
};

export type EditStorageSummaryFormValues = {
  gatePassNo?: number;
  date: string;
  variety: string;
  storageCategory: string;
  remarks: string;
  reason: string;
  rows: EditStorageSummaryRow[];
};

type EditStorageSummarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formValues: EditStorageSummaryFormValues;
  isPending: boolean;
  onSubmit: () => void;
};

export const EditStorageSummarySheet = memo(function EditStorageSummarySheet({
  open,
  onOpenChange,
  formValues,
  isPending,
  onSubmit,
}: EditStorageSummarySheetProps) {
  const totalBags = formValues.rows.reduce(
    (sum, row) => sum + (row.quantity ?? 0),
    0
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-lg"
      >
        <div className="bg-background flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-border border-b px-6 py-4">
            <SheetTitle className="font-custom text-lg font-bold">
              Edit Storage Gate Pass Summary
            </SheetTitle>
            <SheetDescription className="font-custom text-sm">
              Review details before updating.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="bg-muted/40 rounded-lg border p-4">
              <p className="font-custom text-muted-foreground text-xs uppercase">
                Gate Pass
              </p>
              <p className="font-custom text-base font-semibold">
                #{formValues.gatePassNo ?? '—'}
              </p>
            </div>

            <div className="bg-muted/40 rounded-lg border p-4">
              <p className="font-custom text-muted-foreground text-xs uppercase">
                Date / Variety
              </p>
              <p className="font-custom text-sm font-medium">
                {formValues.date} · {formValues.variety || '—'}
              </p>
              <p className="font-custom text-muted-foreground mt-2 text-xs uppercase">
                Storage Category
              </p>
              <p className="font-custom text-sm font-medium">
                {formValues.storageCategory || '—'}
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <div className="bg-muted/50 flex items-center justify-between px-4 py-3">
                <p className="font-custom text-sm font-semibold">Bag Rows</p>
                <span className="font-custom text-primary text-sm font-semibold">
                  {totalBags} bags
                </span>
              </div>
              <div className="divide-border divide-y">
                {formValues.rows.map((row, index) => (
                  <div
                    key={`${row.size}-${row.chamber}-${row.floor}-${row.row}-${index}`}
                    className="px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-custom text-sm font-medium">
                        {row.size}
                      </p>
                      <p className="font-custom text-sm font-semibold">
                        {row.quantity}
                      </p>
                    </div>
                    <p className="font-custom text-muted-foreground mt-1 text-xs">
                      {row.chamber || '-'} / {row.floor || '-'} /{' '}
                      {row.row || '-'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/40 rounded-lg border p-4">
              <p className="font-custom text-muted-foreground text-xs uppercase">
                Remarks
              </p>
              <p className="font-custom mt-1 text-sm">
                {formValues.remarks?.trim() || '—'}
              </p>
            </div>

            <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/40">
              <p className="font-custom text-xs font-semibold uppercase">
                Reason
              </p>
              <p className="font-custom mt-1 text-sm">
                {formValues.reason?.trim() || '—'}
              </p>
            </div>

            <div className="bg-primary/10 flex items-center gap-2 rounded-lg px-3 py-2">
              <Package className="text-primary h-4 w-4" />
              <span className="font-custom text-sm font-medium">
                Total Selected: {totalBags}
              </span>
            </div>
          </div>

          <SheetFooter className="border-border border-t px-6 py-4">
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
                className="font-custom w-full sm:flex-1"
                onClick={onSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  'Update Storage Gate Pass'
                )}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
});
