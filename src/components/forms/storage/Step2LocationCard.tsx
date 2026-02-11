import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/forms/date-picker';
import type {
  SizeLocation,
  StoragePassState,
} from '@/components/forms/storage/storage-form-types';

export interface Step2LocationCardProps {
  pass: StoragePassState;
  sizesWithQuantity: string[];
  locationErrors: Record<string, string>;
  onDateChange: (value: string) => void;
  onLocationChange: (
    size: string,
    field: keyof SizeLocation,
    value: string
  ) => void;
  onRemarksChange: (value: string) => void;
}

export const Step2LocationCard = memo(function Step2LocationCard({
  pass,
  sizesWithQuantity,
  locationErrors,
  onDateChange,
  onLocationChange,
  onRemarksChange,
}: Step2LocationCardProps) {
  return (
    <Card key={pass.id} className="relative">
      <CardContent className="space-y-4">
        <Field>
          <DatePicker
            value={pass.date}
            onChange={(value) => onDateChange(value ?? '')}
            label="Date"
            id={`storage-date-${pass.id}`}
          />
        </Field>
        <div className="border-border/60 bg-muted/20 rounded-lg border p-4">
          <h3 className="font-custom text-foreground mb-3 text-sm font-semibold">
            Location for this pass
          </h3>
          <p className="font-custom text-muted-foreground mb-3 text-xs">
            Enter chamber, floor and row for each size allocated in this pass.
          </p>
          <div className="space-y-4">
            {sizesWithQuantity.map((size) => {
              const loc = pass.sizeLocations[size] ?? {
                chamber: '',
                floor: '',
                row: '',
              };
              const error = locationErrors[size];
              return (
                <div
                  key={size}
                  className="border-border/40 rounded-md border p-3"
                >
                  <p className="font-custom text-foreground mb-2 font-medium">
                    {size}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field data-invalid={!!error}>
                      <FieldLabel className="font-custom text-xs">
                        Chamber
                      </FieldLabel>
                      <Input
                        value={loc.chamber}
                        onChange={(e) =>
                          onLocationChange(size, 'chamber', e.target.value)
                        }
                        placeholder="e.g. C1"
                        className="font-custom"
                      />
                    </Field>
                    <Field data-invalid={!!error}>
                      <FieldLabel className="font-custom text-xs">
                        Floor
                      </FieldLabel>
                      <Input
                        value={loc.floor}
                        onChange={(e) =>
                          onLocationChange(size, 'floor', e.target.value)
                        }
                        placeholder="e.g. F1"
                        className="font-custom"
                      />
                    </Field>
                    <Field data-invalid={!!error}>
                      <FieldLabel className="font-custom text-xs">
                        Row
                      </FieldLabel>
                      <Input
                        value={loc.row}
                        onChange={(e) =>
                          onLocationChange(size, 'row', e.target.value)
                        }
                        placeholder="e.g. R1"
                        className="font-custom"
                      />
                    </Field>
                  </div>
                  {error && (
                    <p className="font-custom text-destructive mt-1 text-xs">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <Field>
          <FieldLabel
            htmlFor={`storage-remarks-${pass.id}`}
            className="font-custom text-sm"
          >
            Remarks
          </FieldLabel>
          <textarea
            id={`storage-remarks-${pass.id}`}
            value={pass.remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            placeholder="Max 500 characters"
            maxLength={500}
            rows={2}
            className="border-input bg-background ring-offset-background focus-visible:ring-primary font-custom flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </Field>
      </CardContent>
    </Card>
  );
});
