import { memo, useMemo, useState, useEffect } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { useGetTemperatureReadings } from '@/services/store-admin/additional/temperature/useGetTemperatureReadings';
import { useCreateTemperatureReading } from '@/services/store-admin/additional/temperature/useCreateTemperatureReading';
import { useUpdateTemperatureReading } from '@/services/store-admin/additional/temperature/useUpdateTemperatureReading';
import type { Temperature, TemperatureReadingItem } from '@/types/temperature';

import { Card, CardContent } from '@/components/ui/card';
import {
  Item,
  ItemMedia,
  ItemTitle,
  ItemHeader,
  ItemActions,
  ItemFooter,
} from '@/components/ui/item';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Thermometer, Plus, Pencil } from 'lucide-react';

/** Today's date in YYYY-MM-DDTHH:mm for datetime-local input */
function getTodayDatetimeLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

/** ISO date string to YYYY-MM-DDTHH:mm for datetime-local input */
function toDatetimeLocal(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 16);
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

const columnHelper = createColumnHelper<Temperature>();

/** Temperature unit: all readings are in Fahrenheit */
const UNIT = '°F';
const TEMP_MIN = -58;
const TEMP_MAX = 122;
const RANGE_MIN = 28;
const RANGE_MAX = 40;

function isAllInRange(readings: TemperatureReadingItem[]): boolean {
  return readings.every((r) => r.value >= RANGE_MIN && r.value <= RANGE_MAX);
}

/** Default payload for create form: 4 chambers with empty values */
const DEFAULT_CHAMBER_IDS = ['1', '2', '3', '4'] as const;

function getDefaultCreateTemperatureReading(): TemperatureReadingItem[] {
  return DEFAULT_CHAMBER_IDS.map((chamber) => ({ chamber, value: 0 }));
}

const addCreateFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  temperatureReading: z
    .array(
      z.object({
        chamber: z.string(),
        value: z
          .number()
          .min(TEMP_MIN, 'Temperature too low')
          .max(TEMP_MAX, 'Temperature too high'),
      })
    )
    .length(4, 'Exactly 4 chamber readings required'),
});

const updateReadingFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  temperatureReading: z
    .array(
      z.object({
        chamber: z.string().min(1, 'Chamber is required'),
        value: z
          .number()
          .min(TEMP_MIN, 'Temperature too low')
          .max(TEMP_MAX, 'Temperature too high'),
      })
    )
    .min(1, 'At least one reading is required'),
});

const TemperatureMonitoringPage = memo(function TemperatureMonitoringPage() {
  const {
    data: temperatureDocs = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetTemperatureReadings();
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Temperature | null>(null);
  const createReading = useCreateTemperatureReading();
  const updateReading = useUpdateTemperatureReading();

  const addForm = useForm({
    defaultValues: {
      date: getTodayDatetimeLocal(),
      temperatureReading: getDefaultCreateTemperatureReading(),
    },
    validators: {
      onChange: addCreateFormSchema,
      onBlur: addCreateFormSchema,
      onSubmit: addCreateFormSchema,
    },
    onSubmit: async ({ value }) => {
      const payload: {
        date: string;
        temperatureReading: TemperatureReadingItem[];
      } = {
        date: new Date(value.date).toISOString(),
        temperatureReading: value.temperatureReading.map((r) => ({
          chamber: r.chamber,
          value: Number(r.value),
        })),
      };
      createReading.mutate(payload, {
        onSuccess: () => {
          addForm.reset();
          setAddDialogOpen(false);
        },
      });
    },
  });

  useEffect(() => {
    if (addDialogOpen) {
      addForm.setFieldValue('date', getTodayDatetimeLocal());
      addForm.setFieldValue(
        'temperatureReading',
        getDefaultCreateTemperatureReading()
      );
    }
  }, [addDialogOpen, addForm]);

  const handleAddDialogOpenChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) addForm.reset();
  };

  const updateForm = useForm({
    defaultValues: {
      date: getTodayDatetimeLocal(),
      temperatureReading: [] as TemperatureReadingItem[],
    },
    validators: {
      onChange: updateReadingFormSchema,
      onBlur: updateReadingFormSchema,
      onSubmit: updateReadingFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!editingDoc) return;
      const temperatureReading: TemperatureReadingItem[] =
        value.temperatureReading.map((r) => ({
          chamber: r.chamber.trim(),
          value: Number(r.value),
        }));
      updateReading.mutate(
        {
          id: editingDoc._id,
          date: new Date(value.date).toISOString(),
          temperatureReading,
        },
        {
          onSuccess: () => {
            updateForm.reset();
            setEditingDoc(null);
          },
        }
      );
    },
  });

  useEffect(() => {
    if (editingDoc) {
      updateForm.setFieldValue('date', toDatetimeLocal(editingDoc.date));
      updateForm.setFieldValue(
        'temperatureReading',
        editingDoc.temperatureReading.map((r) => ({ ...r }))
      );
    }
  }, [editingDoc, updateForm]);

  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditingDoc(null);
      updateForm.reset();
    }
  };

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return temperatureDocs;
    const q = searchQuery.toLowerCase();
    return temperatureDocs.filter(
      (doc) =>
        doc.date.toLowerCase().includes(q) ||
        doc._id.toLowerCase().includes(q) ||
        doc.temperatureReading.some(
          (r) =>
            r.chamber.toLowerCase().includes(q) || String(r.value).includes(q)
        )
    );
  }, [temperatureDocs, searchQuery]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => (
          <span className="font-custom text-muted-foreground text-sm">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'readings',
        header: `Temperature readings (${UNIT})`,
        cell: ({ row }) => {
          const readings = row.original.temperatureReading ?? [];
          return (
            <div className="font-custom flex flex-col gap-0.5 text-sm font-medium">
              {readings.map((r, i) => (
                <span key={`${row.original._id}-reading-${i}`}>
                  Chamber {r.chamber}: {r.value}
                  {UNIT}
                </span>
              ))}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const readings = row.original.temperatureReading ?? [];
          const inRange = isAllInRange(readings);
          return (
            <span
              className={`font-custom inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                inRange
                  ? 'bg-primary/10 text-primary'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {inRange ? 'Within range' : 'Out of range'}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="font-custom text-muted-foreground hover:text-foreground focus-visible:ring-primary h-8 w-8 focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="Update reading"
            onClick={() => setEditingDoc(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredDocs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Card className="overflow-hidden rounded-xl">
            <div className="space-y-0">
              <div className="border-border bg-muted/30 flex gap-4 border-b px-4 py-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 flex-1" />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="border-border flex gap-4 border-b px-4 py-3 last:border-0"
                >
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header: count + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <Thermometer className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                {filteredDocs.length}{' '}
                {filteredDocs.length === 1 ? 'record' : 'records'}
              </ItemTitle>
            </div>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}
                className="font-custom h-8 gap-2 rounded-lg px-3"
              >
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${
                    isFetching ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ItemActions>
          </ItemHeader>
        </Item>

        {/* Search + Add */}
        <Item
          variant="outline"
          size="sm"
          className="flex-col items-stretch gap-4 rounded-xl"
        >
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by date, chamber or value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-custom focus-visible:ring-primary w-full pl-10 focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          </div>
          <ItemFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Dialog
              open={addDialogOpen}
              onOpenChange={handleAddDialogOpenChange}
            >
              <DialogTrigger asChild>
                <Button className="font-custom h-10 w-full sm:w-auto">
                  <Plus className="h-4 w-4 shrink-0" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="font-custom sm:max-w-[425px]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addForm.handleSubmit();
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>Add temperature reading</DialogTitle>
                    <DialogDescription>
                      Enter temperature values for all 4 chambers and the date.
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="mt-6 grid gap-4">
                    <addForm.Field
                      name="date"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="datetime-local"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              className="font-custom focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2"
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
                    {DEFAULT_CHAMBER_IDS.map((chamberId, i) => (
                      <addForm.Field
                        key={chamberId}
                        name={`temperatureReading[${i}].value`}
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel
                                htmlFor={`add-chamber-${chamberId}-value`}
                              >
                                Chamber {chamberId} ({UNIT})
                              </FieldLabel>
                              <Input
                                id={`add-chamber-${chamberId}-value`}
                                name={field.name}
                                type="number"
                                step="0.1"
                                value={
                                  field.state.value != null
                                    ? String(field.state.value)
                                    : ''
                                }
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(
                                    e.target.value === ''
                                      ? (0 as unknown as number)
                                      : Number(e.target.value)
                                  )
                                }
                                placeholder="e.g. 35"
                                aria-invalid={isInvalid}
                                className="font-custom focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2"
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
                    ))}
                  </FieldGroup>
                  <DialogFooter className="mt-6">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={createReading.isPending}
                      className="font-custom focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      {createReading.isPending ? 'Adding...' : 'Add reading'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </ItemFooter>
        </Item>

        {/* Edit dialog */}
        <Dialog
          open={editingDoc != null}
          onOpenChange={handleEditDialogOpenChange}
        >
          <DialogContent className="font-custom sm:max-w-[500px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateForm.handleSubmit();
              }}
            >
              <DialogHeader>
                <DialogTitle>Update temperature record</DialogTitle>
                <DialogDescription>
                  Change date or chamber readings for this record.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="mt-6 grid gap-4">
                <updateForm.Field
                  name="date"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={`edit-${field.name}`}>
                          Date
                        </FieldLabel>
                        <Input
                          id={`edit-${field.name}`}
                          name={field.name}
                          type="datetime-local"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          className="font-custom focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2"
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
                {editingDoc?.temperatureReading.map((_, i) => (
                  <div
                    key={editingDoc._id + i}
                    className="border-border bg-muted/20 flex flex-wrap items-end gap-3 rounded-lg border p-3"
                  >
                    <updateForm.Field
                      name={`temperatureReading[${i}].chamber`}
                      children={(field) => (
                        <Field className="min-w-0 flex-1">
                          <FieldLabel
                            htmlFor={`edit-reading-${i}-chamber`}
                            className="text-xs"
                          >
                            Chamber
                          </FieldLabel>
                          <Input
                            id={`edit-reading-${i}-chamber`}
                            name={field.name}
                            value={field.state.value ?? ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="e.g. 1"
                            className="font-custom focus-visible:ring-primary mt-1 focus-visible:ring-2 focus-visible:ring-offset-2"
                          />
                        </Field>
                      )}
                    />
                    <updateForm.Field
                      name={`temperatureReading[${i}].value`}
                      children={(field) => (
                        <Field className="min-w-0 flex-1">
                          <FieldLabel
                            htmlFor={`edit-reading-${i}-value`}
                            className="text-xs"
                          >
                            Temperature ({UNIT})
                          </FieldLabel>
                          <Input
                            id={`edit-reading-${i}-value`}
                            name={field.name}
                            type="number"
                            step="0.1"
                            value={
                              field.state.value != null
                                ? String(field.state.value)
                                : ''
                            }
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(
                                e.target.value === ''
                                  ? (0 as unknown as number)
                                  : Number(e.target.value)
                              )
                            }
                            placeholder="e.g. 35"
                            className="font-custom focus-visible:ring-primary mt-1 focus-visible:ring-2 focus-visible:ring-offset-2"
                          />
                        </Field>
                      )}
                    />
                  </div>
                ))}
              </FieldGroup>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={updateReading.isPending}
                  className="font-custom focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  {updateReading.isPending ? 'Updating...' : 'Update record'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Table */}
        {filteredDocs.length === 0 ? (
          <Card>
            <CardContent className="py-8 pt-6 text-center">
              <p className="font-custom text-muted-foreground">
                {searchQuery
                  ? 'No readings match your search.'
                  : 'No temperature readings yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-xl">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-custom px-4 py-3"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="font-custom px-4 py-3"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </main>
  );
});

export default TemperatureMonitoringPage;
