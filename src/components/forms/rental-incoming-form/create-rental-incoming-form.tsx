import { memo, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  RentalIncomingFormBase,
  type RentalIncomingFormSubmitPayload,
} from '@/components/forms/rental-incoming-form/rental-incoming-form-base';
import { useCreateRentalIncomingGatePass } from '@/services/store-admin/rental-incoming-gate-pass/useCreateRentalIncomingGatePass';
import { useGetReceiptVoucherNumber } from '@/services/store-admin/functions/useGetVoucherNumber';

export const CreateRentalIncomingForm = memo(
  function CreateRentalIncomingForm() {
    const navigate = useNavigate();
    const createGatePass = useCreateRentalIncomingGatePass();
    const { data: nextVoucherNumber, isLoading: isLoadingVoucher } =
      useGetReceiptVoucherNumber('rental-storage-gate-pass');

    const voucherNumberDisplay = useMemo(
      () =>
        isLoadingVoucher && nextVoucherNumber == null
          ? '...'
          : nextVoucherNumber != null
            ? `#${nextVoucherNumber}`
            : '—',
      [isLoadingVoucher, nextVoucherNumber]
    );

    const handleSubmit = async (payload: RentalIncomingFormSubmitPayload) => {
      await createGatePass.mutateAsync({
        farmerStorageLinkId: payload.farmerStorageLinkId,
        date: payload.date,
        variety: payload.variety,
        ...(payload.manualRentalGatePassNumber != null &&
        payload.manualRentalGatePassNumber.trim() !== ''
          ? {
              manualRentalGatePassNumber:
                payload.manualRentalGatePassNumber.trim(),
            }
          : {}),
        bagSizes: payload.bagSizes,
      });
      navigate({ to: '/store-admin/daybook' });
    };

    return (
      <RentalIncomingFormBase
        mode="create"
        voucherNumberDisplay={voucherNumberDisplay}
        isSubmitting={createGatePass.isPending}
        gatePassNoForSummary={nextVoucherNumber ?? 0}
        isLoadingVoucher={isLoadingVoucher}
        onSubmit={handleSubmit}
      />
    );
  }
);

export default CreateRentalIncomingForm;
