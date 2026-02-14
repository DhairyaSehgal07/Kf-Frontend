import { Fragment, memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { GradingGatePassCell } from '@/components/forms/storage/grading-gate-pass-cell';
import type { GradingGatePass } from '@/types/grading-gate-pass';
import type { StorageDisplayGroup } from '@/components/forms/storage/storage-form-utils';
import type { StoragePassState } from '@/components/forms/storage/storage-form-types';
import { getOrderDetailForSize } from '@/components/forms/storage/storage-form-utils';

export interface StorageAllocationTableProps {
  displayGroups: StorageDisplayGroup[];
  visibleSizes: string[];
  pass: StoragePassState;
  onCellClick: (gradingPass: GradingGatePass, size: string) => void;
  onQuickRemove: (gradingPassId: string, size: string) => void;
  selectedOrders: Set<string>;
  onOrderToggle: (passId: string) => void;
  isLoadingPasses: boolean;
  hasGradingData: boolean;
  hasFilteredData: boolean;
  varietyFilter: string;
}

export const StorageAllocationTable = memo(function StorageAllocationTable({
  displayGroups,
  visibleSizes,
  pass,
  onCellClick,
  onQuickRemove,
  selectedOrders,
  onOrderToggle,
  isLoadingPasses,
  hasGradingData,
  hasFilteredData,
  varietyFilter,
}: StorageAllocationTableProps) {
  return (
    <div className="border-border/40 rounded-md border pt-2">
      {!isLoadingPasses &&
        hasGradingData &&
        hasFilteredData &&
        visibleSizes.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-custom text-foreground/80 w-30 font-medium">
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
                {displayGroups.map((group) => (
                  <Fragment key={group.groupKey}>
                    <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                      <TableCell
                        colSpan={visibleSizes.length + 1}
                        className="font-custom text-primary py-2.5 font-semibold"
                      >
                        {group.groupLabel}
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
                                onCheckedChange={() => onOrderToggle(gp._id)}
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
                          const detail = getOrderDetailForSize(gp, size);
                          const removed =
                            pass.removedQuantities[gp._id]?.[size] ?? 0;
                          if (!detail) {
                            return (
                              <TableCell key={size} className="py-1">
                                <div className="bg-muted/30 border-border/40 h-14.5 w-17.5 rounded-md border" />
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell key={size} className="py-1">
                              <GradingGatePassCell
                                variety={gp.variety}
                                currentQuantity={detail.currentQuantity}
                                initialQuantity={detail.initialQuantity}
                                removedQuantity={removed}
                                onClick={() => onCellClick(gp, size)}
                                onQuickRemove={() =>
                                  onQuickRemove(gp._id, size)
                                }
                                disabled={detail.currentQuantity <= 0}
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
      {!isLoadingPasses &&
        hasGradingData &&
        !hasFilteredData &&
        (varietyFilter.trim() === '' ? (
          <p className="font-custom text-muted-foreground py-4 text-center text-sm">
            Select a variety from the filter above to see grading passes.
          </p>
        ) : (
          <p className="font-custom text-muted-foreground py-4 text-center text-sm">
            No passes match filters or no order details.
          </p>
        ))}
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
  );
});
