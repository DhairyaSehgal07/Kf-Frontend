import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GradingFiltersBar } from '@/components/forms/storage/GradingFiltersBar';
import { StorageAllocationTable } from '@/components/forms/storage/StorageAllocationTable';
import type { GradingGatePass } from '@/types/grading-gate-pass';
import type { StorageDisplayGroup } from '@/components/forms/storage/storage-form-utils';
import type { StoragePassState } from '@/components/forms/storage/storage-form-types';
import type { GradingFiltersBarProps } from '@/components/forms/storage/GradingFiltersBar';

export interface Step1BagsCardProps {
  pass: StoragePassState;
  showFilters: boolean;
  filterBarProps: GradingFiltersBarProps;
  displayGroups: StorageDisplayGroup[];
  visibleSizes: string[];
  selectedOrders: Set<string>;
  onOrderToggle: (passId: string) => void;
  onCellClick: (gradingPass: GradingGatePass, size: string) => void;
  onQuickRemove: (gradingPassId: string, size: string) => void;
  isLoadingPasses: boolean;
  hasGradingData: boolean;
  hasFilteredData: boolean;
  varietyFilter: string;
}

export const Step1BagsCard = memo(function Step1BagsCard({
  pass,
  showFilters,
  filterBarProps,
  displayGroups,
  visibleSizes,
  selectedOrders,
  onOrderToggle,
  onCellClick,
  onQuickRemove,
  isLoadingPasses,
  hasGradingData,
  hasFilteredData,
  varietyFilter,
}: Step1BagsCardProps) {
  return (
    <Card key={pass.id} className="relative">
      <CardContent className="space-y-4">
        {showFilters && <GradingFiltersBar {...filterBarProps} />}
        <StorageAllocationTable
          displayGroups={displayGroups}
          visibleSizes={visibleSizes}
          pass={pass}
          onCellClick={onCellClick}
          onQuickRemove={onQuickRemove}
          selectedOrders={selectedOrders}
          onOrderToggle={onOrderToggle}
          isLoadingPasses={isLoadingPasses}
          hasGradingData={hasGradingData}
          hasFilteredData={hasFilteredData}
          varietyFilter={varietyFilter}
        />
      </CardContent>
    </Card>
  );
});
