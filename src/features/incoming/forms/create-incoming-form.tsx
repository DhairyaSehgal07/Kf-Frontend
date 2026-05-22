import { useEffect, useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IncomingSummarySheet } from "@/features/incoming/forms/incoming-summary-sheet"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerInput } from "@/components/date-picker"
import { useAuthStore } from "@/features/auth/store/use-auth-store"
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from "@/components/searchable-option-combobox"
import { incomingFormSchema } from "@/features/incoming/schemas/incoming-form-schema"
import { defaultSubmitMeta } from "@/features/incoming/types"
const VARIETY_ITEMS = ["Himalini", "K. Pukhraj", "K. Jyoti"].map((value) => ({
  id: value,
  label: value,
}))

const CATEGORY_ITEMS = ["A", "B", "C"].map((value) => ({
  id: value,
  label: value,
}))

const STAGE_ITEMS = ["Incoming", "Grading", "Storage"].map((value) => ({
  id: value,
  label: value,
}))

const MOCK_FARMER_LINKS = [
  {
    id: "507f1f77bcf86cd799439011",
    label: "Rajesh Sehgal — Acct #12045",
  },
  {
    id: "507f191e810c19729de860ea",
    label: "Gurpreet Singh — Acct #9821",
  },
  {
    id: "507f191e810c19729de860eb",
    label: "Harbhajan Singh — Acct #7643",
  },
  {
    id: "507f191e810c19729de860ec",
    label: "Maninder Pal — Acct #4512",
  },
  {
    id: "507f191e810c19729de860ed",
    label: "Jaswinder Kaur — Acct #8834",
  },
  {
    id: "507f191e810c19729de860ee",
    label: "Baldev Singh — Acct #2391",
  },
  {
    id: "507f191e810c19729de860ef",
    label: "Ranjit Kumar — Acct #6745",
  },
  {
    id: "507f191e810c19729de860f0",
    label: "Sukhchain Singh — Acct #1189",
  },
  {
    id: "507f191e810c19729de860f1",
    label: "Paramjit Kaur — Acct #5520",
  },
  {
    id: "507f191e810c19729de860f2",
    label: "Kuldeep Singh — Acct #9076",
  },
  {
    id: "507f191e810c19729de860f3",
    label: "Amritpal Singh — Acct #3318",
  },
  {
    id: "507f191e810c19729de860f4",
    label: "Navjot Singh — Acct #4467",
  },
] as const

function isFieldInvalid(
  meta: { isTouched: boolean; isValid: boolean }
) {
  return meta.isTouched && !meta.isValid
}

function parseOptionalPositiveNumber(value: string): number | undefined {
  if (value === "") return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function parseNumber(value: string): number {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const numericInputProps = {
  type: "number" as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
}

const CreateIncomingForm = () => {
  const userId = useAuthStore((s) => s.user?._id ?? "")
  const todayIso = new Date().toISOString()
  const farmerOptions = useMemo<ComboboxOption[]>(
    () => [...MOCK_FARMER_LINKS],
    []
  )
  const [farmerSearch, setFarmerSearch] = useState("")
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false)
  const [varietySearch, setVarietySearch] = useState("")
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false)
  const [stageSearch, setStageSearch] = useState("")
  const [stageComboboxOpen, setStageComboboxOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions]
  )
  const sortedVarieties = useMemo(
    () => filterAndSortOptions(varietySearch, VARIETY_ITEMS),
    [varietySearch]
  )
  const sortedCategories = useMemo(
    () => filterAndSortOptions(categorySearch, CATEGORY_ITEMS),
    [categorySearch]
  )
  const sortedStages = useMemo(
    () => filterAndSortOptions(stageSearch, STAGE_ITEMS),
    [stageSearch]
  )

  const form = useForm({
    defaultValues: {
      manualGatePassNumber: undefined as number | undefined,
      truckNumber: "",
      farmerStorageLinkId: "",
      createdBy: userId,
      variety: "",
      category: "",
      stage: "",
      date: todayIso,
      bagsReceived: 0,
      weightSlip: {
        slipNumber: "",
        grossWeightKg: 0,
        tareWeightKg: 0,
      },
      status: "NOT_GRADED",
      remarks: "",
    },
    validators: {
      onChange: incomingFormSchema,
      onSubmit: incomingFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = incomingFormSchema.parse(value)

      if (meta.submitAction === "review") {
        setReviewOpen(true)
        return
      }

      console.log(parsed)
      setReviewOpen(false)
    },
  })

  const getFarmerLabel = (farmerStorageLinkId: string) =>
    farmerOptions.find((option) => option.id === farmerStorageLinkId)
      ?.label ?? farmerStorageLinkId

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: "review" })
  }

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: "submit" })
  }

  useEffect(() => {
    if (userId) {
      form.setFieldValue("createdBy", userId)
    }
  }, [userId])

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="text-2xl">Incoming Gate Pass <span className="text-primary text-2xl">#1024</span></CardTitle>
        <CardDescription className="text-base">
          Record transport, crop, and weighbridge details for a new incoming gate pass.
        </CardDescription>
      </CardHeader>

      {/* Wrap the content and footer inside the form so the submit
        button in the footer triggers the submission properly.
      */}
      <form
        id="create-incoming-form"
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">

            {/* General Information */}
            <FieldSet>
              <FieldLegend className="text-lg font-semibold">General Information</FieldLegend>
              <FieldDescription>
                Basic details regarding the transport and timing.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="manualGatePassNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Manual Gate Pass No.
                        </FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              parseOptionalPositiveNumber(e.target.value)
                            )
                          }
                          aria-invalid={isInvalid}
                          placeholder="e.g. 1024 (optional)"
                        />
                        <FieldDescription>
                          Leave blank if no manual slip number was issued.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="truckNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Truck Number
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g. PB08 AB 1234"
                          className="uppercase"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="date">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <DatePickerInput
                          id={field.name}
                          label="Date"
                          value={
                            field.state.value
                              ? new Date(field.state.value)
                              : undefined
                          }
                          onChange={(date) =>
                            field.handleChange(date ? date.toISOString() : "")
                          }
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          placeholder="Pick a date"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="farmerStorageLinkId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-incoming-farmer">
                          Farmer Link
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-incoming-farmer"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search farmers..."
                          emptyMessage="No farmers found."
                          options={farmerOptions}
                          sortedOptions={sortedFarmers}
                          search={farmerSearch}
                          setSearch={setFarmerSearch}
                          open={farmerComboboxOpen}
                          setOpen={setFarmerComboboxOpen}
                        />
                        <FieldDescription>
                          Link this pass to a storage account.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Crop Information */}
            <FieldSet>
              <FieldLegend className="text-lg font-semibold">Crop Information</FieldLegend>
              <FieldDescription>
                Variety, grade, and quantity received at the gate.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="variety">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-incoming-variety">
                          Variety
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-incoming-variety"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search varieties..."
                          emptyMessage="No varieties found."
                          options={VARIETY_ITEMS}
                          sortedOptions={sortedVarieties}
                          search={varietySearch}
                          setSearch={setVarietySearch}
                          open={varietyComboboxOpen}
                          setOpen={setVarietyComboboxOpen}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="category">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-incoming-category">
                          Category
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-incoming-category"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search categories..."
                          emptyMessage="No categories found."
                          options={CATEGORY_ITEMS}
                          sortedOptions={sortedCategories}
                          search={categorySearch}
                          setSearch={setCategorySearch}
                          open={categoryComboboxOpen}
                          setOpen={setCategoryComboboxOpen}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="stage">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-incoming-stage">
                          Stage
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-incoming-stage"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search stages..."
                          emptyMessage="No stages found."
                          options={STAGE_ITEMS}
                          sortedOptions={sortedStages}
                          search={stageSearch}
                          setSearch={setStageSearch}
                          open={stageComboboxOpen}
                          setOpen={setStageComboboxOpen}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="bagsReceived">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Bags Received
                        </FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(parseNumber(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          placeholder="Quantity count"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Weight Slip Data */}
            <FieldSet>
              <FieldLegend className="text-lg font-semibold">Weight Slip Data</FieldLegend>
              <FieldDescription>
                Details captured from the weighbridge slip.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-3">
                <form.Field name="weightSlip.slipNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Slip Number
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g. WS-001"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="weightSlip.grossWeightKg">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Gross Weight (kg)
                        </FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(parseNumber(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          placeholder="Total weight"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="weightSlip.tareWeightKg">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Tare Weight (kg)
                        </FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(parseNumber(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          placeholder="Vehicle empty weight"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
              </FieldGroup>

              {/* Elevated visual presentation for Calculated Data */}
              <form.Subscribe
                selector={(state) => state.values.weightSlip}
                children={(weightSlip) => {
                  const net = weightSlip.grossWeightKg - weightSlip.tareWeightKg
                  const showNet =
                    weightSlip.grossWeightKg > 0 &&
                    weightSlip.tareWeightKg >= 0 &&
                    net >= 0

                  if (!showNet) return null

                  return (
                    <div className="mt-6 flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Calculated Net Weight
                      </span>
                      <span className="text-lg font-semibold text-foreground tracking-tight">
                        {net.toLocaleString()} kg
                      </span>
                    </div>
                  )
                }}
              />
            </FieldSet>

            <FieldSeparator />

            {/* Additional Notes */}
            <FieldSet>
              <FieldLegend className="text-lg font-semibold">Additional Notes</FieldLegend>
              <FieldGroup className="mt-5">
                <form.Field name="remarks">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="sr-only">Remarks</FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Add any additional comments or observations (Optional)"
                          className="min-h-[120px] resize-y"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t bg-muted/30 py-6">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              form.reset()
              setFarmerSearch("")
              setFarmerComboboxOpen(false)
              setVarietySearch("")
              setVarietyComboboxOpen(false)
              setCategorySearch("")
              setCategoryComboboxOpen(false)
              setStageSearch("")
              setStageComboboxOpen(false)
            }}
          >
            Reset Form
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleOpenReview}
              >
                {isSubmitting ? "Validating…" : "Review"}
              </Button>
            )}
          />
        </CardFooter>
      </form>

      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
        children={({ values, canSubmit, isSubmitting }) => {
          const parsed = incomingFormSchema.safeParse(values)

          return (
            <IncomingSummarySheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              values={parsed.success ? parsed.data : null}
              farmerLabel={
                parsed.success
                  ? getFarmerLabel(parsed.data.farmerStorageLinkId)
                  : ""
              }
              onBack={() => setReviewOpen(false)}
              onSubmit={handleConfirmSubmit}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
            />
          )
        }}
      />
    </Card>
  )
}

export default CreateIncomingForm