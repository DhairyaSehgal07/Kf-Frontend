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
import { useFarmerLinkOptions } from "@/features/people/api/use-farmer-link-options"
import { farmerLinkOptionsToComboboxOptions } from "@/features/people/utils/farmer-link-combobox"
import { OutgoingSummarySheet } from "@/features/outgoing/forms/outgoing-summary-sheet"
import { useCreateOutgoingForm } from "@/features/outgoing/forms/use-create-outgoing-form"
import {
  outgoingFormSchema,
  type OutgoingFormValues,
} from "@/features/outgoing/schemas/outgoing-form-schema"
import { TransferGatePassesSection } from "@/features/transfer-stock/forms/transfer-gate-passes-section"
import { useStorageGatePassesForFarmer } from "@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer"
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

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid
}

type OutgoingReviewSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  farmerStorageLinkId: string
  values: OutgoingFormValues | null
  farmerLabel: string
  onBack: () => void
  onSubmit: () => void
  canSubmit: boolean
  isSubmitting: boolean
}

function OutgoingReviewSheet({
  open,
  onOpenChange,
  farmerStorageLinkId,
  values,
  farmerLabel,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: OutgoingReviewSheetProps) {
  const { data: passes } = useStorageGatePassesForFarmer(farmerStorageLinkId)
  const outgoingItems =
    values != null ? buildTransferItems(values.allocations, passes) : []

  return (
    <OutgoingSummarySheet
      open={open}
      onOpenChange={onOpenChange}
      values={values}
      farmerLabel={farmerLabel}
      outgoingItems={outgoingItems}
      onBack={onBack}
      onSubmit={onSubmit}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
    />
  )
}

const CreateOutgoingForm = () => {
  const { data: farmerLinkOptions = [], isLoading: isLoadingFarmers } =
    useFarmerLinkOptions()
  const farmerOptions = useMemo<ComboboxOption[]>(
    () => farmerLinkOptionsToComboboxOptions(farmerLinkOptions),
    [farmerLinkOptions],
  )
  const [farmerSearch, setFarmerSearch] = useState("")
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions],
  )

  const form = useCreateOutgoingForm({
    onOpenReview: () => setReviewOpen(true),
    onCloseReview: () => setReviewOpen(false),
  })

  const getFarmerLabel = (farmerStorageLinkId: string) =>
    farmerOptions.find((option) => option.id === farmerStorageLinkId)?.label ??
    farmerStorageLinkId

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: "review" })
  }

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: "submit" })
  }

  const resetComboboxState = () => {
    setFarmerSearch("")
    setFarmerComboboxOpen(false)
  }

  return (
    <Card className="mx-auto w-full max-w-7xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Outgoing
        </CardTitle>
        <CardDescription className="text-base">
          Record stock leaving storage for a farmer account.
        </CardDescription>
      </CardHeader>

      <form
        id="create-outgoing-form"
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Outgoing details
              </FieldLegend>
              <FieldDescription>
                Select the farmer account and outgoing date.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                <form.Field name="farmerStorageLinkId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="outgoing-farmer">
                          Farmer
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="outgoing-farmer"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(value) => {
                            field.handleChange(value)
                            form.setFieldValue("allocations", {})
                          }}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder={
                            isLoadingFarmers
                              ? "Loading farmers…"
                              : "Search farmers…"
                          }
                          emptyMessage={
                            isLoadingFarmers
                              ? "Loading farmers…"
                              : "No farmers found."
                          }
                          options={farmerOptions}
                          sortedOptions={sortedFarmers}
                          search={farmerSearch}
                          setSearch={setFarmerSearch}
                          open={farmerComboboxOpen}
                          setOpen={setFarmerComboboxOpen}
                          disabled={isLoadingFarmers}
                        />
                        <FieldDescription>
                          Farmer account stock is outgoing from.
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
              selector={(state) => state.values.farmerStorageLinkId}
              children={(farmerStorageLinkId) => (
                <FieldSet>
                  <FieldLegend className="font-heading text-base font-semibold">
                    Storage gate passes
                  </FieldLegend>
                  <FieldDescription>
                    Select vouchers and quantities to mark as outgoing.
                  </FieldDescription>
                  <div className="mt-5">
                    <form.Field name="allocations">
                      {(allocField) => (
                        <TransferGatePassesSection
                          key={farmerStorageLinkId || "no-farmer"}
                          fromFarmerStorageLinkId={farmerStorageLinkId}
                          allocations={allocField.state.value}
                          onAllocationsChange={allocField.handleChange}
                          farmerPromptLabel="farmer"
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
          const parsed = outgoingFormSchema.safeParse(values)
          const farmerId = parsed.success
            ? parsed.data.farmerStorageLinkId
            : values.farmerStorageLinkId

          return (
            <OutgoingReviewSheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              farmerStorageLinkId={farmerId}
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

export default CreateOutgoingForm
