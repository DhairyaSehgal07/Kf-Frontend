import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StorageQuantitiesSection } from "@/features/storage/forms/storage-quantities-section"
import { StorageSummarySheet } from "@/features/storage/forms/storage-summary-sheet"
import { useCreateStorageForm } from "@/features/storage/forms/use-create-storage-form"
import { createDefaultStorageQuantities } from "@/features/storage/schemas/storage-form-schema"
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
import { storageFormSchema } from "@/features/storage/schemas/storage-form-schema"

const VARIETY_ITEMS = ["Himalini", "K. Pukhraj", "K. Jyoti"].map((value) => ({
  id: value,
  label: value,
}))

const CATEGORY_ITEMS = ["A", "B", "C"].map((value) => ({
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

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid
}

function parseOptionalPositiveNumber(value: string): number | undefined {
  if (value === "") return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const numericInputProps = {
  type: "number" as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
}

const CreateStorageForm = () => {
  const userId = useAuthStore((s) => s.user?._id ?? "")
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

  const form = useCreateStorageForm({
    onOpenReview: () => setReviewOpen(true),
    onCloseReview: () => setReviewOpen(false),
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
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Storage Gate Pass{" "}
          <span className="text-primary">#—</span>
        </CardTitle>
        <CardDescription className="text-base">
          Record crop and account details for a new storage gate pass.
        </CardDescription>
      </CardHeader>

      <form
        id="create-storage-form"
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                General Information
              </FieldLegend>
              <FieldDescription>
                Gate pass reference, date, and linked farmer account.
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
                      <Field
                        data-invalid={isInvalid}
                        className="@md/field-group:col-span-2"
                      >
                        <FieldLabel htmlFor="create-storage-farmer">
                          Farmer Link
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-storage-farmer"
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

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Crop Information
              </FieldLegend>
              <FieldDescription>
                Variety and grade for stock entering storage.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="variety">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-storage-variety">
                          Variety
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-storage-variety"
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
                        <FieldLabel htmlFor="create-storage-category">
                          Category
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-storage-category"
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
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <StorageQuantitiesSection form={form} />

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Additional Notes
              </FieldLegend>
              <FieldGroup className="mt-5">
                <form.Field name="remarks">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="sr-only">
                          Remarks
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Add any additional comments or observations (optional)"
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
              form.setFieldValue(
                "quantities",
                createDefaultStorageQuantities()
              )
              setFarmerSearch("")
              setFarmerComboboxOpen(false)
              setVarietySearch("")
              setVarietyComboboxOpen(false)
              setCategorySearch("")
              setCategoryComboboxOpen(false)
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
          const parsed = storageFormSchema.safeParse(values)

          return (
            <StorageSummarySheet
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

export default CreateStorageForm
