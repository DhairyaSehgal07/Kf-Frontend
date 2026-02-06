import { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GradingOrderDetailRow } from './types';

export interface GradingVoucherCalculationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gatePassNo: string | number | undefined;
  allOrderDetails: GradingOrderDetailRow[];
  totalQty: number;
  totalInitial: number;
  totalGradedWeightKg: number;
  incomingNetKg: number | undefined;
  totalGradedWeightPercent: number | undefined;
  wastageKg: number | undefined;
  wastagePercent: number | undefined;
  percentSum: number | undefined;
  hasDiscrepancy: boolean;
  discrepancyValue: number | undefined;
}

const fmt = (n: number, decimals = 1) =>
  n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const GradingVoucherCalculationsDialog = memo(
  function GradingVoucherCalculationsDialog({
    open,
    onOpenChange,
    gatePassNo,
    allOrderDetails,
    totalQty: _totalQty,
    totalInitial,
    totalGradedWeightKg,
    incomingNetKg,
    totalGradedWeightPercent,
    wastageKg,
    wastagePercent,
    percentSum,
    hasDiscrepancy,
    discrepancyValue,
  }: GradingVoucherCalculationsDialogProps) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="font-custom max-h-[90vh flex flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-custom text-lg font-bold">
              Calculations — GGP #{gatePassNo ?? '—'}
            </DialogTitle>
          </DialogHeader>
          <Tabs
            defaultValue="step1"
            className="flex flex-1 flex-col overflow-hidden"
          >
            <TabsList className="font-custom bg-muted h-auto w-full flex-wrap gap-1 p-1">
              <TabsTrigger value="step1" className="text-xs">
                Step 1
              </TabsTrigger>
              <TabsTrigger value="step2" className="text-xs">
                Step 2
              </TabsTrigger>
              <TabsTrigger value="step3" className="text-xs">
                Step 3
              </TabsTrigger>
              <TabsTrigger value="step4" className="text-xs">
                Step 4
              </TabsTrigger>
              <TabsTrigger value="step5" className="text-xs">
                Step 5
              </TabsTrigger>
              <TabsTrigger value="step6" className="text-xs">
                Step 6
              </TabsTrigger>
            </TabsList>
            <div className="mt-3 flex-1 overflow-y-auto text-sm">
              <TabsContent value="step1" className="mt-0 outline-none">
                <h4 className="text-muted-foreground/80 mb-2 font-semibold">
                  Step 1: Total graded weight from order details
                </h4>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-muted-foreground mb-2 text-xs">
                    For each row: Initial qty × Weight per bag (kg) = Line total
                    (kg)
                  </p>
                  <ul className="space-y-1 text-xs">
                    {allOrderDetails.map((od, idx) => {
                      const qty = od.initialQuantity ?? 0;
                      const wt = od.weightPerBagKg ?? 0;
                      const line = qty * wt;
                      return (
                        <li key={`${od.size}-${od.bagType}-${idx}`}>
                          {od.size ?? '—'} ({od.bagType ?? '—'}): {qty} ×{' '}
                          {fmt(wt, 2)} = {fmt(line, 2)} kg
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-primary mt-2 font-medium">
                    Sum of line totals = Total graded weight ={' '}
                    {fmt(totalGradedWeightKg, 2)} kg
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Total bags (initial): {totalInitial.toLocaleString('en-IN')}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="step2" className="mt-0 outline-none">
                <h4 className="text-muted-foreground/80 mb-2 font-semibold">
                  Step 2: Net incoming weight
                </h4>
                {incomingNetKg != null && incomingNetKg > 0 ? (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="font-medium">
                      Net weight (from weight slip) = {fmt(incomingNetKg, 2)} kg
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    No net weight data available for this entry.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="step3" className="mt-0 outline-none">
                <h4 className="text-muted-foreground/80 mb-2 font-semibold">
                  Step 3: Total graded weight as % of net
                </h4>
                {totalGradedWeightPercent !== undefined ? (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="font-mono text-xs">
                      Total graded weight % = (Total graded weight ÷ Net weight)
                      × 100
                    </p>
                    <p className="mt-1 font-mono text-xs">
                      = ({fmt(totalGradedWeightKg, 2)} ÷{' '}
                      {fmt(incomingNetKg ?? 0, 2)}) × 100 ={' '}
                      {fmt(totalGradedWeightPercent)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    Cannot compute (net weight or graded weight missing).
                  </p>
                )}
              </TabsContent>

              <TabsContent value="step4" className="mt-0 outline-none">
                <h4 className="text-muted-foreground/80 mb-2 font-semibold">
                  Step 4: Wastage (entry-level)
                </h4>
                {wastageKg !== undefined ? (
                  <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-3">
                    <p className="font-medium">
                      Wastage = {fmt(wastageKg, 2)} kg
                      {wastagePercent !== undefined && (
                        <span className="text-muted-foreground">
                          {' '}
                          ({fmt(wastagePercent)}% of net)
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    No wastage data for this entry.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="step5" className="mt-0 outline-none">
                <h4 className="text-muted-foreground/80 mb-2 font-semibold">
                  Step 5: Graded % + Wastage %
                </h4>
                {percentSum != null ? (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="font-mono text-xs">
                      Graded % + Wastage % ={' '}
                      {totalGradedWeightPercent != null &&
                      wastagePercent != null
                        ? `${fmt(totalGradedWeightPercent)} + ${fmt(wastagePercent)}`
                        : '—'}{' '}
                      = {fmt(percentSum)}%
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Expected total: 100%
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    Cannot compute (graded % or wastage % missing).
                  </p>
                )}
              </TabsContent>

              <TabsContent value="step6" className="mt-0 outline-none">
                <h4 className="text-muted-foreground/80 mb-2 font-semibold">
                  Step 6: Discrepancy
                </h4>
                {hasDiscrepancy && discrepancyValue !== undefined ? (
                  <div className="border-destructive bg-destructive/10 rounded-lg border-2 p-3">
                    <p className="font-medium">
                      Discrepancy = 100 − {fmt(percentSum ?? 0)} ={' '}
                      {discrepancyValue >= 0 ? '+' : ''}
                      {fmt(discrepancyValue)}%
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Graded % + Wastage % does not equal 100% (within
                      tolerance).
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    No discrepancy — Graded % + Wastage % equals 100% (within
                    tolerance).
                  </p>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }
);

export { GradingVoucherCalculationsDialog };
