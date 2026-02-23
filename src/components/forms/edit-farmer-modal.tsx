import { memo, useMemo, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useEditFarmer } from '@/services/store-admin/functions/useEditFarmer';
import { useStore } from '@/stores/store';
import type { FarmerStorageLink } from '@/types/farmer';

interface EditFarmerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: FarmerStorageLink | null | undefined;
  /** All links (e.g. from list page) for duplicate validation; exclude current link. When omitted, duplicate check is skipped. */
  links?: FarmerStorageLink[];
  onFarmerUpdated?: () => void;
}

const defaultFormValues = {
  name: '',
  address: '',
  mobileNumber: '',
  accountNumber: '',
  aadharCardNumber: '',
  panCardNumber: '',
  costPerBag: '',
};

export const EditFarmerModal = memo(function EditFarmerModal({
  open,
  onOpenChange,
  link,
  links = [],
  onFarmerUpdated,
}: EditFarmerModalProps) {
  const { mutate: editFarmer, isPending } = useEditFarmer();
  const { admin } = useStore();

  /* Used numbers: exclude current link so user can keep same values */
  const usedAccountNumbers = useMemo(() => {
    return links
      .filter((l) => l._id !== link?._id)
      .map((l) => l.accountNumber.toString())
      .filter((acc, i, s) => s.indexOf(acc) === i)
      .sort((a, b) => Number(a) - Number(b));
  }, [links, link?._id]);

  const usedMobileNumbers = useMemo(() => {
    return links
      .filter((l) => l._id !== link?._id)
      .map((l) => l.farmerId.mobileNumber)
      .filter((mob, i, s) => s.indexOf(mob) === i)
      .sort();
  }, [links, link?._id]);

  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .transform((val) => {
            const trimmed = val.trim();
            if (!trimmed) return trimmed;
            return (
              trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
            );
          })
          .refine((val) => val.length > 0, {
            message: 'Name is required',
          }),

        address: z.string().min(1, 'Address is required'),

        mobileNumber: z
          .string()
          .length(10, 'Mobile number must be 10 digits')
          .refine((val) => !usedMobileNumbers.includes(val), {
            message: 'Mobile number already in use',
          }),

        accountNumber: z
          .string()
          .transform((val) =>
            val === '' || Number.isNaN(Number(val)) ? '' : val
          )
          .pipe(
            z
              .string()
              .min(1, 'Please enter an account number')
              .refine((val) => {
                const num = Number(val);
                return !Number.isNaN(num) && num > 0;
              }, 'Please enter an account number')
              .refine((val) => !usedAccountNumbers.includes(val), {
                message: 'This account number is already taken',
              })
          ),

        aadharCardNumber: z
          .string()
          .trim()
          .max(12, 'Aadhar card number must not exceed 12 characters'),

        panCardNumber: z
          .string()
          .trim()
          .max(10, 'PAN card number must not exceed 10 characters'),

        costPerBag: z.string().transform((s) => {
          if (s === '' || s == null) return undefined;
          const n = Number(s);
          return Number.isNaN(n) ? undefined : n;
        }),
      }),
    [usedAccountNumbers, usedMobileNumbers]
  );

  const form = useForm({
    defaultValues: defaultFormValues,

    validators: {
      onChange: formSchema,
      onBlur: formSchema,
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      if (!link?._id || !admin?._id) return;

      const costPerBagNum =
        value.costPerBag !== '' ? Number(value.costPerBag) : undefined;
      const costPerBagValid =
        costPerBagNum != null && !Number.isNaN(costPerBagNum);

      editFarmer(
        {
          id: link._id,
          name: value.name,
          address: value.address,
          mobileNumber: value.mobileNumber,
          accountNumber: Number(value.accountNumber),
          linkedById: admin._id,
          ...(value.aadharCardNumber?.trim() && {
            aadharCardNumber: value.aadharCardNumber.trim(),
          }),
          ...(value.panCardNumber?.trim() && {
            panCardNumber: value.panCardNumber.trim(),
          }),
          ...(costPerBagValid && { costPerBag: costPerBagNum }),
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
            onFarmerUpdated?.();
          },
        }
      );
    },
  });

  /* Populate form when modal opens with link */
  useEffect(() => {
    if (open && link) {
      form.setFieldValue('name', link.farmerId.name);
      form.setFieldValue('address', link.farmerId.address);
      form.setFieldValue('mobileNumber', link.farmerId.mobileNumber);
      form.setFieldValue('accountNumber', link.accountNumber.toString());
      form.setFieldValue('aadharCardNumber', '');
      form.setFieldValue('panCardNumber', '');
      form.setFieldValue('costPerBag', '');
    }
  }, [open, link, form]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) form.reset();
  };

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="font-custom flex max-h-[90dvh] w-full flex-col overflow-hidden p-4 sm:max-w-[425px] sm:p-6 md:max-w-[480px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader className="shrink-0 space-y-1.5">
            <DialogTitle className="font-custom text-xl font-bold tracking-tight sm:text-2xl">
              Edit Farmer
            </DialogTitle>
            <DialogDescription className="font-custom text-sm leading-relaxed text-[#6f6f6f] sm:text-base">
              Update farmer details below
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto py-4 sm:py-6">
            <FieldGroup className="grid gap-4 sm:gap-5">
              <form.Field
                name="accountNumber"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-custom">
                        Account Number
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Account number"
                        aria-invalid={isInvalid}
                        className="font-custom min-w-0 flex-1"
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

              <form.Field
                name="mobileNumber"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-custom">
                        Mobile Number
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        className="font-custom"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value.replace(/\D/g, '').slice(0, 10)
                          )
                        }
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        aria-invalid={isInvalid}
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

              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-custom">
                        Name
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        className="font-custom"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter farmer name"
                        aria-invalid={isInvalid}
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

              <form.Field
                name="address"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-custom">
                        Address
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        className="font-custom"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter address"
                        aria-invalid={isInvalid}
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

              {/* Optional details: Aadhar, PAN, Cost per bag (same as add-farmer-modal) */}
              <div className="border-border/60 pt-2 sm:pt-3">
                <p className="text-muted-foreground font-custom mb-3 text-xs font-medium tracking-wider uppercase sm:mb-4 sm:text-sm">
                  Optional details
                </p>
                <div className="grid gap-4 sm:gap-5">
                  <form.Field
                    name="aadharCardNumber"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className="font-custom"
                          >
                            Aadhar Card Number{' '}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            className="font-custom"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(
                                e.target.value.replace(/\D/g, '').slice(0, 12)
                              )
                            }
                            placeholder="Enter 12-digit Aadhar number"
                            maxLength={12}
                            aria-invalid={isInvalid}
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

                  <form.Field
                    name="panCardNumber"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className="font-custom"
                          >
                            PAN Card Number{' '}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            className="font-custom"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(
                                e.target.value.toUpperCase().slice(0, 10)
                              )
                            }
                            placeholder="e.g. ABCDE1234F"
                            maxLength={10}
                            aria-invalid={isInvalid}
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

                  <form.Field
                    name="costPerBag"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className="font-custom"
                          >
                            Cost per Bag{' '}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="number"
                            min={0}
                            step={1}
                            className="font-custom"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(
                                e.target.value
                                  .replace(/[^0-9.]/g, '')
                                  .slice(0, 16)
                              )
                            }
                            placeholder="e.g. 110"
                            aria-invalid={isInvalid}
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
                </div>
              </div>
            </FieldGroup>
          </div>

          <DialogFooter className="border-border/60 mt-4 flex shrink-0 flex-col gap-2 border-t pt-4 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3 sm:border-t-0 sm:pt-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="font-custom w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isPending}
              className="font-custom w-full sm:w-auto"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
