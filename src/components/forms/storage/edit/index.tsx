import { memo, useMemo, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/forms/date-picker';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';
import { formatDate, formatDateToISO } from '@/lib/helpers';
import {
  POTATO_VARIETIES,
  GRADING_SIZES,
  BAG_TYPES,
} from '@/components/forms/grading/constants';
import type { StorageGatePassWithLink } from '@/types/storage-gate-pass';
import { useGetAllFarmers } from '@/services/store-admin/functions/useGetAllFarmers';
import { useEditStorageGatePass } from '@/services/store-admin/storage-gate-pass/useEditStorageGatePass';
import {
  EditStorageSummarySheet,
  type EditStorageSummaryFormValues,
} from './summary.tsx';

const DEFAULT_LOCATION = { chamber: '', floor: '', row: '' };
type LocationEntry = { chamber: string; floor: string; row: string };
type FieldErrors = Array<{ message?: string } | undefined>;
const EXTRA_ROW_KEY_PREFIX = 'extra:';

const STORAGE_CATEGORY_OPTIONS = [
  'OWNED',
  'PURCHASED',
  'CONTRACT FARMING',
  'RENTAL',
  'FAZALPUR',
] as const;

type StorageEditRouteState = { gatePass?: StorageGatePassWithLink };

type ExtraQuantityRow = {
  id: string;
  size: string;
  quantity: number;
  bagType: string;
};

const formSchema = z
  .object({
    manualGatePassNumber: z.union([z.number(), z.undefined()]),
    farmerStorageLinkId: z.string().min(1, 'Please select a farmer'),
    date: z.string().min(1, 'Date is required'),
    variety: z.string().min(1, 'Please select a variety'),
    storageCategory: z.string().optional(),
    sizeQuantities: z.record(z.string(), z.number().min(0)),
    sizeBagTypes: z.record(z.string(), z.string()),
    extraQuantityRows: z.array(
      z.object({
        id: z.string(),
        size: z.string(),
        quantity: z.number().min(0),
        bagType: z.string(),
      })
    ),
    locationBySize: z.record(
      z.string(),
      z.object({
        chamber: z.string(),
        floor: z.string(),
        row: z.string(),
      })
    ),
    remarks: z.string().max(500).default(''),
    reason: z.string().min(1, 'Reason is required').max(500),
  })
  .refine(
    (data) => {
      const fixedWithQty = Object.entries(data.sizeQuantities).filter(
        ([, qty]) => (qty ?? 0) > 0
      );
      const fixedOk = fixedWithQty.every(([size]) => {
        const loc = data.locationBySize?.[size];
        return (
          loc &&
          loc.chamber?.trim() !== '' &&
          loc.floor?.trim() !== '' &&
          loc.row?.trim() !== ''
        );
      });
      if (!fixedOk) return false;

      const extraWithQty = (data.extraQuantityRows ?? []).filter(
        (row) => (row.quantity ?? 0) > 0
      );
      return extraWithQty.every((row) => {
        const key = `${EXTRA_ROW_KEY_PREFIX}${row.id}`;
        const loc = data.locationBySize?.[key];
        return (
          loc &&
          loc.chamber?.trim() !== '' &&
          loc.floor?.trim() !== '' &&
          loc.row?.trim() !== ''
        );
      });
    },
    {
      message:
        'Please enter chamber, floor and row for each size that has a quantity.',
      path: ['locationBySize'],
    }
  )
  .refine(
    (data) => {
      const fixedTotal = Object.values(data.sizeQuantities).reduce(
        (sum, qty) => sum + (qty ?? 0),
        0
      );
      const extraTotal = (data.extraQuantityRows ?? []).reduce(
        (sum, row) => sum + (row.quantity ?? 0),
        0
      );
      return fixedTotal + extraTotal > 0;
    },
    {
      message: 'Please enter at least one quantity.',
      path: ['sizeQuantities'],
    }
  );

const EditStorageGatePassForm = memo(function EditStorageGatePassForm() {
  const navigate = useNavigate();
  const gatePass = useRouterState({
    select: (state) =>
      (state.location.state as StorageEditRouteState | undefined)?.gatePass,
  });

  const { data: farmerLinks, isLoading: isLoadingFarmers } = useGetAllFarmers();
  const { mutate: editStorageGatePass, isPending } = useEditStorageGatePass();

  const [step, setStep] = useState<1 | 2>(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const openSheetRef = useRef(false);

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

  const storageCategoryOptions: Option<string>[] = useMemo(
    () =>
      STORAGE_CATEGORY_OPTIONS.map((opt) => ({
        value: opt,
        label: opt,
        searchableText: opt,
      })),
    []
  );

  const initialMapped = useMemo(() => {
    const sizeQuantities = Object.fromEntries(
      GRADING_SIZES.map((s) => [s, 0])
    ) as Record<string, number>;
    const sizeBagTypes = Object.fromEntries(
      GRADING_SIZES.map((s) => [s, 'JUTE'])
    ) as Record<string, string>;
    const locationBySize: Record<string, LocationEntry> = {};
    const extraQuantityRows: ExtraQuantityRow[] = [];

    (gatePass?.bagSizes ?? []).forEach((row) => {
      if (GRADING_SIZES.includes(row.size as (typeof GRADING_SIZES)[number])) {
        sizeQuantities[row.size] =
          (sizeQuantities[row.size] ?? 0) + (row.initialQuantity ?? 0);
        sizeBagTypes[row.size] = row.bagType ?? 'JUTE';
        locationBySize[row.size] = {
          chamber: row.chamber ?? '',
          floor: row.floor ?? '',
          row: row.row ?? '',
        };
      } else {
        const id = crypto.randomUUID();
        extraQuantityRows.push({
          id,
          size: row.size ?? '',
          quantity: row.initialQuantity ?? 0,
          bagType: row.bagType ?? 'JUTE',
        });
        locationBySize[`${EXTRA_ROW_KEY_PREFIX}${id}`] = {
          chamber: row.chamber ?? '',
          floor: row.floor ?? '',
          row: row.row ?? '',
        };
      }
    });

    return {
      manualGatePassNumber: gatePass?.manualGatePassNumber,
      farmerStorageLinkId: gatePass?.farmerStorageLinkId?._id ?? '',
      date: gatePass?.date
        ? formatDate(new Date(gatePass.date))
        : formatDate(new Date()),
      variety: gatePass?.variety ?? '',
      storageCategory: gatePass?.storageCategory ?? '',
      sizeQuantities,
      sizeBagTypes,
      extraQuantityRows,
      locationBySize,
      remarks: gatePass?.remarks ?? '',
      reason: '',
    };
  }, [gatePass]);

  const form = useForm({
    defaultValues: initialMapped,
    validators: { onSubmit: formSchema as never },
    onSubmit: async ({ value }) => {
      if (!gatePass?._id) {
        toast.error('Storage gate pass not found');
        return;
      }

      if (!openSheetRef.current) {
        openSheetRef.current = true;
        setSummaryOpen(true);
        return;
      }
      openSheetRef.current = false;

      const bagSizesFromFixed = (
        Object.entries(value.sizeQuantities) as [string, number][]
      )
        .filter(([, qty]) => (qty ?? 0) > 0)
        .map(([size, qty]) => {
          const loc = value.locationBySize[size] ?? { ...DEFAULT_LOCATION };
          const quantity = qty ?? 0;
          return {
            size,
            bagType: value.sizeBagTypes[size] ?? 'JUTE',
            currentQuantity: quantity,
            initialQuantity: quantity,
            chamber: loc.chamber.trim(),
            floor: loc.floor.trim(),
            row: loc.row.trim(),
          };
        });

      const bagSizesFromExtra = (value.extraQuantityRows ?? [])
        .filter((row) => (row.quantity ?? 0) > 0)
        .map((row) => {
          const key = `${EXTRA_ROW_KEY_PREFIX}${row.id}`;
          const loc = value.locationBySize[key] ?? { ...DEFAULT_LOCATION };
          return {
            size: row.size,
            bagType: row.bagType ?? 'JUTE',
            currentQuantity: row.quantity,
            initialQuantity: row.quantity,
            chamber: loc.chamber.trim(),
            floor: loc.floor.trim(),
            row: loc.row.trim(),
          };
        });

      editStorageGatePass(
        {
          storageGatePassId: gatePass._id,
          gatePassNo: gatePass.gatePassNo,
          manualGatePassNumber: value.manualGatePassNumber,
          date: formatDateToISO(value.date),
          variety: value.variety.trim(),
          storageCategory: value.storageCategory?.trim() || undefined,
          bagSizes: [...bagSizesFromFixed, ...bagSizesFromExtra],
          remarks: value.remarks?.trim() || undefined,
          reason: value.reason.trim(),
        },
        {
          onSuccess: (resp) => {
            if (resp.success === false) return;
            setSummaryOpen(false);
            navigate({ to: '/store-admin/daybook' });
          },
        }
      );
    },
  });

  const summaryFormValues: EditStorageSummaryFormValues = useMemo(() => {
    const values = form.state.values;
    const rows = [
      ...(Object.entries(values.sizeQuantities ?? {}) as [string, number][])
        .filter(([, qty]) => (qty ?? 0) > 0)
        .map(([size, qty]) => {
          const loc = values.locationBySize?.[size] ?? { ...DEFAULT_LOCATION };
          return {
            size,
            quantity: qty,
            chamber: loc.chamber,
            floor: loc.floor,
            row: loc.row,
          };
        }),
      ...(values.extraQuantityRows ?? [])
        .filter((row) => (row.quantity ?? 0) > 0)
        .map((row) => {
          const key = `${EXTRA_ROW_KEY_PREFIX}${row.id}`;
          const loc = values.locationBySize?.[key] ?? { ...DEFAULT_LOCATION };
          return {
            size: row.size,
            quantity: row.quantity,
            chamber: loc.chamber,
            floor: loc.floor,
            row: loc.row,
          };
        }),
    ];

    return {
      gatePassNo: gatePass?.gatePassNo,
      date: values.date,
      variety: values.variety,
      storageCategory: values.storageCategory ?? '',
      remarks: values.remarks ?? '',
      reason: values.reason ?? '',
      rows,
    };
  }, [form.state.values, gatePass?.gatePassNo]);

  if (!gatePass?._id) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
        <p className="font-custom text-muted-foreground">
          No gate pass found in router state.
        </p>
      </main>
    );
  }

  const handleNextOrReview = () => {
    const values = form.state.values;
    if (step === 1) {
      if (!values.farmerStorageLinkId?.trim()) {
        toast.error('Please select a farmer.');
        return;
      }
      if (!values.variety?.trim()) {
        toast.error('Please select a variety.');
        return;
      }
      const fixedTotal = Object.values(values.sizeQuantities ?? {}).reduce(
        (s, q) => s + (q ?? 0),
        0
      );
      const extraTotal = (values.extraQuantityRows ?? []).reduce(
        (s, row) => s + (row.quantity ?? 0),
        0
      );
      if (fixedTotal + extraTotal === 0) {
        toast.error('Please enter at least one quantity.');
        return;
      }
      setStep(2);
      return;
    }

    form.validateAllFields('submit');
    if (form.state.isValid) form.handleSubmit();
  };

  return (
    <main className="font-custom mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="font-custom text-foreground text-3xl font-bold sm:text-4xl">
          Edit Storage Gate Pass
        </h1>
        <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
          <span className="font-custom text-primary text-sm font-medium">
            VOUCHER NO: #{gatePass.gatePassNo}
          </span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNextOrReview();
        }}
        className="space-y-6"
      >
        <FieldGroup className="space-y-6">
          {step === 1 && (
            <>
              <form.Field
                name="manualGatePassNumber"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Manual Gate Pass Number
                    </FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') return field.handleChange(undefined);
                        const parsed = parseInt(raw, 10);
                        field.handleChange(
                          Number.isNaN(parsed) ? undefined : parsed
                        );
                      }}
                      className="font-custom [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="farmerStorageLinkId"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Enter Account Name (search and select)
                    </FieldLabel>
                    <SearchSelector
                      options={farmerOptions}
                      placeholder="Search Farmer"
                      searchPlaceholder="Search by name, account number, or mobile..."
                      onSelect={(value) => field.handleChange(value)}
                      value={field.state.value}
                      loading={isLoadingFarmers}
                      loadingMessage="Loading farmers..."
                      emptyMessage="No farmers found"
                      className="w-full"
                      buttonClassName="w-full justify-between"
                    />
                    {!field.state.meta.isValid &&
                      field.state.meta.isTouched && (
                        <FieldError
                          errors={field.state.meta.errors as FieldErrors}
                        />
                      )}
                  </Field>
                )}
              />

              <form.Field
                name="date"
                children={(field) => (
                  <Field>
                    <DatePicker
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v)}
                      label="Date"
                      id="storage-edit-date"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="variety"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Select Variety
                    </FieldLabel>
                    <SearchSelector
                      options={POTATO_VARIETIES}
                      placeholder="Select a variety"
                      searchPlaceholder="Search variety..."
                      onSelect={(v) => field.handleChange(v ?? '')}
                      value={field.state.value}
                      buttonClassName="w-full justify-between"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="storageCategory"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Storage Category
                    </FieldLabel>
                    <SearchSelector
                      options={storageCategoryOptions}
                      placeholder="Select category"
                      searchPlaceholder="Search category..."
                      onSelect={(v) => field.handleChange(v ?? '')}
                      value={field.state.value ?? ''}
                      className="w-full"
                      buttonClassName="w-full justify-between"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="sizeQuantities"
                children={(field) => (
                  <form.Subscribe
                    selector={(state) => ({
                      variety: state.values.variety,
                      sizeBagTypes: state.values.sizeBagTypes ?? {},
                      extraQuantityRows: state.values.extraQuantityRows ?? [],
                    })}
                  >
                    {({ variety, sizeBagTypes, extraQuantityRows }) => {
                      const sizeQuantities = field.state.value ?? {};
                      const quantitiesDisabled = !variety?.trim();
                      const fixedTotal = GRADING_SIZES.reduce(
                        (sum, size) => sum + (sizeQuantities[size] ?? 0),
                        0
                      );
                      const extraTotal = extraQuantityRows.reduce(
                        (sum, row) => sum + (row.quantity ?? 0),
                        0
                      );

                      const addExtraRow = () => {
                        form.setFieldValue(
                          'extraQuantityRows' as never,
                          [
                            ...extraQuantityRows,
                            {
                              id: crypto.randomUUID(),
                              size: GRADING_SIZES[0] ?? '',
                              quantity: 0,
                              bagType: 'JUTE',
                            },
                          ] as never
                        );
                      };

                      return (
                        <Card className="overflow-hidden">
                          <CardHeader className="space-y-1.5 pb-4">
                            <CardTitle className="font-custom text-foreground text-xl font-semibold">
                              Enter Quantities
                            </CardTitle>
                            <CardDescription className="font-custom text-muted-foreground text-sm">
                              {quantitiesDisabled
                                ? 'Please select a variety first to enter quantities.'
                                : 'Enter quantity and bag type for each size. Add extra size rows when needed.'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {GRADING_SIZES.map((size) => {
                              const value = sizeQuantities[size] ?? 0;
                              const bagType = sizeBagTypes[size] ?? 'JUTE';
                              return (
                                <div
                                  key={size}
                                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                                >
                                  <label className="font-custom text-base">
                                    {size}
                                  </label>
                                  <div className="flex w-full gap-2 sm:w-auto sm:min-w-[200px]">
                                    <Input
                                      type="number"
                                      min={0}
                                      disabled={quantitiesDisabled}
                                      value={value === 0 ? '' : String(value)}
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        const next = {
                                          ...(field.state.value ?? {}),
                                          [size]:
                                            raw === ''
                                              ? 0
                                              : Math.max(
                                                  0,
                                                  parseInt(raw, 10) || 0
                                                ),
                                        };
                                        field.handleChange(next);
                                      }}
                                      className="w-full [appearance:textfield] sm:w-24 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    <select
                                      aria-label={`Bag type for ${size}`}
                                      disabled={quantitiesDisabled}
                                      value={bagType}
                                      onChange={(e) =>
                                        form.setFieldValue(
                                          'sizeBagTypes' as never,
                                          {
                                            ...(form.state.values
                                              .sizeBagTypes ?? {}),
                                            [size]: e.target.value,
                                          } as never
                                        )
                                      }
                                      className="border-input bg-background focus-visible:ring-primary font-custom h-9 flex-1 rounded-md border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-28"
                                    >
                                      {BAG_TYPES.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}

                            {extraQuantityRows.map((row) => (
                              <div
                                key={row.id}
                                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <select
                                    value={row.size}
                                    disabled={quantitiesDisabled}
                                    onChange={(e) =>
                                      form.setFieldValue(
                                        'extraQuantityRows' as never,
                                        extraQuantityRows.map((r) =>
                                          r.id === row.id
                                            ? { ...r, size: e.target.value }
                                            : r
                                        ) as never
                                      )
                                    }
                                    className="border-input bg-background font-custom h-9 flex-1 rounded-md border px-3 py-1.5 text-sm"
                                  >
                                    {GRADING_SIZES.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={row.bagType ?? 'JUTE'}
                                    disabled={quantitiesDisabled}
                                    onChange={(e) =>
                                      form.setFieldValue(
                                        'extraQuantityRows' as never,
                                        extraQuantityRows.map((r) =>
                                          r.id === row.id
                                            ? { ...r, bagType: e.target.value }
                                            : r
                                        ) as never
                                      )
                                    }
                                    className="border-input bg-background font-custom h-9 w-24 rounded-md border px-3 py-1.5 text-sm"
                                  >
                                    {BAG_TYPES.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      form.setFieldValue(
                                        'extraQuantityRows' as never,
                                        extraQuantityRows.filter(
                                          (r) => r.id !== row.id
                                        ) as never
                                      )
                                    }
                                    aria-label="Remove size row"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Input
                                  type="number"
                                  min={0}
                                  disabled={quantitiesDisabled}
                                  value={
                                    row.quantity === 0
                                      ? ''
                                      : String(row.quantity)
                                  }
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    const quantity =
                                      raw === ''
                                        ? 0
                                        : Math.max(0, parseInt(raw, 10) || 0);
                                    form.setFieldValue(
                                      'extraQuantityRows' as never,
                                      extraQuantityRows.map((r) =>
                                        r.id === row.id ? { ...r, quantity } : r
                                      ) as never
                                    );
                                  }}
                                  className="w-full [appearance:textfield] sm:w-24 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addExtraRow}
                              disabled={quantitiesDisabled}
                              className="font-custom w-full sm:w-auto"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Size
                            </Button>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="font-custom">Total</span>
                              <span className="font-custom font-semibold">
                                {fixedTotal + extraTotal}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }}
                  </form.Subscribe>
                )}
              />
            </>
          )}

          {step === 2 && (
            <>
              <form.Field
                name="locationBySize"
                children={(field) => (
                  <form.Subscribe
                    selector={(state) => ({
                      sizeQuantities: state.values.sizeQuantities,
                      extraQuantityRows: state.values.extraQuantityRows ?? [],
                    })}
                  >
                    {({ sizeQuantities, extraQuantityRows }) => {
                      const rows = [
                        ...GRADING_SIZES.filter(
                          (size) => (sizeQuantities[size] ?? 0) > 0
                        ).map((size) => ({
                          key: size,
                          label: size,
                          quantity: sizeQuantities[size] ?? 0,
                        })),
                        ...extraQuantityRows
                          .filter((row) => (row.quantity ?? 0) > 0)
                          .map((row) => ({
                            key: `${EXTRA_ROW_KEY_PREFIX}${row.id}`,
                            label: row.size,
                            quantity: row.quantity ?? 0,
                          })),
                      ];

                      const values = field.state.value ?? {};
                      const getLoc = (key: string) =>
                        values[key] ?? { ...DEFAULT_LOCATION };
                      const setLoc = (
                        key: string,
                        prop: keyof LocationEntry,
                        value: string
                      ) =>
                        field.handleChange({
                          ...values,
                          [key]: {
                            ...getLoc(key),
                            [prop]: value.toUpperCase(),
                          },
                        });

                      return (
                        <Card className="overflow-hidden">
                          <CardHeader className="space-y-1.5 pb-4">
                            <CardTitle className="font-custom text-foreground text-xl font-semibold">
                              Enter Address (CH FL R)
                            </CardTitle>
                            <CardDescription className="font-custom text-muted-foreground text-sm">
                              Assign chamber, floor and row for each size with
                              quantity.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {rows.map((row, idx) => {
                              const loc = getLoc(row.key);
                              return (
                                <div key={row.key}>
                                  {idx > 0 && <Separator className="mb-6" />}
                                  <h3 className="font-custom mb-4 text-base font-semibold">
                                    {row.label} - {row.quantity} bags
                                  </h3>
                                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <Field>
                                      <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                                        Chamber
                                      </FieldLabel>
                                      <Input
                                        value={loc.chamber}
                                        onChange={(e) =>
                                          setLoc(
                                            row.key,
                                            'chamber',
                                            e.target.value
                                          )
                                        }
                                        placeholder="e.g. A"
                                      />
                                    </Field>
                                    <Field>
                                      <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                                        Floor
                                      </FieldLabel>
                                      <Input
                                        value={loc.floor}
                                        onChange={(e) =>
                                          setLoc(
                                            row.key,
                                            'floor',
                                            e.target.value
                                          )
                                        }
                                        placeholder="e.g. 1"
                                      />
                                    </Field>
                                    <Field>
                                      <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                                        Row
                                      </FieldLabel>
                                      <Input
                                        value={loc.row}
                                        onChange={(e) =>
                                          setLoc(row.key, 'row', e.target.value)
                                        }
                                        placeholder="e.g. R1"
                                      />
                                    </Field>
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      );
                    }}
                  </form.Subscribe>
                )}
              />

              <form.Field
                name="remarks"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Remarks
                    </FieldLabel>
                    <textarea
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-input bg-background text-foreground font-custom placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background w-full rounded-md border p-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      rows={4}
                      placeholder="Optional remarks"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="reason"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Reason
                    </FieldLabel>
                    <textarea
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-input bg-background text-foreground font-custom placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background w-full rounded-md border p-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      rows={3}
                      placeholder="Enter reason for editing this gate pass"
                    />
                    {!field.state.meta.isValid &&
                      field.state.meta.isTouched && (
                        <FieldError
                          errors={field.state.meta.errors as FieldErrors}
                        />
                      )}
                  </Field>
                )}
              />
            </>
          )}
        </FieldGroup>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="font-custom"
              >
                Back
              </Button>
            )}
          </div>
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="font-custom px-8 font-bold"
            disabled={isPending}
          >
            {step === 1 ? 'Next' : 'Review'}
          </Button>
        </div>
      </form>

      <EditStorageSummarySheet
        open={summaryOpen}
        onOpenChange={(open: boolean) => {
          if (!open) openSheetRef.current = false;
          setSummaryOpen(open);
        }}
        formValues={summaryFormValues}
        isPending={isPending}
        onSubmit={() => form.handleSubmit()}
      />
    </main>
  );
});

export default EditStorageGatePassForm;
