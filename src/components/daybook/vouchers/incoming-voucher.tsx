import { memo, useCallback, useMemo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChevronDown,
  ChevronUp,
  Printer,
  Pencil,
  MapPin,
  User,
  Truck,
  Package,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { DetailRow } from './detail-row';
import { formatVoucherDate } from './format-date';
import type { IncomingVoucherData } from './types';
import type { VoucherFarmerInfo } from './types';
import { useEditIncomingGatePass } from '@/services/store-admin/incoming-gate-pass/useEditIncomingGatePass';
import { DatePicker } from '@/components/forms/date-picker';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';
import { formatDate, formatDateToISO } from '@/lib/helpers';
import { INCOMING_GATE_PASS_STAGES } from '@/types/incoming-gate-pass';

export interface IncomingVoucherProps extends VoucherFarmerInfo {
  voucher: IncomingVoucherData;
  farmerAddress?: string;
  farmerMobile?: string;
}

const IncomingVoucher = memo(function IncomingVoucher({
  voucher,
  farmerName,
  farmerAccount,
  farmerAddress,
  farmerMobile,
}: IncomingVoucherProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [stageInput, setStageInput] = useState('');
  /** dd.mm.yyyy — matches DatePicker */
  const [editDateValue, setEditDateValue] = useState(() =>
    voucher.date ? formatDate(new Date(voucher.date)) : formatDate(new Date())
  );

  const { mutate: editIncomingGatePass, isPending: isEditPending } =
    useEditIncomingGatePass();

  const canEdit = Boolean(voucher._id);

  const editStageOptions: Option<string>[] = useMemo(() => {
    const base = INCOMING_GATE_PASS_STAGES.map((value) => ({
      value,
      label: value,
      searchableText: value,
    }));
    const stage = voucher.stage?.trim();
    const allowedStages = INCOMING_GATE_PASS_STAGES as readonly string[];
    if (stage && !allowedStages.includes(stage)) {
      return [
        {
          value: stage,
          label: `${stage} (legacy)`,
          searchableText: stage,
        },
        ...base,
      ];
    }
    return base;
  }, [voucher.stage]);

  const resetEditFormFromVoucher = useCallback(() => {
    setManualInput(
      voucher.manualGatePassNumber != null
        ? String(voucher.manualGatePassNumber)
        : ''
    );
    setStageInput(voucher.stage ?? '');
    setEditDateValue(
      voucher.date ? formatDate(new Date(voucher.date)) : formatDate(new Date())
    );
  }, [voucher.manualGatePassNumber, voucher.stage, voucher.date]);

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (open) resetEditFormFromVoucher();
  };

  const handleSaveEdit = () => {
    if (!voucher._id || isEditPending) return;

    const payload: {
      manualGatePassNumber?: number;
      stage?: string;
      date?: string;
    } = {};

    const trimmedManual = manualInput.trim();
    if (trimmedManual !== '') {
      const n = Number(trimmedManual);
      if (!Number.isNaN(n)) payload.manualGatePassNumber = n;
    }

    const trimmedStage = stageInput.trim();
    if (trimmedStage !== '') payload.stage = trimmedStage;

    if (editDateValue.trim() !== '') {
      payload.date = formatDateToISO(editDateValue.trim());
    }

    editIncomingGatePass(
      {
        incomingGatePassId: voucher._id,
        ...payload,
      },
      {
        onSuccess: (res) => {
          if (res.success) setEditOpen(false);
        },
      }
    );
  };

  const bags = voucher.bagsReceived ?? 0;
  const stageLabel =
    voucher.stage != null && voucher.stage !== ''
      ? voucher.stage.replace(/_/g, ' ')
      : null;

  const handlePrint = async () => {
    // Open window synchronously so mobile popup blockers allow it
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(
        '<html><body style="font-family:sans-serif;padding:2rem;text-align:center;color:#666;">Generating PDF…</body></html>'
      );
    }
    setIsPrinting(true);
    try {
      const [{ pdf }, { IncomingVoucherPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/IncomingVoucherPdf'),
      ]);
      const blob = await pdf(
        <IncomingVoucherPdf
          voucher={voucher}
          farmerName={farmerName}
          farmerAccount={farmerAccount}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      if (printWindow) {
        printWindow.location.href = url;
      } else {
        window.location.href = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } finally {
      setIsPrinting(false);
    }
  };
  const linkedBy = voucher.createdBy;

  return (
    <Card className="border-border/40 hover:border-primary/30 overflow-hidden pt-0 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="px-3 pt-2 pb-3 sm:px-4 sm:pb-4">
        <CardHeader className="px-0 pt-2 pb-2 sm:pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                <h3 className="text-foreground font-custom text-base font-bold tracking-tight">
                  IGP{' '}
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
              {stageLabel != null && (
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/5 text-primary px-2 py-0.5 text-[10px] font-medium capitalize"
                >
                  {stageLabel}
                </Badge>
              )}
              {voucher.category != null && voucher.category !== '' && (
                <Badge
                  variant="default"
                  className="px-2 py-0.5 text-[10px] font-medium"
                >
                  {voucher.category}
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-[10px] font-medium"
              >
                {bags.toLocaleString('en-IN')} bags
              </Badge>
              {voucher.gradingSummary?.graded === true && (
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/5 text-primary px-2 py-0.5 text-[10px] font-medium"
                >
                  Graded
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DetailRow label="Farmer" value={farmerName ?? '—'} icon={User} />
          <DetailRow label="Account" value={`#${farmerAccount ?? '—'}`} />
          <DetailRow
            label="Truck"
            value={voucher.truckNumber ?? '—'}
            icon={Truck}
          />
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

          <div className="flex items-center gap-1">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditOpenChange(true)}
                className="h-8 w-8 p-0"
                aria-label="Edit incoming gate pass"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isPrinting}
              className="h-8 w-8 p-0"
              aria-label={isPrinting ? 'Generating PDF…' : 'Print gate pass'}
            >
              {isPrinting ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <Printer className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
          <DialogContent className="font-custom sm:max-w-md" showCloseButton>
            <DialogHeader>
              <DialogTitle className="font-custom text-xl font-bold">
                Edit incoming gate pass
              </DialogTitle>
              <DialogDescription className="font-custom text-muted-foreground/80 text-sm">
                Update manual gate pass number, stage, and date. Empty fields
                are not sent to the server.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label
                  htmlFor="igp-manual-number"
                  className="font-custom text-foreground/90 text-sm font-medium"
                >
                  Manual gate pass number
                </Label>
                <Input
                  id="igp-manual-number"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  placeholder="Optional"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="font-custom [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="igp-stage"
                  className="font-custom text-foreground/90 text-sm font-medium"
                >
                  Stage
                </Label>
                <SearchSelector
                  id="igp-stage"
                  options={editStageOptions}
                  placeholder="Select stage (optional)"
                  searchPlaceholder="Search stage..."
                  onSelect={(value) => setStageInput(value)}
                  value={stageInput}
                  className="w-full"
                  buttonClassName="w-full justify-between font-custom"
                />
              </div>

              <div className="font-custom">
                <DatePicker
                  id="igp-date"
                  label="Date"
                  value={editDateValue}
                  onChange={(v) => setEditDateValue(v)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="font-custom"
                onClick={() => setEditOpen(false)}
                disabled={isEditPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                className="font-custom font-bold"
                onClick={handleSaveEdit}
                disabled={isEditPending}
              >
                {isEditPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isExpanded && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <section>
                <h4 className="text-muted-foreground/70 mb-2 text-xs font-semibold tracking-wider uppercase">
                  Farmer Details
                </h4>
                <div className="bg-muted/30 grid grid-cols-1 gap-2 rounded-lg p-2 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailRow label="Name" value={farmerName ?? '—'} />
                  <DetailRow label="Mobile" value={farmerMobile ?? '—'} />
                  <DetailRow
                    label="Account"
                    value={`${farmerAccount ?? '—'}`}
                  />
                  <DetailRow
                    label="Address"
                    value={farmerAddress ?? '—'}
                    icon={MapPin}
                  />
                </div>
              </section>

              <Separator />

              <section>
                <h4 className="text-muted-foreground/70 mb-2.5 text-xs font-semibold tracking-wider uppercase">
                  Gate Pass Details
                </h4>
                <div className="bg-muted/30 grid grid-cols-1 gap-3 rounded-lg p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {voucher.category != null && voucher.category !== '' && (
                    <DetailRow label="Category" value={voucher.category} />
                  )}
                  {stageLabel != null && (
                    <DetailRow label="Stage" value={stageLabel} />
                  )}
                  <DetailRow
                    label="Pass Number"
                    value={`#${voucher.gatePassNo ?? '—'}`}
                  />
                  {voucher.manualGatePassNumber != null && (
                    <DetailRow
                      label="Manual Gate Pass No"
                      value={`#${voucher.manualGatePassNumber}`}
                    />
                  )}
                  <DetailRow
                    label="Bags Received"
                    value={(voucher.bagsReceived ?? 0).toLocaleString('en-IN')}
                  />
                  <DetailRow label="Created By" value={linkedBy?.name ?? '—'} />
                </div>

                {voucher.weightSlip != null && (
                  <div className="border-primary/20 bg-primary/5 mt-4 rounded-lg border p-3">
                    <h4 className="text-muted-foreground/70 mb-2.5 text-xs font-semibold tracking-wider uppercase">
                      Weight Slip
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <DetailRow
                        label="Slip No"
                        value={voucher.weightSlip.slipNumber ?? '—'}
                      />
                      <DetailRow
                        label="Gross (kg)"
                        value={(
                          voucher.weightSlip.grossWeightKg ?? 0
                        ).toLocaleString('en-IN')}
                      />
                      <DetailRow
                        label="Tare (kg)"
                        value={(
                          voucher.weightSlip.tareWeightKg ?? 0
                        ).toLocaleString('en-IN')}
                      />
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Net weight:{' '}
                      <span className="text-foreground font-semibold">
                        {(
                          (voucher.weightSlip.grossWeightKg ?? 0) -
                          (voucher.weightSlip.tareWeightKg ?? 0)
                        ).toLocaleString('en-IN')}{' '}
                        kg
                      </span>
                    </p>
                  </div>
                )}

                {voucher.remarks != null && voucher.remarks !== '' && (
                  <div className="mt-4">
                    <h4 className="text-muted-foreground/70 mb-2.5 text-xs font-semibold tracking-wider uppercase">
                      Remarks
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-foreground text-sm font-medium">
                        {voucher.remarks}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </Card>
  );
});

export { IncomingVoucher };
