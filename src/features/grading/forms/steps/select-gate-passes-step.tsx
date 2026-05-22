import { useCallback, useEffect, useMemo, useState } from "react"
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
    {
      _id: "728ed530",
      gatePassNo: 1002,
      manualGatePassNumber: 101,
      date: "2026-05-21",
      variety: "Jyoti",
      truckNumber: "PB-10-AX-7812",
      bagsReceived: 120,
      status: "NOT_GRADED",
    },
    {
      _id: "728ed531",
      gatePassNo: 1003,
      manualGatePassNumber: 102,
      date: "2026-05-20",
      variety: "Kufri Chipsona",
      truckNumber: "RJ-14-BL-9021",
      bagsReceived: 95,
      status: "NOT_GRADED",
    },
    {
      _id: "728ed532",
      gatePassNo: 1004,
      manualGatePassNumber: 103,
      date: "2026-05-19",
      variety: "Pukhraj",
      truckNumber: "HR-38-QW-6671",
      bagsReceived: 140,
      status: "NOT_GRADED",
    },
    {
      _id: "728ed533",
      gatePassNo: 1005,
      manualGatePassNumber: 104,
      date: "2026-05-18",
      variety: "Santana",
      truckNumber: "PB-08-TY-5544",
      bagsReceived: 80,
      status: "NOT_GRADED",
    },
    {
      _id: "728ed534",
      gatePassNo: 1006,
      manualGatePassNumber: 105,
      date: "2026-05-17",
      variety: "Jyoti",
      truckNumber: "UP-32-MN-7788",
      bagsReceived: 110,
      status: "NOT_GRADED",
    },
    {
      _id: "728ed535",
      gatePassNo: 1007,
      manualGatePassNumber: 106,
      date: "2026-05-16",
      variety: "Kufri Badshah",
      truckNumber: "DL-01-RT-1133",
      bagsReceived: 150,
      status: "NOT_GRADED",
    },
    {
      _id: "728ed536",
      gatePassNo: 1008,
      manualGatePassNumber: 107,
      date: "2026-05-15",
      variety: "Pukhraj",
      truckNumber: "HR-55-ZX-2299",
      bagsReceived: 90,
      status: "NOT_GRADED",
    },
    {
      _id: "728ed537",
      gatePassNo: 1009,
      manualGatePassNumber: 108,
      date: "2026-05-14",
      variety: "Santana",
      truckNumber: "PB-11-KL-8810",
      bagsReceived: 130,
      status: "NOT_GRADED",
    },
    {
      _id: "728ed538",
      gatePassNo: 1010,
      manualGatePassNumber: 109,
      date: "2026-05-13",
      variety: "Kufri Chipsona",
      truckNumber: "RJ-45-DF-6722",
      bagsReceived: 105,
      status: "NOT_GRADED",
    },
    {
      _id: "728ed539",
      gatePassNo: 1011,
      manualGatePassNumber: 110,
      date: "2026-05-12",
      variety: "Jyoti",
      truckNumber: "HR-26-PL-9981",
      bagsReceived: 115,
      status: "NOT_GRADED",
    },
  ]
}

export function SelectGatePassesStep() {
  const [data, setData] = useState<GradingSelectIncomingGatePasses[]>([])
  const [isLoadingGatePasses, setIsLoadingGatePasses] = useState(true)
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

  const getGatePassRowId = useCallback(
    (row: GradingSelectIncomingGatePasses) => row._id,
    []
  )

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setIsLoadingGatePasses(true)
      try {
        const result = await getData()
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

      <Field className="gap-3">
        <FieldLabel>Gate passes</FieldLabel>
        <FieldDescription>
          Select incoming gate passes for the chosen farmer and variety. Use the
          search box to filter by manual gate pass number.
        </FieldDescription>
        <DataTable
          columns={columns}
          data={data}
          getRowId={getGatePassRowId}
          isLoading={isLoadingGatePasses}
        />
      </Field>
    </div>
  )
}
