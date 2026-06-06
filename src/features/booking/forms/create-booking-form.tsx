import { useMemo, useState } from "react"
import { UserPlus } from "lucide-react"

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
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from "@/components/searchable-option-combobox"
import { useAuthStore } from "@/features/auth/store/use-auth-store"
import { BookingQuantitiesSection } from "@/features/booking/forms/booking-quantities-section"
import { useCreateBookingForm } from "@/features/booking/forms/use-create-booking-form"
import { createDefaultBookingQuantities } from "@/features/booking/schemas/booking-form-schema"
import { useDispatchLedgers } from "@/features/people/api/use-dispatch-ledgers"
import { AddDispatchLedgerDialog } from "@/features/people/components/add-dispatch-ledger-dialog"
import type { DispatchLedger } from "@/features/people/types"
import {
  useGetReceiptVoucherNumber,
} from "@/hooks/use-get-voucher-number"

const VARIETY_ITEMS: ComboboxOption[] = [
  "Himalini",
  "K. Pukhraj",
  "K. Jyoti",
].map((value) => ({
  id: value,
  label: value,
}))

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid
}

const CreateBookingForm = () => {
  const coldStorageName = useAuthStore((s) => s.user?.coldStorageId.name ?? "")
  const { data: dispatchLedgers = [] } = useDispatchLedgers()
  const {
    data: nextVoucherNumber,
    isLoading: isLoadingVoucherNumber,
    isError: isVoucherNumberError,
  } = useGetReceiptVoucherNumber("outgoing-gate-pass")
  const { form } = useCreateBookingForm()

  const dispatchLedgerOptions = useMemo<ComboboxOption[]>(
    () =>
      dispatchLedgers.map((ledger) => ({
        id: ledger._id,
        label: ledger.name,
      })),
    [dispatchLedgers],
  )

  const [partySearch, setPartySearch] = useState("")
  const [partyComboboxOpen, setPartyComboboxOpen] = useState(false)
  const [varietySearch, setVarietySearch] = useState("")
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false)
  const [addPartyOpen, setAddPartyOpen] = useState(false)

  const sortedParties = useMemo(
    () => filterAndSortOptions(partySearch, dispatchLedgerOptions),
    [partySearch, dispatchLedgerOptions],
  )
  const sortedVarieties = useMemo(
    () => filterAndSortOptions(varietySearch, VARIETY_ITEMS),
    [varietySearch],
  )
  const resetComboboxState = () => {
    setPartySearch("")
    setPartyComboboxOpen(false)
    setVarietySearch("")
    setVarietyComboboxOpen(false)
  }

  const handlePartyCreated = (ledger: DispatchLedger) => {
    form.setFieldValue("dispatchLedgerId", ledger._id)
    setPartySearch(ledger.name)
    setPartyComboboxOpen(false)
  }

  const handleReset = () => {
    form.reset()
    form.setFieldValue("quantities", createDefaultBookingQuantities())
    resetComboboxState()
  }

  const displayGatePassNo = isLoadingVoucherNumber
    ? "…"
    : isVoucherNumberError || nextVoucherNumber == null
      ? "—"
      : `#${nextVoucherNumber}`

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Booking Gate Pass{" "}
          <span className="font-mono tabular-nums text-primary sm:text-2xl">
            {displayGatePassNo}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Record party, variety, bag quantities, and destination store for a new
          booking gate pass.
        </CardDescription>
      </CardHeader>

      <form
        id="create-booking-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <CardContent className="pb-8 pt-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Booking Details
              </FieldLegend>
              <FieldDescription>
                Party, crop variety, and the store this booking is assigned to.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="dispatchLedgerId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field
                        data-invalid={isInvalid}
                        className="@md/field-group:col-span-2"
                      >
                        <FieldLabel htmlFor="create-booking-party">
                          Party Name
                        </FieldLabel>
                        <div className="flex gap-2">
                          <div className="min-w-0 flex-1">
                            <SearchableOptionCombobox
                              id="create-booking-party"
                              name={field.name}
                              value={field.state.value}
                              onValueChange={field.handleChange}
                              onBlur={field.handleBlur}
                              isInvalid={isInvalid}
                              placeholder="Search parties..."
                              emptyMessage="No parties found."
                              options={dispatchLedgerOptions}
                              sortedOptions={sortedParties}
                              search={partySearch}
                              setSearch={setPartySearch}
                              open={partyComboboxOpen}
                              setOpen={setPartyComboboxOpen}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-auto min-h-9 shrink-0 gap-1.5 px-3"
                            onClick={() => setAddPartyOpen(true)}
                            aria-label="Add party"
                          >
                            <UserPlus className="size-4 shrink-0" />
                            <span className="hidden sm:inline">Add Party</span>
                          </Button>
                        </div>
                        <FieldDescription>
                          Select the dispatch party for this booking. Add a new
                          party without leaving this form.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="variety">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-booking-variety">
                          Variety
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-booking-variety"
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

                <form.Field name="storeName">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-booking-store-name">
                          Store Name
                        </FieldLabel>
                        <Input
                          id="create-booking-store-name"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder={
                            coldStorageName
                              ? `e.g. ${coldStorageName}`
                              : "e.g. Main Store"
                          }
                          autoComplete="off"
                          className="text-base"
                        />
                        <FieldDescription>
                          Destination or branch store for this booking.
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

            <BookingQuantitiesSection form={form} />

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
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset Form
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save Booking"}
              </Button>
            )}
          />
        </CardFooter>
      </form>

      <AddDispatchLedgerDialog
        open={addPartyOpen}
        onOpenChange={setAddPartyOpen}
        onSuccess={handlePartyCreated}
      />
    </Card>
  )
}

export default CreateBookingForm
