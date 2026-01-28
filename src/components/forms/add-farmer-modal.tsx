import { memo, useState, useMemo, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { Info, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useQuickAddFarmer } from '@/services/store-admin/functions/useQuickAddFarmer';
import { useStore } from '@/stores/store';
import type { FarmerStorageLink } from '@/types/farmer';

interface AddFarmerModalProps {
  links?: FarmerStorageLink[];
}

export const AddFarmerModal = memo(function AddFarmerModal({
  links = [],
}: AddFarmerModalProps) {
  const { mutate: quickAddFarmer, isPending } = useQuickAddFarmer();
  const { coldStorage, admin } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const usedAccountNumbers = useMemo(() => {
    return links
      .map((l) => l.accountNumber.toString())
      .filter((acc, i, s) => s.indexOf(acc) === i)
      .sort((a, b) => Number(a) - Number(b));
  }, [links]);

  const usedMobileNumbers = useMemo(() => {
    return links
      .map((l) => l.farmerId.mobileNumber)
      .filter((mob, i, s) => s.indexOf(mob) === i)
      .sort();
  }, [links]);

  const nextAccountNumber = useMemo(() => {
    if (usedAccountNumbers.length === 0) return 1;
    const latest = Number(usedAccountNumbers[usedAccountNumbers.length - 1]);
    return latest + 1;
  }, [usedAccountNumbers]);

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, 'Name is required'),
        address: z.string().min(1, 'Address is required'),
        mobileNumber: z
          .string()
          .length(10, 'Mobile number must be 10 digits')
          .refine((val) => !usedMobileNumbers.includes(val), {
            message: 'Mobile number already in use',
          }),
        accountNumber: z
          .number()
          .positive('Account number must be a positive number')
          .refine((val) => !usedAccountNumbers.includes(val.toString()), {
            message: 'Account number already in use',
          }),
      }),
    [usedAccountNumbers, usedMobileNumbers]
  );

  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
      mobileNumber: '',
      accountNumber: nextAccountNumber,
    },
    validators: {
      onChange: formSchema,
      onBlur: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!coldStorage?._id || !admin?._id) return;
      quickAddFarmer(
        {
          name: value.name,
          address: value.address,
          mobileNumber: value.mobileNumber,
          coldStorageId: coldStorage._id,
          linkedById: admin._id,
          accountNumber: value.accountNumber,
        },
        {
          onSuccess: () => {
            form.reset();
            form.setFieldValue('accountNumber', value.accountNumber + 1);
            setIsOpen(false);
          },
        }
      );
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.setFieldValue('accountNumber', nextAccountNumber);
    }
  }, [isOpen, nextAccountNumber, form]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="font-custom h-10 w-full sm:w-auto">
          <UserPlus className="h-4 w-4 shrink-0" />
          Add New Farmer
        </Button>
      </DialogTrigger>

      <DialogContent className="font-custom sm:max-w-[425px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add New Farmer</DialogTitle>
            <DialogDescription>
              Enter the farmer details to register them quickly
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-6 grid gap-4">
            {/* Account Number */}
            <form.Field
              name="accountNumber"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={field.name} className="font-custom">
                        Account Number
                      </FieldLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="font-custom hover:bg-accent/50 h-6 w-6 p-0"
                          >
                            <Info
                              className="text-muted-foreground h-4 w-4"
                              aria-hidden
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="font-custom max-w-xs">
                          {usedAccountNumbers.length > 0 ? (
                            <span>
                              Used account numbers:{' '}
                              {usedAccountNumbers.join(', ')}
                            </span>
                          ) : (
                            'No account numbers in use'
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value === ''
                            ? nextAccountNumber
                            : Number(e.target.value) || 0
                        )
                      }
                      aria-invalid={isInvalid}
                      placeholder="Enter account number"
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

            {/* Mobile Number */}
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
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value.replace(/\D/g, '').slice(0, 10)
                        )
                      }
                      aria-invalid={isInvalid}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
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

            {/* Name */}
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
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter farmer name"
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

            {/* Address */}
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
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter address"
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

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="font-custom">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="font-custom" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Farmer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
