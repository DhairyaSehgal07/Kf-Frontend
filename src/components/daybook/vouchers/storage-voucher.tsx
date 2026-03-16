import { memo, useMemo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/forms/date-picker';
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Printer,
  User,
  Package,
} from 'lucide-react';
import { DetailRow } from './detail-row';
import { formatVoucherDate } from './format-date';
import {
  totalBagsFromBagSizes,
  type StorageBagSizeRow,
  type VoucherFarmerInfo,
} from './types';
import type { StorageGatePassWithLink } from '@/types/storage-gate-pass';
import { useEditStorageGatePass } from '@/services/store-admin/storage-gate-pass/useEditStorageGatePass';
import { formatDate, formatDateToISO } from '@/lib/helpers';

const STORAGE_CATEGORY_OPTIONS = [
  'OWNED',
  'PURCHASED',
  'CONTRACT FARMING',
] as const;

export interface StorageVoucherProps extends Partial<VoucherFarmerInfo> {
  /** Storage gate pass in the new API format (with populated farmerStorageLinkId and bagSizes) */
  voucher: StorageGatePassWithLink;
}

function voucherDateToDDMMYYYY(dateStr: string | undefined): string {
  if (!dateStr) return formatDate(new Date());
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? formatDate(new Date()) : formatDate(d);
}

const StorageVoucher = memo(function StorageVoucher({
  voucher,
  farmerName: farmerNameProp,
  farmerAccount: farmerAccountProp,
}: StorageVoucherProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editManualGatePassNumber, setEditManualGatePassNumber] = useState<
    number | ''
  >('');
  const [editDate, setEditDate] = useState('');
  const [editStorageCategory, setEditStorageCategory] = useState('');

  const { mutate: editStorageGatePass, isPending: isEditPending } =
    useEditStorageGatePass();

  const openEditDialog = () => {
    setEditManualGatePassNumber(voucher.manualGatePassNumber ?? '');
    setEditDate(voucherDateToDDMMYYYY(voucher.date));
    setEditStorageCategory(voucher.storageCategory ?? '');
    setEditOpen(true);
  };

  const handleEditSubmit = () => {
    editStorageGatePass(
      {
        storageGatePassId: voucher._id,
        ...(editManualGatePassNumber !== '' && {
          manualGatePassNumber:
            typeof editManualGatePassNumber === 'number'
              ? editManualGatePassNumber
              : parseInt(String(editManualGatePassNumber), 10),
        }),
        date: formatDateToISO(editDate),
        ...(editStorageCategory.trim() !== '' && {
          storageCategory: editStorageCategory.trim(),
        }),
      },
      {
        onSuccess: () => setEditOpen(false),
      }
    );
  };

  const farmerName =
    farmerNameProp ?? voucher.farmerStorageLinkId?.farmerId?.name;
  const farmerAccount =
    farmerAccountProp ?? voucher.farmerStorageLinkId?.accountNumber;

  const bagSizes = useMemo(() => voucher.bagSizes ?? [], [voucher.bagSizes]);
  const bags = totalBagsFromBagSizes(bagSizes);

  const { totalQty, totalInitial } = useMemo(() => {
    const sizes = voucher.bagSizes ?? [];
    let qty = 0;
    let initial = 0;
    for (const b of sizes) {
      qty += b.currentQuantity ?? 0;
      initial += b.initialQuantity ?? 0;
    }
    return { totalQty: qty, totalInitial: initial };
  }, [voucher.bagSizes]);

  return (
    <Card className="border-border/40 hover:border-primary/30 overflow-hidden pt-0 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="px-4 pt-2 pb-4">
        <CardHeader className="px-0 pt-3 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                <h3 className="text-foreground font-custom text-base font-bold tracking-tight">
                  SGP{' '}
                  <span className="text-primary">
                    #{voucher.gatePassNo ?? '—'}
                  </span>
                  {voucher.manualGatePassNumber != null && (
                    <span className="text-muted-foreground font-normal">
                      {' '}
                      · Manual #{voucher.manualGatePassNumber}
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {formatVoucherDate(voucher.date)}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {voucher.storageCategory != null &&
                voucher.storageCategory.trim() !== '' && (
                  <Badge
                    variant="outline"
                    className="border-primary/40 bg-primary/5 text-primary px-2 py-0.5 text-[10px] font-medium"
                  >
                    {voucher.storageCategory}
                  </Badge>
                )}
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-[10px] font-medium"
              >
                {bags.toLocaleString('en-IN')} bags
              </Badge>
            </div>
          </div>
        </CardHeader>

        <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {farmerName != null && farmerName !== '' && (
            <DetailRow label="Farmer" value={farmerName} icon={User} />
          )}
          {farmerAccount != null && (
            <DetailRow label="Account" value={`#${farmerAccount}`} />
          )}
          <DetailRow
            label="Variety"
            value={voucher.variety ?? '—'}
            icon={Package}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((p) => !p)}
            className="hover:bg-accent h-8 px-3 text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                More
              </>
            )}
          </Button>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={openEditDialog}
              className="h-8 w-8 p-0"
              aria-label="Edit gate pass"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8 w-8 p-0"
              aria-label="Print gate pass"
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              {(farmerName != null || farmerAccount != null) && (
                <section>
                  <h4 className="text-muted-foreground/70 mb-2 text-xs font-semibold tracking-wider uppercase">
                    Farmer Details
                  </h4>
                  <div className="bg-muted/30 grid grid-cols-1 gap-2 rounded-lg p-2 sm:grid-cols-2 lg:grid-cols-3">
                    {farmerName != null && farmerName !== '' && (
                      <DetailRow label="Name" value={farmerName} />
                    )}
                    {farmerAccount != null && (
                      <DetailRow label="Account" value={`${farmerAccount}`} />
                    )}
                    {voucher.farmerStorageLinkId?.farmerId?.address != null && (
                      <DetailRow
                        label="Address"
                        value={voucher.farmerStorageLinkId.farmerId.address}
                      />
                    )}
                    {voucher.farmerStorageLinkId?.farmerId?.mobileNumber !=
                      null && (
                      <DetailRow
                        label="Mobile"
                        value={
                          voucher.farmerStorageLinkId.farmerId.mobileNumber
                        }
                      />
                    )}
                  </div>
                </section>
              )}

              <Separator />

              <section>
                <h4 className="text-muted-foreground/70 mb-2.5 text-xs font-semibold tracking-wider uppercase">
                  Bag details
                </h4>
                <div className="bg-muted/30 overflow-x-auto rounded-lg p-3">
                  <table className="font-custom w-full min-w-[320px] text-sm">
                    <thead>
                      <tr className="text-muted-foreground/70 border-b text-left text-[10px] font-medium tracking-wider uppercase">
                        <th className="pr-3 pb-2">Size</th>
                        <th className="pr-3 pb-2">Bag Type</th>
                        <th className="pr-3 pb-2">Chamber</th>
                        <th className="pr-3 pb-2">Floor</th>
                        <th className="pr-3 pb-2">Row</th>
                        <th className="pr-3 pb-2 text-right">Qty</th>
                        <th className="pb-2 text-right">Initial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(bagSizes as StorageBagSizeRow[]).map((row, idx) => (
                        <tr
                          key={`${row.size}-${row.chamber}-${row.floor}-${row.row}-${idx}`}
                          className="border-border/40 border-b"
                        >
                          <td className="py-2 pr-3 font-medium">
                            {row.size ?? '—'}
                          </td>
                          <td className="py-2 pr-3">{row.bagType ?? '—'}</td>
                          <td className="py-2 pr-3">{row.chamber ?? '—'}</td>
                          <td className="py-2 pr-3">{row.floor ?? '—'}</td>
                          <td className="py-2 pr-3">{row.row ?? '—'}</td>
                          <td className="py-2 pr-3 text-right font-medium">
                            {(row.currentQuantity ?? 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 text-right">
                            {(row.initialQuantity ?? 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-border/60 bg-muted/50 text-primary border-t-2 font-semibold">
                        <td className="py-2.5 pr-3" colSpan={5}>
                          Total
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          {totalQty.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 text-right">
                          {totalInitial.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {voucher.remarks != null && voucher.remarks !== '' && (
                <>
                  <Separator />
                  <section>
                    <h4 className="text-muted-foreground/70 mb-2.5 text-xs font-semibold tracking-wider uppercase">
                      Remarks
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-foreground font-custom text-sm font-medium">
                        {voucher.remarks}
                      </p>
                    </div>
                  </section>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="font-custom sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-custom">
              Edit storage gate pass
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel
                htmlFor="edit-manual-gate-pass"
                className="font-custom mb-2 block text-base font-semibold"
              >
                Manual Gate Pass Number
                <span className="font-custom text-muted-foreground ml-1 font-normal">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id="edit-manual-gate-pass"
                type="number"
                min={0}
                value={
                  editManualGatePassNumber === ''
                    ? ''
                    : editManualGatePassNumber
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    setEditManualGatePassNumber('');
                    return;
                  }
                  const parsed = parseInt(raw, 10);
                  setEditManualGatePassNumber(
                    Number.isNaN(parsed) ? '' : parsed
                  );
                }}
                placeholder="e.g. 101"
                className="font-custom [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </Field>
            <Field>
              <DatePicker
                value={editDate}
                onChange={setEditDate}
                label="Date"
                id="edit-storage-date"
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="edit-storage-category"
                className="font-custom mb-2 block text-base font-semibold"
              >
                Storage Category
                <span className="font-custom text-muted-foreground ml-1 font-normal">
                  (optional)
                </span>
              </FieldLabel>
              <select
                id="edit-storage-category"
                aria-label="Storage category"
                value={editStorageCategory}
                onChange={(e) => setEditStorageCategory(e.target.value)}
                className="border-input bg-background text-foreground font-custom focus-visible:ring-primary h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select category</option>
                {STORAGE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <DialogFooter showCloseButton={false} className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="font-custom"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleEditSubmit}
              disabled={isEditPending}
              className="font-custom"
            >
              {isEditPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

export { StorageVoucher };
