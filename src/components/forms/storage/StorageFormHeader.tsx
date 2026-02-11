import { memo } from 'react';

export interface StorageFormHeaderProps {
  varietySelected: boolean;
  isLoadingVoucher: boolean;
  voucherNumberDisplay: string | null;
}

export const StorageFormHeader = memo(function StorageFormHeader({
  varietySelected,
  isLoadingVoucher,
  voucherNumberDisplay,
}: StorageFormHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <h1 className="font-custom text-3xl font-bold text-[#333] sm:text-4xl dark:text-white">
        Create Storage Gate Pass
      </h1>

      {!varietySelected ? (
        <div className="font-custom text-muted-foreground text-sm">
          Select a variety from the filter below to continue.
        </div>
      ) : isLoadingVoucher ? (
        <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
          <span className="font-custom text-primary text-sm font-medium">
            Loading voucher number...
          </span>
        </div>
      ) : voucherNumberDisplay ? (
        <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
          <span className="font-custom text-primary text-sm font-medium">
            Storage Gate Pass {voucherNumberDisplay}
          </span>
        </div>
      ) : null}
    </div>
  );
});
