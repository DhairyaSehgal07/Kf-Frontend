import { useEffect, useMemo, useState } from "react"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from "@/components/searchable-option-combobox"
import { columns } from "./columns"
import type { GradingSelectIncomingGatePasses } from "../../types"
import { DataTable } from "./data-table"

const VARIETY_ITEMS = ["Himalini", "K. Pukhraj", "K. Jyoti"].map((value) => ({
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

async function getData(): Promise<GradingSelectIncomingGatePasses[]> {
  return [
    {
      _id: "728ed52f",
      gatePassNo: 1001,
      manualGatePassNumber: 100,
      date: "2026-05-22",
      variety: "Pukhraj",
      truckNumber: "HR-26-DK-4521",
      bagsReceived: 100,
      status: "NOT_GRADED",
    },
  ]
}

export function SelectGatePassesStep() {
  const [data, setData] = useState<GradingSelectIncomingGatePasses[]>([])
  const [farmerStorageLinkId, setFarmerStorageLinkId] = useState("")
  const [variety, setVariety] = useState("")
  const farmerOptions = useMemo<ComboboxOption[]>(
    () => [...MOCK_FARMER_LINKS],
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
    () => filterAndSortOptions(varietySearch, VARIETY_ITEMS),
    [varietySearch]
  )

  useEffect(() => {
    const fetchData = async () => {
      const result = await getData()
      setData(result)
    }

    fetchData()
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="select-gate-passes-farmer">Farmer Link</FieldLabel>
          <SearchableOptionCombobox
            id="select-gate-passes-farmer"
            name="farmerStorageLinkId"
            value={farmerStorageLinkId}
            onValueChange={setFarmerStorageLinkId}
            onBlur={() => {}}
            isInvalid={false}
            placeholder="Search farmers..."
            emptyMessage="No farmers found."
            options={farmerOptions}
            sortedOptions={sortedFarmers}
            search={farmerSearch}
            setSearch={setFarmerSearch}
            open={farmerComboboxOpen}
            setOpen={setFarmerComboboxOpen}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="select-gate-passes-variety">Variety</FieldLabel>
          <SearchableOptionCombobox
            id="select-gate-passes-variety"
            name="variety"
            value={variety}
            onValueChange={setVariety}
            onBlur={() => {}}
            isInvalid={false}
            placeholder="Search varieties..."
            emptyMessage="No varieties found."
            options={VARIETY_ITEMS}
            sortedOptions={sortedVarieties}
            search={varietySearch}
            setSearch={setVarietySearch}
            open={varietyComboboxOpen}
            setOpen={setVarietyComboboxOpen}
          />
        </Field>
      </FieldGroup>

      <Field>
      <FieldDescription>
  Select incoming gate passes for the selected farmer and variety.
</FieldDescription>
        <DataTable columns={columns} data={data} />
         </Field>
    </div>
  )
}
