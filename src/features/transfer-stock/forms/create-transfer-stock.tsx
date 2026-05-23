import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DEMO_FARMER_STORAGE_LINK_ID,
  getMockStorageGatePassesForFarmer,
} from "@/features/transfer-stock/data/mock-storage-gate-passes"
import { TransferGatePassesSection } from "@/features/transfer-stock/forms/transfer-gate-passes-section"
import { TransferStockSummarySheet } from "@/features/transfer-stock/forms/transfer-stock-summary-sheet"
import { useCreateTransferStockForm } from "@/features/transfer-stock/forms/use-create-transfer-stock-form"
import { transferStockFormSchema } from "@/features/transfer-stock/schemas/transfer-stock-form-schema"
import { buildTransferItems } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerInput } from "@/components/date-picker"
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from "@/components/searchable-option-combobox"

const MOCK_FARMER_LINKS = [
  {
    id: DEMO_FARMER_STORAGE_LINK_ID,
    label: "RAM KISHAN SETHIA — Acct #15",
  },
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

const CreateTransferStock = () => {
  const farmerOptions = useMemo<ComboboxOption[]>(
    () => [...MOCK_FARMER_LINKS],
    []
  )
  const [fromFarmerSearch, setFromFarmerSearch] = useState("")
  const [fromFarmerComboboxOpen, setFromFarmerComboboxOpen] = useState(false)
  const [toFarmerSearch, setToFarmerSearch] = useState("")
  const [toFarmerComboboxOpen, setToFarmerComboboxOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const sortedFromFarmers = useMemo(
    () => filterAndSortOptions(fromFarmerSearch, farmerOptions),
    [fromFarmerSearch, farmerOptions]
  )
  const sortedToFarmers = useMemo(
    () => filterAndSortOptions(toFarmerSearch, farmerOptions),
    [toFarmerSearch, farmerOptions]
  )

  const form = useCreateTransferStockForm({
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

  const resetComboboxState = () => {
    setFromFarmerSearch("")
    setFromFarmerComboboxOpen(false)
    setToFarmerSearch("")
    setToFarmerComboboxOpen(false)
  }

  return (
    <Card className="mx-auto w-full max-w-7xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Transfer Stock
        </CardTitle>
        <CardDescription className="text-base">
          Move stock between farmer storage accounts.
        </CardDescription>
      </CardHeader>

      <form
        id="create-transfer-stock-form"
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Transfer details
              </FieldLegend>
              <FieldDescription>
                Select source and destination accounts, then the transfer date.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                <form.Field name="fromFarmerStorageLinkId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="transfer-stock-from-farmer">
                          From
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="transfer-stock-from-farmer"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(value) => {
                            field.handleChange(value)
                            form.setFieldValue("allocations", {})
                          }}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search farmers..."
                          emptyMessage="No farmers found."
                          options={farmerOptions}
                          sortedOptions={sortedFromFarmers}
                          search={fromFarmerSearch}
                          setSearch={setFromFarmerSearch}
                          open={fromFarmerComboboxOpen}
                          setOpen={setFromFarmerComboboxOpen}
                        />
                        <FieldDescription>
                          Farmer account stock is transferred from.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="toFarmerStorageLinkId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="transfer-stock-to-farmer">
                          To
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="transfer-stock-to-farmer"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search farmers..."
                          emptyMessage="No farmers found."
                          options={farmerOptions}
                          sortedOptions={sortedToFarmers}
                          search={toFarmerSearch}
                          setSearch={setToFarmerSearch}
                          open={toFarmerComboboxOpen}
                          setOpen={setToFarmerComboboxOpen}
                        />
                        <FieldDescription>
                          Farmer account receiving the transferred stock.
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
                      <Field
                        data-invalid={isInvalid}
                        className="@md/field-group:max-w-sm"
                      >
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
              </FieldGroup>
            </FieldSet>

            <form.Subscribe
              selector={(state) => state.values.fromFarmerStorageLinkId}
              children={(fromFarmerStorageLinkId) => (
                <FieldSet>
                  <FieldLegend className="font-heading text-base font-semibold">
                    Storage gate passes
                  </FieldLegend>
                  <FieldDescription>
                    Select vouchers and quantities to transfer from the source
                    account.
                  </FieldDescription>
                  <div className="mt-5">
                    <form.Field name="allocations">
                      {(allocField) => (
                        <TransferGatePassesSection
                          key={fromFarmerStorageLinkId || "no-farmer"}
                          fromFarmerStorageLinkId={fromFarmerStorageLinkId}
                          allocations={allocField.state.value}
                          onAllocationsChange={allocField.handleChange}
                        />
                      )}
                    </form.Field>
                  </div>
                </FieldSet>
              )}
            />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Additional notes
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
                          className="min-h-[120px] resize-y text-base"
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
              resetComboboxState()
            }}
          >
            Reset form
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
          const parsed = transferStockFormSchema.safeParse(values)
          const fromFarmerId = parsed.success
            ? parsed.data.fromFarmerStorageLinkId
            : values.fromFarmerStorageLinkId
          const passes = fromFarmerId
            ? getMockStorageGatePassesForFarmer(fromFarmerId)
            : []
          const transferItems =
            parsed.success
              ? buildTransferItems(parsed.data.allocations, passes)
              : []

          return (
            <TransferStockSummarySheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              values={parsed.success ? parsed.data : null}
              transferItems={transferItems}
              fromFarmerLabel={
                parsed.success
                  ? getFarmerLabel(parsed.data.fromFarmerStorageLinkId)
                  : ""
              }
              toFarmerLabel={
                parsed.success
                  ? getFarmerLabel(parsed.data.toFarmerStorageLinkId)
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

export default CreateTransferStock
