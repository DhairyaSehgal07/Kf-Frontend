import { memo } from 'react';
import { ChevronRight } from 'lucide-react';

export interface StorageFormStepIndicatorProps {
  formStep: 1 | 2;
}

export const StorageFormStepIndicator = memo(function StorageFormStepIndicator({
  formStep,
}: StorageFormStepIndicatorProps) {
  return (
    <div className="font-custom text-muted-foreground flex items-center gap-2 text-sm">
      <span className={formStep === 1 ? 'text-foreground font-semibold' : ''}>
        Step 1: Bags
      </span>
      <ChevronRight className="h-4 w-4 shrink-0" />
      <span className={formStep === 2 ? 'text-foreground font-semibold' : ''}>
        Step 2: Date, location & remarks
      </span>
    </div>
  );
});
