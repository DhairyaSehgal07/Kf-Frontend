import { memo, useMemo, useState } from 'react';
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
import { useGetReceiptVoucherNumber } from '@/services/store-admin/functions/useGetVoucherNumber';
import { useCreateGradingGatePass } from '@/services/store-admin/grading-gate-pass/useCreateGradingGatePass';
import { useStore } from '@/stores/store';
import { formatDate, formatDateToISO } from '@/lib/helpers';

import { GRADING_SIZES, BAG_TYPES } from './constants';
import { GradingSummarySheet } from './summary-sheet';
import type { CreateGradingGatePassOrderDetail } from '@/types/grading-gate-pass';

export interface SizeEntry {
  size: string;
  quantity: number;
  bagType: string;
  weightPerBagKg: number;
}

export interface GradingGatePassFormProps {
  incomingGatePassId: string;
  variety: string;
  onSuccess?: () => void;
}

const defaultSizeEntries: SizeEntry[] = GRADING_SIZES.map((size) => ({
  size,
  quantity: 0,
  bagType: 'JUTE',
  weightPerBagKg: 0,
}));

function buildFormSchema() {
  return z.object({
    date: z.string().min(1, 'Date is required'),
    sizeEntries: z.array(
      z.object({
        size: z.string(),
        quantity: z.number().min(0, 'Must be 0 or more'),
        bagType: z.enum(['JUTE', 'LENO']),
        weightPerBagKg: z.number().min(0, 'Must be 0 or more'),
      })
    ),
    remarks: z
      .string()
      .trim()
      .max(500, 'Remarks must not exceed 500 characters'),
  });
}

export const GradingGatePassForm = memo(function GradingGatePassForm({
  incomingGatePassId,
  variety,
  onSuccess,
}: GradingGatePassFormProps) {
  const { admin } = useStore();
  const { data: voucherNumber, isLoading: isLoadingVoucher } =
    useGetReceiptVoucherNumber('grading-gate-pass');
  const { mutate: createGradingGatePass, isPending } =
    useCreateGradingGatePass();

  const [isSummarySheetOpen, setIsSummarySheetOpen] = useState(false);

  const formSchema = useMemo(() => buildFormSchema(), []);

  const form = useForm({
    defaultValues: {
      date: formatDate(new Date()),
      sizeEntries: defaultSizeEntries,
      remarks: '',
    },
    validators: {
      onChange: formSchema,
      onBlur: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!admin?._id || !voucherNumber) return;

      const orderDetails: CreateGradingGatePassOrderDetail[] =
        value.sizeEntries.map((row) => ({
          size: row.size,
          bagType: row.bagType as 'JUTE' | 'LENO',
          currentQuantity: row.quantity,
          initialQuantity: row.quantity,
          weightPerBagKg: row.weightPerBagKg,
        }));

      createGradingGatePass(
        {
          incomingGatePassId,
          gradedById: admin._id,
          gatePassNo: voucherNumber,
          date: formatDateToISO(value.date),
          variety,
          orderDetails,
          allocationStatus: 'PENDING',
          remarks: value.remarks.trim() || undefined,
        },
        {
          onSuccess: () => {
            form.reset();
            setIsSummarySheetOpen(false);
            onSuccess?.();
          },
        }
      );
    },
  });

  const voucherNumberDisplay =
    voucherNumber != null ? `#${voucherNumber}` : null;
  const gatePassNo = voucherNumber ?? 0;

  const handleNextClick = () => {
    form.validateAllFields('submit');
    if (form.state.isValid) setIsSummarySheetOpen(true);
  };

  const handleFinalSubmit = () => form.handleSubmit();

  return (
    <div className="font-custom flex flex-col">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNextClick();
        }}
        className="space-y-6"
      >
        <FieldGroup className="space-y-6">
          {/* Date */}
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
                    label="Date"
                    id="grading-date"
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

          {/* Size-wise entries */}
          <div className="space-y-3">
            <h3 className="font-custom text-base font-semibold text-[#333]">
              Enter Quantities
            </h3>
            <p className="text-muted-foreground font-custom text-sm">
              Please select a variety first to enter quantities.
            </p>
            <div className="space-y-3">
              {GRADING_SIZES.map((sizeLabel, index) => (
                <div
                  key={sizeLabel}
                  className="flex flex-row items-center gap-3"
                >
                  <span className="font-custom min-w-22 text-sm font-medium text-[#333]">
                    {sizeLabel}
                  </span>
                  <form.Field
                    name={`sizeEntries[${index}].quantity`}
                    children={(field) => (
                      <Field className="w-20 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="Qty"
                          value={
                            field.state.value === 0
                              ? ''
                              : (field.state.value ?? '')
                          }
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '' || raw === '-') {
                              field.handleChange(0);
                              return;
                            }
                            const parsed = parseInt(raw, 10);
                            field.handleChange(
                              Number.isNaN(parsed) ? 0 : parsed
                            );
                          }}
                          className="font-custom h-9 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </Field>
                    )}
                  />
                  <form.Field
                    name={`sizeEntries[${index}].bagType`}
                    children={(field) => (
                      <Field className="w-24 shrink-0">
                        <select
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="border-input bg-background focus-visible:ring-primary font-custom h-9 w-full rounded-md border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                          {BAG_TYPES.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  />
                  <form.Field
                    name={`sizeEntries[${index}].weightPerBagKg`}
                    children={(field) => (
                      <Field className="w-20 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="Wt"
                          value={
                            field.state.value === 0 ||
                            field.state.value === undefined
                              ? ''
                              : field.state.value
                          }
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '' || raw === '-') {
                              field.handleChange(0);
                              return;
                            }
                            const parsed = parseFloat(raw);
                            field.handleChange(
                              Number.isNaN(parsed) ? 0 : parsed
                            );
                          }}
                          className="font-custom h-9 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </Field>
                    )}
                  />
                </div>
              ))}
            </div>
            <span className="text-muted-foreground block text-xs">
              Quantity / Approx Weight (kg)
            </span>
          </div>

          {/* Remarks */}
          <form.Field
            name="remarks"
            children={(field) => (
              <Field>
                <FieldLabel
                  htmlFor="grading-remarks"
                  className="font-custom text-base font-semibold"
                >
                  Remarks (optional)
                </FieldLabel>
                <textarea
                  id="grading-remarks"
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Max 500 characters"
                  maxLength={500}
                  rows={3}
                  className="border-input bg-background ring-offset-background focus-visible:ring-primary font-custom flex w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </Field>
            )}
          />
        </FieldGroup>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="font-custom"
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="font-custom px-8 font-bold"
            disabled={isPending || isLoadingVoucher || !gatePassNo}
          >
            Next
          </Button>
        </div>
      </form>

      {/* Summary Sheet */}
      <GradingSummarySheet
        open={isSummarySheetOpen}
        onOpenChange={setIsSummarySheetOpen}
        voucherNumberDisplay={voucherNumberDisplay}
        variety={variety}
        formValues={{
          date: form.state.values.date,
          sizeEntries: form.state.values.sizeEntries,
          remarks: form.state.values.remarks,
        }}
        isPending={isPending}
        isLoadingVoucher={isLoadingVoucher}
        gatePassNo={gatePassNo}
        onSubmit={handleFinalSubmit}
      />
    </div>
  );
});
