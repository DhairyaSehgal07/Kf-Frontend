import { useCallback, useEffect, useMemo, useState } from "react"
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
import {
  GRADING_MOCK_FARMER_LINKS,
  GRADING_VARIETY_ITEMS,
} from "@/features/grading/constants/grading-form.constants"
import { fetchMockIncomingGatePasses } from "@/features/grading/data/mock-incoming-gate-passes"
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

export function SelectGatePassesStep({ form }: SelectGatePassesStepProps) {
  const [data, setData] = useState<GradingSelectIncomingGatePasses[]>([])
  const [isLoadingGatePasses, setIsLoadingGatePasses] = useState(true)
  const farmerOptions = useMemo<ComboboxOption[]>(
    () => [...GRADING_MOCK_FARMER_LINKS],
    []
  )
  const [farmerSearch, setFarmerSearch] = useState("")
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false)
  const [varietySearch, setVarietySearch] = useState("")
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false)

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions]
  )
  const sortedVarieties = useMemo(
    () => filterAndSortOptions(varietySearch, GRADING_VARIETY_ITEMS),
    [varietySearch]
  )

  const getGatePassRowId = useCallback(
    (row: GradingSelectIncomingGatePasses) => row._id,
    []
  )

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setIsLoadingGatePasses(true)
      try {
        const result = await fetchMockIncomingGatePasses()
        if (!cancelled) setData(result)
      } finally {
        if (!cancelled) setIsLoadingGatePasses(false)
      }
    }

    void fetchData()
    return () => {
      cancelled = true
    }
  }, [])

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
                <FieldLabel htmlFor="select-gate-passes-variety">
                  Variety
                </FieldLabel>
                <SearchableOptionCombobox
                  id="select-gate-passes-variety"
                  name={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Search varieties..."
                  emptyMessage="No varieties found."
                  options={GRADING_VARIETY_ITEMS}
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
      </FieldGroup>

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
                data={data}
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
              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )
        }}
      </form.Field>
    </div>
  )
}
