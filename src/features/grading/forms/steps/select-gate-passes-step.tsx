import { useCallback, useMemo, useState } from "react"
import type { RowSelectionState } from "@tanstack/react-table"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from "@/components/searchable-option-combobox"
import type { CreateGradingFormApi } from "@/features/grading/forms/use-create-grading-form"
import { useIncomingGatePassesByFarmer } from "@/features/incoming/api/use-incoming-gate-passes-by-farmer"
import { useFarmerLinkOptions } from "@/features/people/api/use-farmer-link-options"
import { farmerLinkOptionsToComboboxOptions } from "@/features/people/utils/farmer-link-combobox"
import { columns } from "./columns"
import type { GradingSelectIncomingGatePasses } from "../../types"
import { DataTable } from "./data-table"

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid
}

function idsToRowSelection(ids: string[]): RowSelectionState {
  return Object.fromEntries(ids.map((id) => [id, true]))
}

function rowSelectionToIds(selection: RowSelectionState): string[] {
  return Object.keys(selection).filter((id) => selection[id])
}

type SelectGatePassesStepProps = {
  form: CreateGradingFormApi
}

type GatePassesTableSectionProps = {
  form: CreateGradingFormApi
  farmerStorageLinkId: string
  variety: string
  gatePasses: GradingSelectIncomingGatePasses[]
  isLoadingGatePasses: boolean
}

function GatePassesTableSection({
  form,
  farmerStorageLinkId,
  variety,
  gatePasses,
  isLoadingGatePasses,
}: GatePassesTableSectionProps) {
  const getGatePassRowId = useCallback(
    (row: GradingSelectIncomingGatePasses) => row._id,
    [],
  )

  const tableData = useMemo(() => {
    if (!farmerStorageLinkId.trim() || !variety.trim()) return []
    return gatePasses.filter((gatePass) => gatePass.variety === variety)
  }, [farmerStorageLinkId, gatePasses, variety])

  return (
    <form.Field name="selectedIncomingGatePassIds">
      {(field) => {
        const isInvalid = isFieldInvalid(field.state.meta)
        const rowSelection = idsToRowSelection(field.state.value)

        return (
          <Field className="gap-3" data-invalid={isInvalid}>
            <FieldLabel>Gate passes</FieldLabel>
            <FieldDescription>
              Select incoming gate passes for the chosen farmer and variety.
              Use the search box to filter by manual gate pass number.
            </FieldDescription>
            <DataTable
              columns={columns}
              data={tableData}
              getRowId={getGatePassRowId}
              isLoading={isLoadingGatePasses}
              rowSelection={rowSelection}
              onRowSelectionChange={(updater) => {
                const next =
                  typeof updater === "function"
                    ? updater(rowSelection)
                    : updater
                field.handleChange(rowSelectionToIds(next))
              }}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        )
      }}
    </form.Field>
  )
}

type VarietyFieldProps = {
  form: CreateGradingFormApi
  varietyOptions: ComboboxOption[]
  disabled: boolean
}

function VarietyField({ form, varietyOptions, disabled }: VarietyFieldProps) {
  const [varietySearch, setVarietySearch] = useState("")
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false)

  const sortedVarieties = useMemo(
    () => filterAndSortOptions(varietySearch, varietyOptions),
    [varietySearch, varietyOptions],
  )

  return (
    <form.Field name="variety">
      {(field) => {
        const isInvalid = isFieldInvalid(field.state.meta)
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor="select-gate-passes-variety">Variety</FieldLabel>
            <SearchableOptionCombobox
              id="select-gate-passes-variety"
              name={field.name}
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value)
                form.setFieldValue("selectedIncomingGatePassIds", [])
              }}
              onBlur={field.handleBlur}
              isInvalid={isInvalid}
              disabled={disabled}
              placeholder={
                disabled
                  ? "Select a farmer first…"
                  : varietyOptions.length === 0
                    ? "No varieties found"
                    : "Search varieties…"
              }
              emptyMessage="No varieties found."
              options={varietyOptions}
              sortedOptions={sortedVarieties}
              search={varietySearch}
              setSearch={setVarietySearch}
              open={varietyComboboxOpen}
              setOpen={setVarietyComboboxOpen}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        )
      }}
    </form.Field>
  )
}

export function SelectGatePassesStep({ form }: SelectGatePassesStepProps) {
  const { data: farmerLinkOptions = [], isLoading: isLoadingFarmers } =
    useFarmerLinkOptions()
  const farmerOptions = useMemo<ComboboxOption[]>(
    () => farmerLinkOptionsToComboboxOptions(farmerLinkOptions),
    [farmerLinkOptions],
  )
  const [farmerSearch, setFarmerSearch] = useState("")
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false)

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions],
  )

  const resetVarietyAndSelection = useCallback(() => {
    form.setFieldValue("variety", "")
    form.setFieldValue("selectedIncomingGatePassIds", [])
  }, [form])

  return (
    <form.Subscribe
      selector={(state) => ({
        farmerStorageLinkId: state.values.farmerStorageLinkId,
        variety: state.values.variety,
      })}
      children={({ farmerStorageLinkId, variety }) => (
        <SelectGatePassesStepContent
          form={form}
          farmerStorageLinkId={farmerStorageLinkId}
          variety={variety}
          farmerOptions={farmerOptions}
          sortedFarmers={sortedFarmers}
          farmerSearch={farmerSearch}
          setFarmerSearch={setFarmerSearch}
          farmerComboboxOpen={farmerComboboxOpen}
          setFarmerComboboxOpen={setFarmerComboboxOpen}
          isLoadingFarmers={isLoadingFarmers}
          resetVarietyAndSelection={resetVarietyAndSelection}
        />
      )}
    />
  )
}

type SelectGatePassesStepContentProps = {
  form: CreateGradingFormApi
  farmerStorageLinkId: string
  variety: string
  farmerOptions: ComboboxOption[]
  sortedFarmers: ComboboxOption[]
  farmerSearch: string
  setFarmerSearch: (value: string) => void
  farmerComboboxOpen: boolean
  setFarmerComboboxOpen: (open: boolean) => void
  isLoadingFarmers: boolean
  resetVarietyAndSelection: () => void
}

function SelectGatePassesStepContent({
  form,
  farmerStorageLinkId,
  variety,
  farmerOptions,
  sortedFarmers,
  farmerSearch,
  setFarmerSearch,
  farmerComboboxOpen,
  setFarmerComboboxOpen,
  isLoadingFarmers,
  resetVarietyAndSelection,
}: SelectGatePassesStepContentProps) {
  const {
    data: gatePassResult,
    isLoading: isLoadingGatePasses,
    isFetching: isFetchingGatePasses,
  } = useIncomingGatePassesByFarmer(farmerStorageLinkId)

  const gatePasses = useMemo(
    () => gatePassResult?.incomingGatePasses ?? [],
    [gatePassResult?.incomingGatePasses],
  )

  const varietyOptions = useMemo<ComboboxOption[]>(() => {
    const uniqueVarieties = [
      ...new Set(
        gatePasses
          .map((gatePass) => gatePass.variety.trim())
          .filter((value) => value.length > 0),
      ),
    ]

    return uniqueVarieties
      .sort((a, b) => a.localeCompare(b, "en-IN"))
      .map((value) => ({ id: value, label: value }))
  }, [gatePasses])

  const showGatePassLoading =
    farmerStorageLinkId.trim().length > 0 &&
    (isLoadingGatePasses || isFetchingGatePasses)

  return (
    <div className="flex flex-col gap-8">
      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <form.Field name="farmerStorageLinkId">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta)
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="select-gate-passes-farmer">
                  Farmer Link
                </FieldLabel>
                <SearchableOptionCombobox
                  id="select-gate-passes-farmer"
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value)
                    resetVarietyAndSelection()
                  }}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  disabled={isLoadingFarmers}
                  placeholder={
                    isLoadingFarmers ? "Loading farmers…" : "Search farmers…"
                  }
                  emptyMessage="No farmers found."
                  options={farmerOptions}
                  sortedOptions={sortedFarmers}
                  search={farmerSearch}
                  setSearch={setFarmerSearch}
                  open={farmerComboboxOpen}
                  setOpen={setFarmerComboboxOpen}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <VarietyField
          form={form}
          varietyOptions={varietyOptions}
          disabled={!farmerStorageLinkId.trim() || showGatePassLoading}
        />
      </FieldGroup>

      <GatePassesTableSection
        form={form}
        farmerStorageLinkId={farmerStorageLinkId}
        variety={variety}
        gatePasses={gatePasses}
        isLoadingGatePasses={
          variety.trim().length > 0 && showGatePassLoading
        }
      />
    </div>
  )
}
