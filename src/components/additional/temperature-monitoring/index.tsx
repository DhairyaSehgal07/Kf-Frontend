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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import TemperatureChart from './TemperatureChart';
import {
  Search,
  RefreshCw,
  Thermometer,
  Plus,
  Pencil,
  CalendarIcon,
} from 'lucide-react';
import { DatePicker } from '@/components/forms/date-picker';
import { formatDate as formatDateDDMMYYYY } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

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

/** True if doc's date (ISO string) falls on the same calendar day (local) as dd.mm.yyyy */
function isDocDateOn(docDateStr: string, ddMmYyyy: string): boolean {
  const selected = parseDDMMYYYY(ddMmYyyy);
  if (!selected) return false;
  const docDate = new Date(docDateStr);
  return (
    selected.getFullYear() === docDate.getFullYear() &&
    selected.getMonth() === docDate.getMonth() &&
    selected.getDate() === docDate.getDate()
  );
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
/** localStorage key for preset temperatures per chamber */
const PRESET_STORAGE_KEY = 'temperature-monitoring-presets';

/** Color ranges per spec: Green 32–33, Yellow 34–40, Blue 41–48, Red >48, Gray <32 */
function getTempRangeClassName(value: number): string {
  if (value >= 32 && value <= 33)
    return 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100';
  if (value >= 34 && value <= 40)
    return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100';
  if (value >= 41 && value <= 48)
    return 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100';
  if (value > 48)
    return 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

/** Default payload for create form: 6 chambers with empty values */
const DEFAULT_CHAMBER_IDS = ['1', '2', '3', '4', '5', '6'] as const;

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
    .length(6, 'Exactly 6 chamber readings required'),
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
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);
  const [presetTemps, setPresetTemps] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, number>;
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  });
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

  useEffect(() => {
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presetTemps));
    } catch {
      /* ignore */
    }
  }, [presetTemps]);

  const setPresetForChamber = (chamberId: string, value: number | '') => {
    setPresetTemps((prev) => {
      const next = { ...prev };
      if (value === '') {
        delete next[chamberId];
      } else {
        next[chamberId] = value;
      }
      return next;
    });
  };

  const filteredDocs = useMemo(() => {
    let docs = temperatureDocs;
    if (dateFilter?.trim()) {
      docs = docs.filter((doc) => isDocDateOn(doc.date, dateFilter.trim()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter((doc) => {
        const matchChamberOrValue = doc.temperatureReading.some(
          (r) =>
            r.chamber.toLowerCase().includes(q) || String(r.value).includes(q)
        );
        return (
          doc.date.toLowerCase().includes(q) ||
          doc._id.toLowerCase().includes(q) ||
          matchChamberOrValue
        );
      });
    }
    return docs;
  }, [temperatureDocs, dateFilter, searchQuery]);

  const chartData = useMemo(() => {
    const sorted = [...filteredDocs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const slice = sorted.slice(-30);
    return slice.map((doc) => {
      const byChamber: Record<string, number> = {};
      for (const r of doc.temperatureReading ?? []) {
        byChamber[r.chamber] = r.value;
      }
      return {
        date: doc.date,
        ch1: byChamber['1'] ?? null,
        ch2: byChamber['2'] ?? null,
        ch3: byChamber['3'] ?? null,
        ch4: byChamber['4'] ?? null,
        ch5: byChamber['5'] ?? null,
        ch6: byChamber['6'] ?? null,
      };
    });
  }, [filteredDocs]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => (
          <span className="font-custom text-sm font-medium">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      ...DEFAULT_CHAMBER_IDS.map((chamberId) =>
        columnHelper.display({
          id: `chamber-${chamberId}`,
          header: `Ch ${chamberId}`,
          cell: ({ row }) => {
            const readings = row.original.temperatureReading ?? [];
            const reading = readings.find((r) => r.chamber === chamberId);
            const value = reading?.value;
            const preset = presetTemps[chamberId];
            const diff =
              value != null && preset != null ? value - preset : null;
            const rangeClass =
              value != null ? getTempRangeClassName(value) : '';
            return (
              <div
                className={cn(
                  'font-custom rounded-md px-2 py-1.5 text-sm font-medium tabular-nums',
                  value != null ? rangeClass : ''
                )}
              >
                {value != null ? (
                  <>
                    {value}
                    {UNIT}
                    {diff !== null && (
                      <span className="ml-0.5 opacity-90">
                        ({diff >= 0 ? '+' : ''}
                        {diff})
                      </span>
                    )}
                  </>
                ) : (
                  '–'
                )}
              </div>
            );
          },
        })
      ),
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
    [presetTemps]
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
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-4 flex-1" />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="border-border flex gap-4 border-b px-4 py-3 last:border-0"
                >
                  {[...Array(6)].map((_, j) => (
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

        {/* Preset temperatures (target per chamber for comparison) */}
        <Card className="border-border rounded-xl shadow-sm">
          <CardHeader className="border-border border-b px-6 py-4">
            <CardTitle className="font-custom text-lg font-semibold">
              Preset temperatures
            </CardTitle>
            <CardDescription className="font-custom text-sm">
              Set target temperature per chamber. Daily readings are compared
              against these; difference is shown in brackets in the table.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-6 py-4">
            <div className="flex flex-wrap items-end gap-4">
              {DEFAULT_CHAMBER_IDS.map((chamberId) => (
                <div
                  key={chamberId}
                  className="font-custom flex flex-col gap-1.5"
                >
                  <label
                    htmlFor={`preset-ch-${chamberId}`}
                    className="text-muted-foreground text-xs font-medium"
                  >
                    Ch {chamberId} ({UNIT})
                  </label>
                  <Input
                    id={`preset-ch-${chamberId}`}
                    type="number"
                    min={TEMP_MIN}
                    max={TEMP_MAX}
                    placeholder="Preset"
                    value={presetTemps[chamberId] ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') {
                        setPresetForChamber(chamberId, '');
                        return;
                      }
                      const num = Number(v);
                      if (!Number.isNaN(num))
                        setPresetForChamber(chamberId, num);
                    }}
                    className="w-24"
                  />
                </div>
              ))}
            </div>
            <p className="text-muted-foreground font-custom text-xs">
              Table colours: Green 32–33, Yellow 34–40, Blue 41–48, Red &gt;48,
              Grey &lt;32 ({UNIT}).
            </p>
          </CardContent>
        </Card>

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
              <DialogContent className="font-custom flex max-h-[90vh] flex-col overflow-hidden p-4 sm:max-w-[540px] sm:p-6">
                <form
                  className="flex min-h-0 flex-1 flex-col"
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addForm.handleSubmit();
                  }}
                >
                  <DialogHeader>
                    <DialogTitle className="font-custom text-left">
                      Add temperature reading
                    </DialogTitle>
                    <DialogDescription className="text-left">
                      Enter temperature values for all 6 chambers and the date.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="min-h-0 flex-1 overflow-y-auto py-4">
                    <FieldGroup className="grid gap-4">
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
                              <div className="flex h-10 flex-wrap items-center gap-2">
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
                                    'border-input bg-background font-custom h-10 min-w-0 flex-1 rounded-md border px-3 py-2 text-sm shadow-sm transition-colors sm:max-w-[8.5rem]',
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
                                        parseDDMMYYYY(parts.dateStr) ??
                                        undefined
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
                                  className="font-custom focus-visible:ring-primary h-10 w-14 shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-16"
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
                                    'border-input bg-background font-custom h-10 w-14 shrink-0 rounded-md border px-2 py-2 text-sm shadow-sm transition-colors sm:w-16',
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {DEFAULT_CHAMBER_IDS.map((chamberId, i) => (
                          <div
                            key={chamberId}
                            className="border-border bg-muted/20 rounded-lg border p-3"
                          >
                            <addForm.Field
                              name={`temperatureReading[${i}].value`}
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel
                                      htmlFor={`add-chamber-${chamberId}-value`}
                                      className="font-custom text-xs font-medium"
                                    >
                                      Chamber {chamberId} ({UNIT})
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
                                      className="font-custom focus-visible:ring-primary mt-1.5 [appearance:textfield] focus-visible:ring-2 focus-visible:ring-offset-2 [&]:[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                      </div>
                    </FieldGroup>
                  </div>
                  <DialogFooter className="mt-4 shrink-0 border-t pt-4 sm:mt-6">
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

        {/* Search by date */}
        <Item variant="outline" size="sm" className="rounded-xl">
          <ItemHeader className="flex flex-wrap items-end gap-4">
            <DatePicker
              id="temperature-date-filter"
              label="Search by date"
              value={dateFilter}
              onChange={(value) => setDateFilter(value || undefined)}
            />
            {dateFilter && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="font-custom text-muted-foreground hover:text-foreground -mb-1 gap-1.5"
                onClick={() => setDateFilter(undefined)}
              >
                <X className="h-4 w-4" />
                Clear date filter
              </Button>
            )}
          </ItemHeader>
        </Item>

        {/* Temperature trend line chart */}
        <TemperatureChart data={chartData} />

        {/* Table */}
        {filteredDocs.length === 0 ? (
          <Card>
            <CardContent className="py-8 pt-6 text-center">
              <p className="font-custom text-muted-foreground">
                {dateFilter
                  ? 'No temperature readings found for this date. Try another date or clear the date filter.'
                  : searchQuery
                    ? 'No readings match your search.'
                    : 'No temperature readings yet.'}
              </p>
              {dateFilter && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-custom mt-4"
                  onClick={() => setDateFilter(undefined)}
                >
                  Clear date filter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="border-border overflow-x-auto rounded-lg border">
            <Table className="border-collapse">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-border bg-muted hover:bg-muted"
                  >
                    {headerGroup.headers.map((header, i) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'font-custom border-border border px-4 py-2 font-bold',
                          i === 0 ? 'text-left' : 'text-center'
                        )}
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
                  <TableRow
                    key={row.id}
                    className="border-border hover:bg-transparent"
                  >
                    {row.getVisibleCells().map((cell, i) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'font-custom border-border border px-4 py-2',
                          i === 0 ? 'text-left' : 'text-center'
                        )}
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
          </div>
        )}

        {/* Edit dialog */}
        <Dialog
          open={editingDoc != null}
          onOpenChange={handleEditDialogOpenChange}
        >
          <DialogContent className="font-custom flex max-h-[90vh] flex-col overflow-hidden p-4 sm:max-w-[540px] sm:p-6">
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateForm.handleSubmit();
              }}
            >
              <DialogHeader>
                <DialogTitle className="font-custom text-left">
                  Update temperature record
                </DialogTitle>
                <DialogDescription className="text-left">
                  Change date or chamber readings for this record.
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto py-4">
                <FieldGroup className="grid gap-4">
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
                          <div className="flex h-10 flex-wrap items-center gap-2">
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
                                'border-input bg-background font-custom h-10 min-w-0 flex-1 rounded-md border px-3 py-2 text-sm shadow-sm transition-colors sm:max-w-[8.5rem]',
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
                              className="font-custom focus-visible:ring-primary h-10 w-14 shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-16"
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
                                'border-input bg-background font-custom h-10 w-14 shrink-0 rounded-md border px-2 py-2 text-sm shadow-sm transition-colors sm:w-16',
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {editingDoc?.temperatureReading.map((_, i) => (
                      <div
                        key={editingDoc._id + i}
                        className="border-border bg-muted/20 rounded-lg border p-3"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <updateForm.Field
                            name={`temperatureReading[${i}].chamber`}
                            children={(field) => (
                              <Field>
                                <FieldLabel
                                  htmlFor={`edit-reading-${i}-chamber`}
                                  className="font-custom text-xs font-medium"
                                >
                                  Chamber
                                </FieldLabel>
                                <Input
                                  id={`edit-reading-${i}-chamber`}
                                  name={field.name}
                                  value={field.state.value ?? ''}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  placeholder="e.g. 1"
                                  className="font-custom focus-visible:ring-primary mt-1.5 focus-visible:ring-2 focus-visible:ring-offset-2"
                                />
                              </Field>
                            )}
                          />
                          <updateForm.Field
                            name={`temperatureReading[${i}].value`}
                            children={(field) => (
                              <Field>
                                <FieldLabel
                                  htmlFor={`edit-reading-${i}-value`}
                                  className="font-custom text-xs font-medium"
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
                                  className="font-custom focus-visible:ring-primary mt-1.5 [appearance:textfield] focus-visible:ring-2 focus-visible:ring-offset-2 [&]:[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                              </Field>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </FieldGroup>
              </div>
              <DialogFooter className="mt-4 shrink-0 border-t pt-4 sm:mt-6">
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
