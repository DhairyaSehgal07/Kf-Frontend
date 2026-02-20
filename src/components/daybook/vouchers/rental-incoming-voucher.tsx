import { memo, useMemo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronDown,
  ChevronUp,
  Printer,
  Package,
  MapPin,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { DetailRow } from './detail-row';
import { formatVoucherDate } from './format-date';
import type {
  RentalIncomingGatePass,
  RentalIncomingGatePassBagSizeItem,
  RentalIncomingGatePassBagLocation,
} from '@/types/rental-incoming-gate-pass';

interface RentalIncomingVoucherProps {
  entry: RentalIncomingGatePass;
}

function formatLocation(
  loc: RentalIncomingGatePassBagLocation | undefined
): string {
  if (!loc) return '—';
  return `${loc.chamber}/${loc.floor}/${loc.row}`;
}

const RentalIncomingVoucher = memo(function RentalIncomingVoucher({
  entry,
}: RentalIncomingVoucherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const preferenceSizes: string[] = useMemo(() => [], []);

  const bagSizesOrdered = useMemo(() => {
    const bagSizes = entry.bagSizes ?? [];
    if (preferenceSizes.length === 0) return bagSizes;
    const orderMap = new Map(
      preferenceSizes.map((size: string, i: number) => [size.trim(), i])
    );
    return [...bagSizes].sort((a, b) => {
      const nameA = (a.name ?? '').trim();
      const nameB = (b.name ?? '').trim();
      const idxA = orderMap.get(nameA) ?? Infinity;
      const idxB = orderMap.get(nameB) ?? Infinity;
      return idxA - idxB;
    });
  }, [entry.bagSizes, preferenceSizes]);

  const handlePrintPdf = () => {
    toast.info('PDF for rental gate pass is not available yet.');
  };

  const farmer = entry.farmerStorageLinkId;
  const farmerName = farmer?.name ?? '—';
  const farmerAddress = farmer?.address ?? '—';
  const farmerMobile = farmer?.mobileNumber ?? '—';
  const accountNumber = farmer?.accountNumber ?? '—';

  const totalInitial = bagSizesOrdered.reduce(
    (s, b) => s + (b.initialQuantity ?? 0),
    0
  );
  const totalCurrent = bagSizesOrdered.reduce(
    (s, b) => s + (b.currentQuantity ?? 0),
    0
  );
  const lotNo =
    totalInitial > 0
      ? `${entry.gatePassNo}/${totalInitial}`
      : `${entry.gatePassNo}/—`;

  const variety = entry.variety ?? '—';
  const status = (entry.status ?? '—').replace(/_/g, ' ');

  return (
    <Card className="border-border/40 hover:border-primary/30 overflow-hidden pt-0 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="w-full px-4 py-4 sm:px-5 sm:py-5">
        <CardHeader className="px-0 pt-0 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                <h3 className="text-foreground font-custom text-base font-bold tracking-tight">
                  RGP{' '}
                  <span className="text-primary">
                    #{entry.gatePassNo ?? '—'}
                  </span>
                </h3>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {formatVoucherDate(entry.date)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge
                variant="secondary"
                className="px-2.5 py-1 text-[10px] font-medium"
              >
                {totalInitial.toLocaleString('en-IN')} bags
              </Badge>
              <Badge
                variant="outline"
                className="px-2.5 py-1 text-[10px] font-medium capitalize"
              >
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <div className="mb-4 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <DetailRow label="Farmer" value={farmerName} icon={User} />
          <DetailRow label="Account" value={`#${accountNumber}`} />
          <DetailRow label="Variety" value={variety} icon={Package} />
          <DetailRow label="Lot No" value={lotNo} />
        </div>

        <div className="border-border/50 flex w-full items-center justify-between border-t pt-4">
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

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintPdf}
              className="h-8 w-8 p-0"
              aria-label="Print gate pass"
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator className="my-5" />
            <div className="w-full space-y-5">
              <section className="w-full">
                <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                  Farmer Details
                </h4>
                <div className="bg-muted/30 grid w-full grid-cols-1 gap-3 rounded-lg p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailRow label="Name" value={farmerName} />
                  <DetailRow label="Mobile" value={farmerMobile} />
                  <DetailRow label="Account" value={`#${accountNumber}`} />
                  <DetailRow
                    label="Address"
                    value={farmerAddress}
                    icon={MapPin}
                  />
                  <DetailRow
                    label="Created By"
                    value={entry.createdBy?.name ?? '—'}
                  />
                </div>
              </section>

              {bagSizesOrdered.length > 0 && (
                <section className="w-full">
                  <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                    Order Details
                  </h4>
                  <div className="border-border w-full overflow-hidden rounded-lg border shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/60 hover:bg-muted/60 border-border/50 font-custom">
                          <TableHead className="text-muted-foreground font-custom text-xs font-semibold tracking-wider uppercase">
                            Size
                          </TableHead>
                          <TableHead className="text-muted-foreground font-custom text-xs font-semibold tracking-wider uppercase">
                            Location
                          </TableHead>
                          <TableHead className="text-muted-foreground font-custom text-right text-xs font-semibold tracking-wider uppercase">
                            Qty
                          </TableHead>
                          <TableHead className="text-muted-foreground font-custom text-right text-xs font-semibold tracking-wider uppercase">
                            Initial
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-custom">
                        {(
                          bagSizesOrdered as RentalIncomingGatePassBagSizeItem[]
                        ).map((bag, idx) => (
                          <TableRow
                            key={`${bag.name}-${idx}`}
                            className="border-border/50 bg-background hover:bg-background"
                          >
                            <TableCell className="text-foreground font-medium">
                              {bag.name ?? '—'}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {formatLocation(bag.location)}
                            </TableCell>
                            <TableCell className="text-foreground text-right">
                              {(bag.currentQuantity ?? 0).toLocaleString(
                                'en-IN'
                              )}
                            </TableCell>
                            <TableCell className="text-foreground text-right">
                              {(bag.initialQuantity ?? 0).toLocaleString(
                                'en-IN'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-primary bg-primary/10 hover:bg-primary/10 border-t-2">
                          <TableCell className="font-custom text-primary font-bold">
                            Total
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            —
                          </TableCell>
                          <TableCell className="font-custom text-primary text-right font-bold">
                            {totalCurrent.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="font-custom text-primary text-right font-bold">
                            {totalInitial.toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
});

export { RentalIncomingVoucher };
