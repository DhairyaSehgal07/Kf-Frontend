import { useMemo, useState, type WheelEvent } from "react"
import { Plus, Trash2, UserPlus } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerInput } from "@/components/date-picker"
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from "@/components/searchable-option-combobox"

const FARMER_ITEMS: ComboboxOption[] = [
  {
    id: "farmer-storage-link-a001",
    label: "Alice Sharma (Storage #1001)",
    name: "Alice Sharma",
    accountNumber: 1001,
  },
  {
    id: "farmer-storage-link-a002",
    label: "Bob Singh (Storage #1002)",
    name: "Bob Singh",
    accountNumber: 1002,
  },
  {
    id: "farmer-storage-link-a003",
    label: "Carol Kaur (Storage #1003)",
    name: "Carol Kaur",
    accountNumber: 1003,
  },
]

const DISPATCH_LEDGER_ITEMS: ComboboxOption[] = [
  {
    id: "dispatch-ledger-001",
    label: "Market Yard Dispatch (Ledger #D-1001)",
  },
  {
    id: "dispatch-ledger-002",
    label: "Mandi Sales Dispatch (Ledger #D-1002)",
  },
  {
    id: "dispatch-ledger-003",
    label: "Wholesale Buyer Dispatch (Ledger #D-1003)",
  },
]

type DispatchPreStorageBagSizeRow = {
  size: string
  variety: string
  quantityIssued: string
}

const numericInputProps = {
  type: "number" as const,
  min: 0,
  onWheel: (e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
}

function createDefaultBagSizeRows(): DispatchPreStorageBagSizeRow[] {
  return [
    {
      size: "",
      variety: "",
      quantityIssued: "",
    },
  ]
}

function createEmptyBagSizeRow(): DispatchPreStorageBagSizeRow {
  return {
    size: "",
    variety: "",
    quantityIssued: "",
  }
}

function formatOptionalNumber(value: string) {
  if (value === "") return "0"

  const parsed = Number(value)

  return Number.isNaN(parsed) ? "0" : parsed.toLocaleString("en-IN")
}

const CreateDispatchPreStorageForm = () => {
  const [gatePassNo, setGatePassNo] = useState("1")
  const [manualGatePassNumber, setManualGatePassNumber] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isBooked, setIsBooked] = useState(false)
  const [farmerStorageLinkId, setFarmerStorageLinkId] = useState("")
  const [dispatchLedgerId, setDispatchLedgerId] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [truckNumber, setTruckNumber] = useState("")
  const [bagSize, setBagSize] = useState(createDefaultBagSizeRows)
  const [netWeight, setNetWeight] = useState("")
  const [averageWeightPerBag, setAverageWeightPerBag] = useState("")
  const [remarks, setRemarks] = useState("")
  const [idempotencyKey, setIdempotencyKey] = useState("")

  const [farmerSearch, setFarmerSearch] = useState("")
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false)
  const [dispatchLedgerSearch, setDispatchLedgerSearch] = useState("")
  const [dispatchLedgerComboboxOpen, setDispatchLedgerComboboxOpen] =
    useState(false)

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, FARMER_ITEMS),
    [farmerSearch]
  )
  const sortedDispatchLedgers = useMemo(
    () => filterAndSortOptions(dispatchLedgerSearch, DISPATCH_LEDGER_ITEMS),
    [dispatchLedgerSearch]
  )

  const totalQuantityIssued = useMemo(
    () =>
      bagSize.reduce((sum, row) => {
        const parsed = Number(row.quantityIssued)
        return sum + (Number.isNaN(parsed) ? 0 : parsed)
      }, 0),
    [bagSize]
  )

  const resetComboboxState = () => {
    setFarmerSearch("")
    setFarmerComboboxOpen(false)
    setDispatchLedgerSearch("")
    setDispatchLedgerComboboxOpen(false)
  }

  const resetForm = () => {
    setGatePassNo("1")
    setManualGatePassNumber("")
    setDate(new Date())
    setIsBooked(false)
    setFarmerStorageLinkId("")
    setDispatchLedgerId("")
    setFrom("")
    setTo("")
    setTruckNumber("")
    setBagSize(createDefaultBagSizeRows())
    setNetWeight("")
    setAverageWeightPerBag("")
    setRemarks("")
    setIdempotencyKey("")
    resetComboboxState()
  }

  const updateBagSizeRow = (
    index: number,
    patch: Partial<DispatchPreStorageBagSizeRow>
  ) => {
    setBagSize((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row
      )
    )
  }

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Dispatch (Pre-Storage) Gate Pass{" "}
          <span className="font-mono tabular-nums text-primary sm:text-2xl">
            #{gatePassNo || "—"}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          UI-only form for creating a nikasi gate pass before storage booking.
        </CardDescription>
      </CardHeader>

      <form
        id="create-dispatch-pre-storage-form"
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Gate Pass Details
              </FieldLegend>
              <FieldDescription>
                Gate pass number, manual reference, date, booking flag, and
                request key.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-gate-pass-no">
                    Gate Pass No.
                  </FieldLabel>
                  <Input
                    {...numericInputProps}
                    id="dispatch-pre-storage-gate-pass-no"
                    name="gatePassNo"
                    value={gatePassNo}
                    onChange={(e) => setGatePassNo(e.target.value)}
                    inputMode="numeric"
                    placeholder="e.g. 1"
                    className="tabular-nums"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-manual-gate-pass">
                    Manual Gate Pass No.
                  </FieldLabel>
                  <Input
                    {...numericInputProps}
                    id="dispatch-pre-storage-manual-gate-pass"
                    name="manualGatePassNumber"
                    value={manualGatePassNumber}
                    onChange={(e) => setManualGatePassNumber(e.target.value)}
                    inputMode="numeric"
                    placeholder="e.g. 101"
                    className="tabular-nums"
                  />
                </Field>

                <DatePickerInput
                  id="dispatch-pre-storage-date"
                  label="Date"
                  value={date}
                  onChange={setDate}
                  placeholder="Pick a date"
                />

                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-idempotency-key">
                    Idempotency Key
                  </FieldLabel>
                  <Input
                    id="dispatch-pre-storage-idempotency-key"
                    name="idempotencyKey"
                    value={idempotencyKey}
                    onChange={(e) => setIdempotencyKey(e.target.value)}
                    placeholder="e.g. nikasi-gp-1"
                    autoComplete="off"
                    className="font-mono"
                  />
                  <FieldDescription>
                    Unique client key used to avoid duplicate gate-pass
                    creation.
                  </FieldDescription>
                </Field>

                <Field className="@md/field-group:col-span-2">
                  <label
                    htmlFor="dispatch-pre-storage-is-booked"
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/30"
                  >
                    <Checkbox
                      id="dispatch-pre-storage-is-booked"
                      name="isBooked"
                      checked={isBooked}
                      onCheckedChange={(value) => setIsBooked(value === true)}
                      className="mt-0.5"
                    />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">
                        Mark this dispatch as booked
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Maps to the payload value{" "}
                        <span className="font-mono">isBooked</span>.
                      </span>
                    </span>
                  </label>
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Account Links
              </FieldLegend>
              <FieldDescription>
                Select the farmer storage link and the dispatch ledger this pass
                belongs to.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-farmer">
                    Farmer Storage Link
                  </FieldLabel>
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1">
                      <SearchableOptionCombobox
                        id="dispatch-pre-storage-farmer"
                        name="farmerStorageLinkId"
                        value={farmerStorageLinkId}
                        onValueChange={setFarmerStorageLinkId}
                        onBlur={() => {}}
                        isInvalid={false}
                        placeholder="Search farmer storage links..."
                        emptyMessage="No farmer links found."
                        options={FARMER_ITEMS}
                        sortedOptions={sortedFarmers}
                        search={farmerSearch}
                        setSearch={setFarmerSearch}
                        open={farmerComboboxOpen}
                        setOpen={setFarmerComboboxOpen}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-auto min-h-9 shrink-0 gap-1.5 px-3"
                      aria-label="Add farmer"
                    >
                      <UserPlus className="size-4 shrink-0" />
                      <span className="hidden sm:inline">Add</span>
                    </Button>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-dispatch-ledger">
                    Dispatch Ledger
                  </FieldLabel>
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1">
                      <SearchableOptionCombobox
                        id="dispatch-pre-storage-dispatch-ledger"
                        name="dispatchLedgerId"
                        value={dispatchLedgerId}
                        onValueChange={setDispatchLedgerId}
                        onBlur={() => {}}
                        isInvalid={false}
                        placeholder="Search dispatch ledgers..."
                        emptyMessage="No dispatch ledgers found."
                        options={DISPATCH_LEDGER_ITEMS}
                        sortedOptions={sortedDispatchLedgers}
                        search={dispatchLedgerSearch}
                        setSearch={setDispatchLedgerSearch}
                        open={dispatchLedgerComboboxOpen}
                        setOpen={setDispatchLedgerComboboxOpen}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-auto min-h-9 shrink-0 gap-1.5 px-3"
                      aria-label="Add dispatch ledger"
                    >
                      <UserPlus className="size-4 shrink-0" />
                      <span className="hidden sm:inline">Add</span>
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Route & Vehicle
              </FieldLegend>
              <FieldDescription>
                Source, destination, and truck number for the dispatch.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-from">
                    From
                  </FieldLabel>
                  <Input
                    id="dispatch-pre-storage-from"
                    name="from"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="e.g. Cold Storage A"
                    autoComplete="off"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-to">To</FieldLabel>
                  <Input
                    id="dispatch-pre-storage-to"
                    name="to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="e.g. Market Yard"
                    autoComplete="off"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-truck-number">
                    Truck Number
                  </FieldLabel>
                  <Input
                    id="dispatch-pre-storage-truck-number"
                    name="truckNumber"
                    value={truckNumber}
                    onChange={(e) =>
                      setTruckNumber(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. PB10AB1234"
                    autoComplete="off"
                    className="uppercase"
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Bag Size
              </FieldLegend>
              <FieldDescription>
                Enter each issued line with bag size, variety, and quantity
                issued.
              </FieldDescription>

              <div className="mt-5 rounded-lg border border-border">
                <div className="hidden border-b border-border bg-muted/50 px-3 py-2.5 lg:grid lg:grid-cols-12 lg:gap-2">
                  <div className="col-span-3 text-sm font-medium text-muted-foreground">
                    Size
                  </div>
                  <div className="col-span-4 text-sm font-medium text-muted-foreground">
                    Variety
                  </div>
                  <div className="col-span-3 text-right text-sm font-medium text-muted-foreground">
                    Quantity Issued
                  </div>
                  <div className="col-span-2" aria-hidden />
                </div>

                <div className="divide-y divide-border">
                  {bagSize.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-3 px-3 py-3 lg:grid-cols-12 lg:items-start lg:gap-2 lg:py-2.5"
                    >
                      <div className="lg:col-span-3">
                        <Field>
                          <FieldLabel
                            htmlFor={`dispatch-pre-storage-bag-size-${index}-size`}
                            className="lg:sr-only"
                          >
                            Size (row {index + 1})
                          </FieldLabel>
                          <Input
                            id={`dispatch-pre-storage-bag-size-${index}-size`}
                            name={`bagSize.${index}.size`}
                            value={row.size}
                            onChange={(e) =>
                              updateBagSizeRow(index, {
                                size: e.target.value,
                              })
                            }
                            placeholder="e.g. 50kg"
                            autoComplete="off"
                          />
                        </Field>
                      </div>

                      <div className="lg:col-span-4">
                        <Field>
                          <FieldLabel
                            htmlFor={`dispatch-pre-storage-bag-size-${index}-variety`}
                            className="lg:sr-only"
                          >
                            Variety (row {index + 1})
                          </FieldLabel>
                          <Input
                            id={`dispatch-pre-storage-bag-size-${index}-variety`}
                            name={`bagSize.${index}.variety`}
                            value={row.variety}
                            onChange={(e) =>
                              updateBagSizeRow(index, {
                                variety: e.target.value,
                              })
                            }
                            placeholder="e.g. Potato"
                            autoComplete="off"
                          />
                        </Field>
                      </div>

                      <div className="lg:col-span-3">
                        <Field>
                          <FieldLabel
                            htmlFor={`dispatch-pre-storage-bag-size-${index}-quantity-issued`}
                            className="lg:sr-only"
                          >
                            Quantity Issued (row {index + 1})
                          </FieldLabel>
                          <Input
                            {...numericInputProps}
                            id={`dispatch-pre-storage-bag-size-${index}-quantity-issued`}
                            name={`bagSize.${index}.quantityIssued`}
                            inputMode="numeric"
                            value={row.quantityIssued}
                            onChange={(e) =>
                              updateBagSizeRow(index, {
                                quantityIssued: e.target.value,
                              })
                            }
                            placeholder="e.g. 100"
                            className="text-right tabular-nums"
                          />
                        </Field>
                      </div>

                      <div className="flex justify-end lg:col-span-2">
                        {bagSize.length > 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-11 shrink-0 lg:size-10"
                            aria-label={`Remove bag size row ${index + 1}`}
                            onClick={() =>
                              setBagSize((current) =>
                                current.filter(
                                  (_, rowIndex) => rowIndex !== index
                                )
                              )
                            }
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 border-t border-border px-3 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() =>
                      setBagSize((current) => [
                        ...current,
                        createEmptyBagSizeRow(),
                      ])
                    }
                  >
                    <Plus className="mr-2 size-4" aria-hidden />
                    Add bag line
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => setBagSize(createDefaultBagSizeRows())}
                  >
                    Clear bag lines
                  </Button>
                </div>
              </div>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Weight & Remarks
              </FieldLegend>
              <FieldDescription>
                Net weight, average bag weight, and any notes for the nikasi
                gate pass.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-net-weight">
                    Net Weight
                  </FieldLabel>
                  <Input
                    {...numericInputProps}
                    id="dispatch-pre-storage-net-weight"
                    name="netWeight"
                    value={netWeight}
                    onChange={(e) => setNetWeight(e.target.value)}
                    inputMode="decimal"
                    placeholder="e.g. 5000"
                    className="tabular-nums"
                  />
                  <FieldDescription>Enter weight in kg.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="dispatch-pre-storage-average-weight">
                    Average Weight Per Bag
                  </FieldLabel>
                  <Input
                    {...numericInputProps}
                    id="dispatch-pre-storage-average-weight"
                    name="averageWeightPerBag"
                    value={averageWeightPerBag}
                    onChange={(e) => setAverageWeightPerBag(e.target.value)}
                    inputMode="decimal"
                    placeholder="e.g. 50"
                    className="tabular-nums"
                  />
                  <FieldDescription>Enter average weight in kg.</FieldDescription>
                </Field>

                <Field className="@md/field-group:col-span-2">
                  <FieldLabel htmlFor="dispatch-pre-storage-remarks">
                    Remarks
                  </FieldLabel>
                  <Textarea
                    id="dispatch-pre-storage-remarks"
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. First nikasi gate pass"
                    className="min-h-[120px] resize-y"
                  />
                </Field>
              </FieldGroup>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Quantity issued
                  </div>
                  <div className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
                    {totalQuantityIssued.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Net weight
                  </div>
                  <div className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
                    {formatOptionalNumber(netWeight)} kg
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Avg. per bag
                  </div>
                  <div className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
                    {formatOptionalNumber(averageWeightPerBag)} kg
                  </div>
                </div>
              </div>
            </FieldSet>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t bg-muted/30 py-6">
          <Button variant="outline" type="button" onClick={resetForm}>
            Reset Form
          </Button>
          <Button type="button">Review</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default CreateDispatchPreStorageForm