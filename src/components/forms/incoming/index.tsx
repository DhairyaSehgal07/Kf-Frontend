import { memo, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/forms/date-picker';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';
import { AddFarmerModal } from '@/components/forms/add-farmer-modal';
import { SummarySheet } from './summary-sheet';
import { useGetReceiptVoucherNumber } from '@/services/store-admin/functions/useGetVoucherNumber';
import { useGetAllFarmers } from '@/services/store-admin/functions/useGetAllFarmers';
import { useCreateIncomingGatePass } from '@/services/store-admin/incoming-gate-pass/useCreateIncomingGatePass';
import { formatDate, formatDateToISO } from '@/lib/helpers';

// Common potato varieties
const POTATO_VARIETIES: Option<string>[] = [
  { label: 'Lady Rosetta', value: 'Lady Rosetta' },
  { label: 'Sante', value: 'Sante' },
  { label: 'Frito Lay', value: 'Frito Lay' },
  { label: 'Diamond', value: 'Diamond' },
  { label: 'Kufri Pukhraj', value: 'Kufri Pukhraj' },
  { label: 'Kufri Jyoti', value: 'Kufri Jyoti' },
  { label: 'Kufri Bahar', value: 'Kufri Bahar' },
  { label: 'Other', value: 'Other' },
];

export const IncomingForm = memo(function IncomingForm() {
  const navigate = useNavigate();
  const { data: voucherNumber, isLoading: isLoadingVoucher } =
    useGetReceiptVoucherNumber('incoming-gate-pass');
  const {
    data: farmerLinks,
    isLoading: isLoadingFarmers,
    refetch: refetchFarmers,
  } = useGetAllFarmers();
  const { mutate: createIncomingGatePass, isPending } =
    useCreateIncomingGatePass();

  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [isSummarySheetOpen, setIsSummarySheetOpen] = useState(false);

  // Format voucher number for display
  const voucherNumberDisplay = useMemo(() => {
    if (!voucherNumber) return null;
    return `#${voucherNumber}`;
  }, [voucherNumber]);

  // Use voucher number directly as gatePassNo
  const gatePassNo = voucherNumber ?? 0;

  // Transform farmer links to SearchSelector options
  const farmerOptions: Option<string>[] = useMemo(() => {
    if (!farmerLinks) return [];
    return farmerLinks
      .filter((link) => link.isActive)
      .map((link) => ({
        value: link._id,
        label: `${link.farmerId.name} (Account #${link.accountNumber})`,
        searchableText: `${link.farmerId.name} ${link.accountNumber} ${link.farmerId.mobileNumber} ${link.farmerId.address}`,
      }));
  }, [farmerLinks]);

  const formSchema = useMemo(
    () =>
      z.object({
        farmerStorageLinkId: z.string().min(1, 'Please select a farmer'),
        date: z.string().min(1, 'Date is required'),
        variety: z.string().min(1, 'Please select a variety'),
        truckNumber: z
          .string()
          .transform((val) => val.trim().toUpperCase())
          .refine((val) => val.length > 0, {
            message: 'Truck number is required',
          }),

        bagsReceived: z
          .number()
          .positive('Bags received must be a positive number')
          .int('Bags received must be a whole number'),
      }),
    []
  );

  const form = useForm({
    defaultValues: {
      farmerStorageLinkId: '',
      date: formatDate(new Date()),
      variety: '',
      truckNumber: '',
      bagsReceived: 0,
    },
    validators: {
      onChange: formSchema,
      onBlur: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!gatePassNo) {
        return;
      }

      createIncomingGatePass(
        {
          farmerStorageLinkId: value.farmerStorageLinkId,
          gatePassNo,
          date: formatDateToISO(value.date),
          variety: value.variety,
          truckNumber: value.truckNumber,
          bagsReceived: value.bagsReceived,
        },
        {
          onSuccess: () => {
            form.reset();
            setSelectedFarmerId('');
            setIsSummarySheetOpen(false);
            navigate({ to: '/store-admin/daybook' });
          },
        }
      );
    },
  });

  const handleFarmerSelect = (value: string) => {
    setSelectedFarmerId(value);
    form.setFieldValue('farmerStorageLinkId', value);
  };

  const handleFarmerAdded = () => {
    refetchFarmers();
  };

  // Get selected farmer details for summary
  const selectedFarmer = useMemo(() => {
    if (!selectedFarmerId || !farmerLinks) return null;
    return farmerLinks.find((link) => link._id === selectedFarmerId) ?? null;
  }, [selectedFarmerId, farmerLinks]);

  // Handle Next button click - validate and open summary sheet
  const handleNextClick = () => {
    form.validateAllFields('submit');
    const formState = form.state;
    if (formState.isValid) {
      setIsSummarySheetOpen(true);
    }
  };

  // Handle final submission from summary sheet
  const handleFinalSubmit = () => {
    form.handleSubmit();
  };

  return (
    <main className="font-custom mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <h1 className="font-custom text-3xl font-bold text-[#333] sm:text-4xl dark:text-white">
          Create Incoming Order
        </h1>

        {/* Voucher Number Badge */}
        {isLoadingVoucher ? (
          <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
            <span className="font-custom text-primary text-sm font-medium">
              Loading voucher number...
            </span>
          </div>
        ) : voucherNumberDisplay ? (
          <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
            <span className="font-custom text-primary text-sm font-medium">
              VOUCHER NO: {voucherNumberDisplay}
            </span>
          </div>
        ) : null}
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <FieldGroup className="space-y-6">
          {/* Farmer Selection */}
          <form.Field
            name="farmerStorageLinkId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <FieldLabel
                        htmlFor="farmer-select"
                        className="font-custom mb-2 block text-base font-semibold"
                      >
                        Enter Account Name (search and select)
                      </FieldLabel>
                      <SearchSelector
                        id="farmer-select"
                        options={farmerOptions}
                        placeholder="Search or Create Farmer"
                        searchPlaceholder="Search by name, account number, or mobile..."
                        onSelect={handleFarmerSelect}
                        defaultValue={selectedFarmerId}
                        loading={isLoadingFarmers}
                        loadingMessage="Loading farmers..."
                        emptyMessage="No farmers found"
                        className="w-full"
                        buttonClassName="w-full justify-between"
                      />
                    </div>
                    <AddFarmerModal
                      links={farmerLinks ?? []}
                      onFarmerAdded={handleFarmerAdded}
                    />
                  </div>
                  {isInvalid && (
                    <FieldError
                      errors={
                        field.state.meta.errors as Array<
                          { message?: string } | undefined
                        >
                      }
                    />
                  )}
                </Field>
              );
            }}
          />

          {/* Variety Selection */}
          <form.Field
            name="variety"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="border-primary/30 bg-primary/5 space-y-2 rounded-lg border p-4">
                    <FieldLabel
                      htmlFor="variety-select"
                      className="font-custom block text-base font-semibold"
                    >
                      Select Variety
                    </FieldLabel>
                    <p className="font-custom text-sm text-[#6f6f6f]">
                      Choose the potato variety for this order
                    </p>
                    <SearchSelector
                      id="variety-select"
                      options={POTATO_VARIETIES}
                      placeholder="Select a variety"
                      searchPlaceholder="Search variety..."
                      onSelect={(value) => field.handleChange(value)}
                      defaultValue={field.state.value}
                      className="w-full"
                      buttonClassName="w-full justify-between"
                    />
                  </div>
                  {isInvalid && (
                    <FieldError
                      errors={
                        field.state.meta.errors as Array<
                          { message?: string } | undefined
                        >
                      }
                    />
                  )}
                </Field>
              );
            }}
          />

          {/* Date Selection */}
          <form.Field
            name="date"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <DatePicker
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    label="Date of Submission"
                    id="date-of-submission"
                  />
                  {isInvalid && (
                    <FieldError
                      errors={
                        field.state.meta.errors as Array<
                          { message?: string } | undefined
                        >
                      }
                    />
                  )}
                </Field>
              );
            }}
          />

          {/* Truck Number */}
          <form.Field
            name="truckNumber"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="font-custom text-base font-semibold"
                  >
                    Truck Number
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter truck number"
                    className="font-custom"
                  />
                  {isInvalid && (
                    <FieldError
                      errors={
                        field.state.meta.errors as Array<
                          { message?: string } | undefined
                        >
                      }
                    />
                  )}
                </Field>
              );
            }}
          />

          {/* Bags Received */}
          <form.Field
            name="bagsReceived"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="font-custom text-base font-semibold"
                  >
                    Bags Received
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="1"
                    step="1"
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === ''
                          ? 0
                          : parseInt(e.target.value, 10) || 0
                      )
                    }
                    aria-invalid={isInvalid}
                    placeholder="Enter number of bags"
                    className="font-custom"
                  />
                  {isInvalid && (
                    <FieldError
                      errors={
                        field.state.meta.errors as Array<
                          { message?: string } | undefined
                        >
                      }
                    />
                  )}
                </Field>
              );
            }}
          />
        </FieldGroup>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="font-custom"
            onClick={() => {
              form.reset();
              setSelectedFarmerId('');
            }}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="default"
            size="lg"
            className="font-custom px-8 font-bold"
            disabled={isPending || isLoadingVoucher || !gatePassNo}
            onClick={handleNextClick}
          >
            Next
          </Button>
        </div>
      </form>

      {/* Summary Sheet */}
      <SummarySheet
        open={isSummarySheetOpen}
        onOpenChange={setIsSummarySheetOpen}
        voucherNumberDisplay={voucherNumberDisplay}
        selectedFarmer={selectedFarmer}
        formValues={{
          date: form.state.values.date,
          variety: form.state.values.variety,
          truckNumber: form.state.values.truckNumber,
          bagsReceived: form.state.values.bagsReceived,
        }}
        isPending={isPending}
        isLoadingVoucher={isLoadingVoucher}
        gatePassNo={gatePassNo}
        onSubmit={handleFinalSubmit}
      />
    </main>
  );
});

export default IncomingForm;
