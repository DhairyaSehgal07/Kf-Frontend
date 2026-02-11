import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface StorageFormFooterProps {
  formStep: 1 | 2;
  onReset: () => void;
  onStep2Back: () => void;
  isLoadingVoucher: boolean;
  voucherNumber: number | null;
  isFormValidStep1: boolean;
}

export const StorageFormFooter = memo(function StorageFormFooter({
  formStep,
  onReset,
  onStep2Back,
  isLoadingVoucher,
  voucherNumber,
  isFormValidStep1,
}: StorageFormFooterProps) {
  return (
    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:gap-4">
      {formStep === 1 && (
        <>
          <Button
            type="button"
            variant="outline"
            className="font-custom order-2 w-full sm:order-1 sm:w-auto"
            onClick={onReset}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="font-custom order-1 w-full px-8 font-bold sm:order-2 sm:w-auto"
            disabled={
              isLoadingVoucher || voucherNumber == null || !isFormValidStep1
            }
          >
            Next: Enter date, location & remarks
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </>
      )}
      {formStep === 2 && (
        <>
          <Button
            type="button"
            variant="outline"
            className="font-custom order-2 w-full sm:order-1 sm:w-auto"
            onClick={onStep2Back}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="font-custom order-1 w-full px-8 font-bold sm:order-2 sm:w-auto"
          >
            Next: Review summary
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
});
