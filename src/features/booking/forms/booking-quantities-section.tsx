import { Plus, Trash2 } from "lucide-react"

import {
  BagSizeSelectField,
  FixedBagSizeLabel,
} from "@/components/bag-quantity-size-field"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { CreateBookingFormApi } from "@/features/booking/forms/use-create-booking-form"
import {
  createDefaultBookingQuantities,
  createEmptyBookingQuantityRow,
} from "@/features/booking/schemas/booking-form-schema"

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid
}

function parseOptionalNonNegativeNumber(value: string): number | undefined {
  if (value === "") return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const numericInputProps = {
  type: "number" as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
}

type BookingQuantitiesSectionProps = {
  form: CreateBookingFormApi
}

export function BookingQuantitiesSection({
  form,
}: BookingQuantitiesSectionProps) {
  return (
    <FieldSet>
      <FieldLegend className="font-heading text-base font-semibold">
        Enter Quantities
      </FieldLegend>
      <FieldDescription>
        Enter bag counts for each size. Use Add more for an extra size line. Rows
        with zero or empty quantity are ignored on submit.
      </FieldDescription>

      <div className="mt-5 rounded-lg border border-border">
        <div className="hidden border-b border-border bg-muted/50 px-3 py-2.5 md:grid md:grid-cols-12 md:gap-2">
          <div className="col-span-5 text-sm font-medium text-muted-foreground">
            Size
          </div>
          <div className="col-span-5 text-right text-sm font-medium text-muted-foreground">
            Quantity
          </div>
          <div className="col-span-2" aria-hidden />
        </div>

        <form.Field name="quantities" mode="array">
          {(field) => {
            const arrayErrors = field.state.meta.errors
            const arrayErrorMessage =
              arrayErrors.length > 0
                ? typeof arrayErrors[0] === "string"
                  ? arrayErrors[0]
                  : arrayErrors[0]?.message
                : undefined

            return (
              <>
                <div className="divide-y divide-border">
                  {field.state.value.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-3 px-3 py-3 md:grid-cols-12 md:items-start md:gap-2 md:py-2.5"
                    >
                      <div className="md:col-span-5">
                        {row.isExtra ? (
                          <form.Field name={`quantities[${index}].size`}>
                            {(subField) => (
                              <BagSizeSelectField
                                id={subField.name}
                                name={subField.name}
                                value={subField.state.value}
                                rowIndex={index}
                                labelClassName="md:sr-only"
                                isInvalid={isFieldInvalid(subField.state.meta)}
                                errors={subField.state.meta.errors}
                                onBlur={subField.handleBlur}
                                onValueChange={subField.handleChange}
                              />
                            )}
                          </form.Field>
                        ) : (
                          <FixedBagSizeLabel size={row.size} rowIndex={index} />
                        )}
                      </div>

                      <div className="md:col-span-5">
                        <form.Field name={`quantities[${index}].qty`}>
                          {(subField) => {
                            const isInvalid = isFieldInvalid(subField.state.meta)
                            const sizeLabel = row.size || `row ${index + 1}`
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel
                                  htmlFor={subField.name}
                                  className="md:sr-only"
                                >
                                  Quantity ({sizeLabel})
                                </FieldLabel>
                                <Input
                                  {...numericInputProps}
                                  id={subField.name}
                                  name={subField.name}
                                  inputMode="numeric"
                                  placeholder="Qty"
                                  value={subField.state.value ?? ""}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) =>
                                    subField.handleChange(
                                      parseOptionalNonNegativeNumber(
                                        e.target.value,
                                      ),
                                    )
                                  }
                                  aria-invalid={isInvalid}
                                  className="text-right tabular-nums"
                                />
                                {isInvalid && (
                                  <FieldError
                                    errors={subField.state.meta.errors}
                                  />
                                )}
                              </Field>
                            )
                          }}
                        </form.Field>
                      </div>

                      <div className="flex justify-end md:col-span-2">
                        {row.isExtra ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-11 shrink-0 md:size-10"
                            aria-label={`Remove row ${index + 1}`}
                            onClick={() => field.removeValue(index)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {arrayErrorMessage && (
                  <p className="px-3 pt-3 text-sm text-destructive">
                    {arrayErrorMessage}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 border-t border-border px-3 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() =>
                      field.pushValue(createEmptyBookingQuantityRow())
                    }
                  >
                    <Plus className="mr-2 size-4" aria-hidden />
                    Add more
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() =>
                      form.setFieldValue(
                        "quantities",
                        createDefaultBookingQuantities(),
                      )
                    }
                  >
                    Clear quantities
                  </Button>
                </div>
              </>
            )
          }}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => state.values.quantities}
        children={(quantities) => {
          const totalBags = quantities.reduce(
            (sum, row) => sum + (row.qty ?? 0),
            0,
          )

          return (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
              <span className="text-sm font-semibold text-foreground">
                Total bags
              </span>
              <span className="font-heading text-xl font-semibold tabular-nums text-foreground">
                {totalBags.toLocaleString("en-IN")}
              </span>
            </div>
          )
        }}
      />
    </FieldSet>
  )
}
