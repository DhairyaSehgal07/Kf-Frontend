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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import {
  Search,
  RefreshCw,
  Thermometer,
  Plus,
  Pencil,
  CalendarIcon,
  BarChart3,
} from 'lucide-react';
import { formatDate as formatDateDDMMYYYY } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

/** Today's date in YYYY-MM-DDTHH:mm for datetime-local input */
function getTodayDatetimeLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

/** ISO date string to YYYY-MM-DDTHH:mm for datetime-local input */
function toDatetimeLocal(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 16);
}

/** YYYY-MM-DDTHH:mm → { dateStr: dd.mm.yyyy, timeStr: HH:mm } */
function datetimeLocalToParts(datetimeLocal: string): {
  dateStr: string;
  timeStr: string;
} {
  const d = new Date(datetimeLocal);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return {
      dateStr: formatDateDDMMYYYY(now),
      timeStr: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };
  }
  return {
    dateStr: formatDateDDMMYYYY(d),
    timeStr: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  };
}

/** Parse dd.mm.yyyy to Date (calendar uses this) */
function parseDDMMYYYY(str: string): Date | undefined {
  const [day, month, year] = str.split('.').map(Number);
  if (!day || !month || !year) return undefined;
  const parsed = new Date(year, month - 1, day);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

/** dd.mm.yyyy + HH:mm → YYYY-MM-DDTHH:mm */
function partsToDatetimeLocal(dateStr: string, timeStr: string): string {
  const date = parseDDMMYYYY(dateStr);
  const [h = 0, m = 0] = timeStr.trim().split(':').map(Number);
  const d = date ?? new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(Math.min(23, Math.max(0, h))).padStart(2, '0');
  const min = String(Math.min(59, Math.max(0, m))).padStart(2, '0');
  return `${y}-${mo}-${day}T${hour}:${min}`;
}

/** HH:mm (24h) → { timeStr12: "h:mm", period: "AM"|"PM" } */
function time24To12Parts(time24: string): {
  timeStr12: string;
  period: 'AM' | 'PM';
} {
  const [h = 0, m = 0] = time24.trim().split(':').map(Number);
  const hour = Math.min(23, Math.max(0, h));
  const minute = Math.min(59, Math.max(0, m));
  const period: 'AM' | 'PM' = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const timeStr12 = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { timeStr12, period };
}

/** "h:mm" + AM|PM → HH:mm (24h) */
function time12PartsTo24(timeStr12: string, period: 'AM' | 'PM'): string {
  const [h = 0, m = 0] = timeStr12.trim().split(':').map(Number);
  let hour24 = h;
  if (period === 'AM') {
    hour24 = h === 12 ? 0 : h;
  } else {
    hour24 = h === 12 ? 12 : h + 12;
  }
  hour24 = Math.min(23, Math.max(0, hour24));
  const minute = Math.min(59, Math.max(0, m));
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
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

/** Color ranges for charts (from legend): Green 32–33, Yellow 34–40, Blue 41–48, Red >48, Gray <32 */
const TEMP_RANGE_COLORS = {
  green: 'oklch(0.55 0.18 149)', // 32–33°F
  yellow: 'oklch(0.88 0.15 95)', // 34–40°F
  blue: 'oklch(0.55 0.2 250)', // 41–48°F
  red: 'oklch(0.55 0.22 25)', // Above 48°F
  gray: 'oklch(0.65 0.02 250)', // Below 32°F
} as const;

function getTemperatureRangeColor(value: number): string {
  if (value >= 32 && value <= 33) return TEMP_RANGE_COLORS.green;
  if (value >= 34 && value <= 40) return TEMP_RANGE_COLORS.yellow;
  if (value >= 41 && value <= 48) return TEMP_RANGE_COLORS.blue;
  if (value > 48) return TEMP_RANGE_COLORS.red;
  return TEMP_RANGE_COLORS.gray;
}

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
  const [addDatePopoverOpen, setAddDatePopoverOpen] = useState(false);
  const [editDatePopoverOpen, setEditDatePopoverOpen] = useState(false);
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

  /** Chart data: last 20 readings, one row per date with Chamber 1–4 values */
  const overviewChartData = useMemo(() => {
    const docs = [...filteredDocs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
      .reverse();
    return docs.map((doc) => {
      const row: Record<string, string | number> = {
        dateLabel: formatDate(doc.date),
        dateSort: doc.date,
      };
      const byChamber: Record<string, number> = {};
      for (const r of doc.temperatureReading ?? []) {
        byChamber[r.chamber] = r.value;
      }
      for (const c of DEFAULT_CHAMBER_IDS) {
        row[`Chamber ${c}`] = byChamber[c] ?? 0;
      }
      return row;
    });
  }, [filteredDocs]);

  /** Per-chamber series for chamber-wise analytics (last 15 dates per chamber) */
  const chamberWiseChartData = useMemo(() => {
    const docs = [...filteredDocs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const byChamber: Record<
      string,
      { dateLabel: string; dateSort: string; value: number }[]
    > = {};
    for (const c of DEFAULT_CHAMBER_IDS) {
      byChamber[c] = [];
    }
    for (const doc of docs.slice(0, 25)) {
      const dateLabel = formatDate(doc.date);
      for (const r of doc.temperatureReading ?? []) {
        if (byChamber[r.chamber]) {
          byChamber[r.chamber].push({
            dateLabel,
            dateSort: doc.date,
            value: r.value,
          });
        }
      }
    }
    // Oldest first for chart X axis
    for (const c of DEFAULT_CHAMBER_IDS) {
      byChamber[c].sort(
        (a, b) =>
          new Date(a.dateSort).getTime() - new Date(b.dateSort).getTime()
      );
    }
    return byChamber;
  }, [filteredDocs]);

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
      ...DEFAULT_CHAMBER_IDS.map((chamberId) =>
        columnHelper.display({
          id: `chamber-${chamberId}`,
          header: `Chamber ${chamberId} (${UNIT})`,
          cell: ({ row }) => {
            const readings = row.original.temperatureReading ?? [];
            const reading = readings.find((r) => r.chamber === chamberId);
            const value = reading?.value;
            return (
              <span className="font-custom text-sm font-medium">
                {value != null ? `${value}${UNIT}` : '–'}
              </span>
            );
          },
        })
      ),
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
              <DialogContent className="font-custom sm:max-w-[500px]">
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
                        const parts = datetimeLocalToParts(
                          field.state.value || getTodayDatetimeLocal()
                        );
                        const { timeStr12, period } = time24To12Parts(
                          parts.timeStr
                        );
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                            <div className="flex h-10 items-center gap-2">
                              <input
                                id={field.name}
                                type="text"
                                placeholder="dd.mm.yyyy"
                                value={parts.dateStr}
                                onBlur={field.handleBlur}
                                onChange={(e) => {
                                  const newDateStr = e.target.value;
                                  const parsed = parseDDMMYYYY(newDateStr);
                                  if (parsed) {
                                    field.handleChange(
                                      partsToDatetimeLocal(
                                        formatDateDDMMYYYY(parsed),
                                        parts.timeStr
                                      )
                                    );
                                  }
                                }}
                                aria-invalid={isInvalid}
                                className={cn(
                                  'border-input bg-background font-custom h-10 w-44 shrink-0 rounded-md border px-3 py-2 text-sm shadow-sm transition-colors',
                                  'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                                )}
                              />
                              <Popover
                                open={addDatePopoverOpen}
                                onOpenChange={setAddDatePopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0"
                                    aria-label="Open calendar"
                                  >
                                    <CalendarIcon className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  side="bottom"
                                  className="w-auto overflow-hidden p-0"
                                  align="start"
                                  sideOffset={10}
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      parseDDMMYYYY(parts.dateStr) ?? undefined
                                    }
                                    onSelect={(selectedDate) => {
                                      if (selectedDate) {
                                        field.handleChange(
                                          partsToDatetimeLocal(
                                            formatDateDDMMYYYY(selectedDate),
                                            parts.timeStr
                                          )
                                        );
                                        setAddDatePopoverOpen(false);
                                      }
                                    }}
                                    captionLayout="dropdown"
                                  />
                                </PopoverContent>
                              </Popover>
                              <Input
                                type="text"
                                placeholder="hh:mm"
                                value={timeStr12}
                                onChange={(e) =>
                                  field.handleChange(
                                    partsToDatetimeLocal(
                                      parts.dateStr,
                                      time12PartsTo24(e.target.value, period)
                                    )
                                  )
                                }
                                onBlur={field.handleBlur}
                                aria-invalid={isInvalid}
                                className="font-custom focus-visible:ring-primary h-10 w-16 shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2"
                              />
                              <select
                                aria-label="AM or PM"
                                value={period}
                                onChange={(e) => {
                                  const amPm = e.target.value as 'AM' | 'PM';
                                  field.handleChange(
                                    partsToDatetimeLocal(
                                      parts.dateStr,
                                      time12PartsTo24(timeStr12, amPm)
                                    )
                                  );
                                }}
                                onBlur={field.handleBlur}
                                className={cn(
                                  'border-input bg-background font-custom h-10 w-16 shrink-0 rounded-md border px-2 py-2 text-sm shadow-sm transition-colors',
                                  'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                                )}
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
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
                    {DEFAULT_CHAMBER_IDS.map((chamberId, i) => (
                      <div
                        key={chamberId}
                        className="border-border bg-muted/20 flex flex-wrap items-end gap-3 rounded-lg border p-3"
                      >
                        <Field className="min-w-0 flex-1">
                          <FieldLabel className="text-xs">Chamber</FieldLabel>
                          <Input
                            disabled
                            value={chamberId}
                            className="font-custom bg-muted/50 mt-1"
                            aria-hidden
                            tabIndex={-1}
                          />
                        </Field>
                        <addForm.Field
                          name={`temperatureReading[${i}].value`}
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
                            return (
                              <Field
                                data-invalid={isInvalid}
                                className="min-w-0 flex-1"
                              >
                                <FieldLabel
                                  htmlFor={`add-chamber-${chamberId}-value`}
                                  className="text-xs"
                                >
                                  Temperature ({UNIT})
                                </FieldLabel>
                                <Input
                                  id={`add-chamber-${chamberId}-value`}
                                  name={field.name}
                                  type="number"
                                  step="0.1"
                                  value={
                                    field.state.value != null &&
                                    field.state.value !== 0
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
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === 'ArrowUp' ||
                                      e.key === 'ArrowDown'
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  placeholder="e.g. 35"
                                  aria-invalid={isInvalid}
                                  className="font-custom focus-visible:ring-primary mt-1 [appearance:textfield] focus-visible:ring-2 focus-visible:ring-offset-2 [&]:[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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

        {/* Temperature overview bar chart */}
        {overviewChartData.length > 0 && (
          <Card className="overflow-hidden rounded-xl">
            <CardContent className="pt-6">
              <div className="font-custom mb-4 flex flex-wrap items-center gap-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <BarChart3 className="text-primary h-5 w-5" />
                  Temperature overview
                </h3>
                <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: TEMP_RANGE_COLORS.green }}
                    />
                    <span>32–33{UNIT}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: TEMP_RANGE_COLORS.yellow }}
                    />
                    <span>34–40{UNIT}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: TEMP_RANGE_COLORS.blue }}
                    />
                    <span>41–48{UNIT}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: TEMP_RANGE_COLORS.red }}
                    />
                    <span>Above 48{UNIT}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: TEMP_RANGE_COLORS.gray }}
                    />
                    <span>Below 32{UNIT}</span>
                  </span>
                </div>
              </div>
              <ChartContainer
                config={{
                  value: { label: `Temperature (${UNIT})` },
                  ...Object.fromEntries(
                    DEFAULT_CHAMBER_IDS.map((c) => [
                      `Chamber ${c}`,
                      { label: `Chamber ${c}` },
                    ])
                  ),
                }}
                className="h-[280px] w-full"
              >
                <BarChart
                  data={overviewChartData}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                  />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    unit={UNIT}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value}${UNIT}`, '']}
                      />
                    }
                  />
                  {DEFAULT_CHAMBER_IDS.map((chamberId) => (
                    <Bar
                      key={chamberId}
                      dataKey={`Chamber ${chamberId}`}
                      name={`Chamber ${chamberId}`}
                      radius={[2, 2, 0, 0]}
                      maxBarSize={32}
                    >
                      {overviewChartData.map((entry, index) => (
                        <Cell
                          key={`${chamberId}-${index}`}
                          fill={getTemperatureRangeColor(
                            (entry[`Chamber ${chamberId}`] as number) || 0
                          )}
                        />
                      ))}
                    </Bar>
                  ))}
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Chamber-wise analytics */}
        {filteredDocs.length > 0 && (
          <Card className="overflow-hidden rounded-xl">
            <CardContent className="pt-6">
              <h3 className="font-custom mb-4 flex items-center gap-2 text-lg font-semibold">
                <Thermometer className="text-primary h-5 w-5" />
                Chamber-wise analytics
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {DEFAULT_CHAMBER_IDS.map((chamberId) => {
                  const series = chamberWiseChartData[chamberId] ?? [];
                  const values = series
                    .map((d) => d.value)
                    .filter((v) => v != null);
                  const min = values.length > 0 ? Math.min(...values) : null;
                  const max = values.length > 0 ? Math.max(...values) : null;
                  const avg =
                    values.length > 0
                      ? values.reduce((a, b) => a + b, 0) / values.length
                      : null;
                  const last =
                    series.length > 0 ? series[series.length - 1]?.value : null;
                  return (
                    <div
                      key={chamberId}
                      className="border-border bg-muted/20 flex flex-col rounded-lg border p-4"
                    >
                      <p className="font-custom mb-3 font-medium">
                        Chamber {chamberId}
                      </p>
                      <div className="font-custom mb-3 grid grid-cols-2 gap-2 text-xs">
                        {last != null && (
                          <span className="text-muted-foreground">
                            Last:{' '}
                            <span className="text-foreground font-medium">
                              {last}
                              {UNIT}
                            </span>
                          </span>
                        )}
                        {min != null && (
                          <span className="text-muted-foreground">
                            Min:{' '}
                            <span className="text-foreground font-medium">
                              {min.toFixed(1)}
                              {UNIT}
                            </span>
                          </span>
                        )}
                        {max != null && (
                          <span className="text-muted-foreground">
                            Max:{' '}
                            <span className="text-foreground font-medium">
                              {max.toFixed(1)}
                              {UNIT}
                            </span>
                          </span>
                        )}
                        {avg != null && (
                          <span className="text-muted-foreground">
                            Avg:{' '}
                            <span className="text-foreground font-medium">
                              {avg.toFixed(1)}
                              {UNIT}
                            </span>
                          </span>
                        )}
                      </div>
                      {series.length > 0 ? (
                        <ChartContainer
                          config={{
                            value: { label: `Temperature (${UNIT})` },
                          }}
                          className="h-[120px] w-full"
                        >
                          <BarChart
                            data={series}
                            margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                          >
                            <XAxis
                              dataKey="dateLabel"
                              tick={{ fontSize: 9 }}
                              tickLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis hide domain={['auto', 'auto']} />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value) => [`${value}${UNIT}`, '']}
                                />
                              }
                            />
                            <Bar
                              dataKey="value"
                              name="Temperature"
                              radius={[2, 2, 0, 0]}
                              maxBarSize={24}
                            >
                              {series.map((entry, index) => (
                                <Cell
                                  key={index}
                                  fill={getTemperatureRangeColor(entry.value)}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      ) : (
                        <p className="font-custom text-muted-foreground py-4 text-center text-xs">
                          No readings
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
                    const parts = datetimeLocalToParts(
                      field.state.value || getTodayDatetimeLocal()
                    );
                    const { timeStr12, period } = time24To12Parts(
                      parts.timeStr
                    );
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={`edit-${field.name}`}>
                          Date
                        </FieldLabel>
                        <div className="flex h-10 items-center gap-2">
                          <input
                            id={`edit-${field.name}`}
                            type="text"
                            placeholder="dd.mm.yyyy"
                            value={parts.dateStr}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const newDateStr = e.target.value;
                              const parsed = parseDDMMYYYY(newDateStr);
                              if (parsed) {
                                field.handleChange(
                                  partsToDatetimeLocal(
                                    formatDateDDMMYYYY(parsed),
                                    parts.timeStr
                                  )
                                );
                              }
                            }}
                            aria-invalid={isInvalid}
                            className={cn(
                              'border-input bg-background font-custom h-10 w-44 shrink-0 rounded-md border px-3 py-2 text-sm shadow-sm transition-colors',
                              'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                            )}
                          />
                          <Popover
                            open={editDatePopoverOpen}
                            onOpenChange={setEditDatePopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 shrink-0"
                                aria-label="Open calendar"
                              >
                                <CalendarIcon className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="bottom"
                              className="w-auto overflow-hidden p-0"
                              align="start"
                              sideOffset={10}
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  parseDDMMYYYY(parts.dateStr) ?? undefined
                                }
                                onSelect={(selectedDate) => {
                                  if (selectedDate) {
                                    field.handleChange(
                                      partsToDatetimeLocal(
                                        formatDateDDMMYYYY(selectedDate),
                                        parts.timeStr
                                      )
                                    );
                                    setEditDatePopoverOpen(false);
                                  }
                                }}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <Input
                            type="text"
                            placeholder="hh:mm"
                            value={timeStr12}
                            onChange={(e) =>
                              field.handleChange(
                                partsToDatetimeLocal(
                                  parts.dateStr,
                                  time12PartsTo24(e.target.value, period)
                                )
                              )
                            }
                            onBlur={field.handleBlur}
                            aria-invalid={isInvalid}
                            className="font-custom focus-visible:ring-primary h-10 w-16 shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2"
                          />
                          <select
                            aria-label="AM or PM"
                            value={period}
                            onChange={(e) => {
                              const amPm = e.target.value as 'AM' | 'PM';
                              field.handleChange(
                                partsToDatetimeLocal(
                                  parts.dateStr,
                                  time12PartsTo24(timeStr12, amPm)
                                )
                              );
                            }}
                            onBlur={field.handleBlur}
                            className={cn(
                              'border-input bg-background font-custom h-10 w-16 shrink-0 rounded-md border px-2 py-2 text-sm shadow-sm transition-colors',
                              'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                            )}
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
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
                              field.state.value != null &&
                              field.state.value !== 0
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
                            onWheel={(e) => e.currentTarget.blur()}
                            onKeyDown={(e) => {
                              if (
                                e.key === 'ArrowUp' ||
                                e.key === 'ArrowDown'
                              ) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="e.g. 35"
                            className="font-custom focus-visible:ring-primary mt-1 [appearance:textfield] focus-visible:ring-2 focus-visible:ring-offset-2 [&]:[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
      </div>
    </main>
  );
});

export default TemperatureMonitoringPage;
