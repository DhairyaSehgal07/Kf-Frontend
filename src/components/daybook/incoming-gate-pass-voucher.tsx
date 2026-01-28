import { memo, useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Printer } from 'lucide-react';
import type { IncomingGatePassWithLink } from '@/types/incoming-gate-pass';

interface IncomingGatePassVoucherProps {
  voucher: IncomingGatePassWithLink;
}

const DetailRow = memo(function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-muted-foreground mb-1 text-xs">{label}</div>
      <div className="font-custom text-foreground text-sm font-semibold lg:text-base">
        {value}
      </div>
    </div>
  );
});

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function IncomingGatePassVoucher({ voucher }: IncomingGatePassVoucherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const farmer = voucher.farmerStorageLinkId.farmerId;
  const linkedBy = voucher.farmerStorageLinkId.linkedById;

  const formattedDate = useMemo(() => formatDate(voucher.date), [voucher.date]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handlePrint = useCallback(() => {
    // Placeholder – can be wired to a nicer print layout later
    window.print();
  }, []);

  const readableStatus = useMemo(
    () => voucher.status.replace(/_/g, ' '),
    [voucher.status]
  );

  return (
    <Card className="hover:border-primary/40 overflow-hidden rounded-xl transition-all duration-200 ease-in-out hover:shadow-md">
      <CardHeader className="pb-4 sm:pb-5">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary mt-0.5 h-2 w-2 shrink-0 rounded-full" />
            <div>
              <h2 className="font-custom text-foreground text-base font-bold sm:text-lg lg:text-xl">
                Incoming Gate Pass{' '}
                <span className="text-primary">#{voucher.gatePassNo}</span>
              </h2>
              <p className="font-custom text-muted-foreground text-xs sm:text-sm">
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <div className="bg-muted text-muted-foreground rounded-full px-3 py-1.5 text-xs sm:text-sm">
              Status:{' '}
              <span className="text-foreground font-semibold">
                {readableStatus}
              </span>
            </div>
            <div className="bg-secondary rounded-full px-3 py-1.5 text-xs sm:text-sm">
              <span className="text-muted-foreground">Bags:</span>{' '}
              <span className="font-custom text-foreground text-sm font-semibold">
                {voucher.bagsReceived.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Key details */}
        <div className="mb-4 grid grid-cols-2 gap-4 sm:mb-5 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          <DetailRow label="Farmer" value={farmer.name} />
          <DetailRow
            label="Farmer A/c"
            value={`#${voucher.farmerStorageLinkId.accountNumber}`}
          />
          <DetailRow label="Truck Number" value={voucher.truckNumber} />
          <DetailRow label="Variety" value={voucher.variety} />
        </div>

        {/* Header actions */}
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpanded}
            className="w-full sm:w-auto"
          >
            <span>{isExpanded ? 'Less details' : 'More details'}</span>
            {isExpanded ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>

          <div className="flex w-full justify-end gap-2 sm:w-auto sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              aria-label="Print gate pass"
            >
              <Printer className="text-muted-foreground h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-5 sm:pb-6">
          {/* Farmer details */}
          <section className="mb-5 sm:mb-6">
            <h3 className="font-custom text-foreground mb-3 text-base font-semibold sm:text-lg">
              Farmer details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Name" value={farmer.name} />
              <DetailRow label="Mobile" value={farmer.mobileNumber} />
              <DetailRow
                label="Account number"
                value={`${voucher.farmerStorageLinkId.accountNumber}`}
              />
              <DetailRow label="Address" value={farmer.address} />
            </div>
          </section>

          <Separator className="my-4 sm:my-5" />

          {/* Gate pass info */}
          <section className="mb-4 sm:mb-5">
            <h3 className="font-custom text-foreground mb-3 text-base font-semibold sm:text-lg">
              Gate pass info
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow
                label="Gate pass number"
                value={`#${voucher.gatePassNo}`}
              />
              <DetailRow label="Status" value={readableStatus} />
              <DetailRow
                label="Total bags received"
                value={voucher.bagsReceived.toLocaleString('en-IN')}
              />
              <DetailRow
                label="Total graded bags"
                value={voucher.gradingSummary.totalGradedBags.toLocaleString(
                  'en-IN'
                )}
              />
              <DetailRow label="Linked by" value={linkedBy.name} />
            </div>
          </section>
        </CardContent>
      )}
    </Card>
  );
}

export default memo(IncomingGatePassVoucher);
