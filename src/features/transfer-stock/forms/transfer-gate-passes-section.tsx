import { useCallback, useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Columns,
  MapPin,
  Package,
  RotateCcw,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { GatePassesMatrixTable } from "@/features/transfer-stock/forms/gate-passes-matrix-table"
import { useStorageGatePassesForFarmer } from "@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer"
import type { LocationFilters } from "@/features/transfer-stock/types/storage-gate-pass"
import {
  buildAllocationsFromPass,
  getUniqueLocationValues,
  getUniqueSizes,
  getUniqueVarieties,
  groupPassesByDate,
  parseAllocationKey,
  passMatchesGatePassSearch,
  passMatchesLocationFilters,
} from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { cn } from "@/lib/utils"

type TransferGatePassesSectionProps = {
  fromFarmerStorageLinkId: string
  allocations: Record<string, number>
  onAllocationsChange: (next: Record<string, number>) => void
}

/** `'all'` shows every size column; otherwise only sizes in the set. */
type SizeVisibility = "all" | Set<string>

function isSizeVisible(visibility: SizeVisibility, size: string): boolean {
  return visibility === "all" || visibility.has(size)
}

function resolveVisibleSizes(
  tableSizes: string[],
  visibility: SizeVisibility
): string[] {
  if (visibility === "all") return tableSizes
  return tableSizes.filter((size) => visibility.has(size))
}

export function TransferGatePassesSection({
  fromFarmerStorageLinkId,
  allocations,
  onAllocationsChange,
}: TransferGatePassesSectionProps) {
  const { data: allPasses, isLoading, error } =
    useStorageGatePassesForFarmer(fromFarmerStorageLinkId)

  const [voucherSort, setVoucherSort] = useState<"asc" | "desc">("asc")
  const [varietyFilter, setVarietyFilter] = useState("")
  const [sizeVisibility, setSizeVisibility] = useState<SizeVisibility>("all")
  const [selectedPassIds, setSelectedPassIds] = useState<Set<string>>(() => new Set())
  const [locationFilters, setLocationFilters] = useState<LocationFilters>({
    chamber: "",
    floor: "",
    row: "",
  })
  const [gatePassSearch, setGatePassSearch] = useState("")

  const uniqueVarieties = useMemo(
    () => getUniqueVarieties(allPasses),
    [allPasses]
  )

  const uniqueLocations = useMemo(
    () => getUniqueLocationValues(allPasses),
    [allPasses]
  )

  const filteredPasses = useMemo(() => {
    let list = allPasses
    if (varietyFilter.trim()) {
      list = list.filter((p) => p.variety?.trim() === varietyFilter)
    }
    if (gatePassSearch.trim()) {
      list = list.filter((p) => passMatchesGatePassSearch(p, gatePassSearch))
    }
    list = list.filter((p) => passMatchesLocationFilters(p, locationFilters))
    return list
  }, [allPasses, varietyFilter, gatePassSearch, locationFilters])

  const tableSizes = useMemo(
    () => getUniqueSizes(filteredPasses),
    [filteredPasses]
  )

  const allTableSizes = useMemo(() => getUniqueSizes(allPasses), [allPasses])

  const visibleSizes = useMemo(
    () => resolveVisibleSizes(tableSizes, sizeVisibility),
    [tableSizes, sizeVisibility]
  )

  const displayGroups = useMemo(
    () => groupPassesByDate(filteredPasses, voucherSort),
    [filteredPasses, voucherSort]
  )

  const needsVarietySelection =
    uniqueVarieties.length > 0 && varietyFilter.trim() === ""

  const varietySelected = !needsVarietySelection
  const hasFilteredData =
    varietySelected && filteredPasses.length > 0 && visibleSizes.length > 0

  const hasActiveFilters =
    varietyFilter.trim() !== "" ||
    gatePassSearch.trim() !== "" ||
    locationFilters.chamber !== "" ||
    locationFilters.floor !== "" ||
    locationFilters.row !== ""

  const sizesForColumnPicker =
    tableSizes.length > 0 ? tableSizes : allTableSizes

  const handleSelectAllSizes = useCallback(() => {
    setSizeVisibility("all")
  }, [])

  const handleSizeToggle = useCallback(
    (size: string) => {
      setSizeVisibility((prev) => {
        const pickerSizes =
          tableSizes.length > 0 ? tableSizes : allTableSizes

        if (prev === "all") {
          const next = new Set(pickerSizes)
          next.delete(size)
          return next
        }

        const next = new Set(prev)
        if (next.has(size)) next.delete(size)
        else next.add(size)

        if (pickerSizes.length > 0 && pickerSizes.every((s) => next.has(s))) {
          return "all"
        }
        return next
      })
    },
    [tableSizes, allTableSizes]
  )

  const handleResetFilters = useCallback(() => {
    setVoucherSort("asc")
    setVarietyFilter("")
    setGatePassSearch("")
    setLocationFilters({ chamber: "", floor: "", row: "" })
    setSizeVisibility("all")
    setSelectedPassIds(new Set())
    onAllocationsChange({})
  }, [onAllocationsChange])

  const handleAllocationChange = useCallback(
    (key: string, quantity: number) => {
      onAllocationsChange({ ...allocations, [key]: quantity })
    },
    [allocations, onAllocationsChange]
  )

  const handleAllocationClear = useCallback(
    (key: string) => {
      const next = { ...allocations }
      delete next[key]
      onAllocationsChange(next)
    },
    [allocations, onAllocationsChange]
  )

  const handlePassToggle = useCallback(
    (passId: string) => {
      const isSelecting = !selectedPassIds.has(passId)
      setSelectedPassIds((prev) => {
        const next = new Set(prev)
        if (isSelecting) next.add(passId)
        else next.delete(passId)
        return next
      })

      if (isSelecting) {
        const pass = filteredPasses.find((p) => p._id === passId)
        if (pass) {
          const fromPass = buildAllocationsFromPass(pass, visibleSizes)
          onAllocationsChange({ ...allocations, ...fromPass })
        }
      } else {
        const next = { ...allocations }
        for (const key of Object.keys(next)) {
          const parsed = parseAllocationKey(key)
          if (parsed?.passId === passId) delete next[key]
        }
        onAllocationsChange(next)
      }
    },
    [selectedPassIds, filteredPasses, visibleSizes, allocations, onAllocationsChange]
  )

  if (!fromFarmerStorageLinkId) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a <span className="font-medium text-foreground">From</span> farmer
        to view storage gate passes.
      </p>
    )
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading gate passes…</p>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load gate passes: {error.message}
      </p>
    )
  }

  if (!allPasses.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No storage gate passes for this farmer.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search by gate pass or manual parchi number"
          value={gatePassSearch}
          onChange={(e) => setGatePassSearch(e.target.value)}
          className="h-11 pl-10 text-base sm:text-sm"
          aria-label="Search gate passes"
        />
      </div>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium leading-none text-muted-foreground">
            Sort by gate pass
          </span>
          <div className="flex h-10 items-center gap-1.5">
            <Button
              type="button"
              variant={voucherSort === "asc" ? "default" : "outline"}
              size="sm"
              className="h-10 gap-1.5 px-3"
              onClick={() => setVoucherSort("asc")}
            >
              <ArrowUp className="size-4" />
              Ascending
            </Button>
            <Button
              type="button"
              variant={voucherSort === "desc" ? "default" : "outline"}
              size="sm"
              className="h-10 gap-1.5 px-3"
              onClick={() => setVoucherSort("desc")}
            >
              <ArrowDown className="size-4" />
              Descending
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium leading-none text-muted-foreground">
            Sizes
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-10 gap-2">
                <Columns className="size-4" />
                Sizes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle sizes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={sizeVisibility === "all"}
                onCheckedChange={(checked) => {
                  if (checked) handleSelectAllSizes()
                  else setSizeVisibility(new Set())
                }}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {sizesForColumnPicker.map((size) => (
                <DropdownMenuCheckboxItem
                  key={size}
                  checked={isSizeVisible(sizeVisibility, size)}
                  onCheckedChange={() => handleSizeToggle(size)}
                >
                  {size}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {uniqueVarieties.length > 0 && (
          <div
            className={cn(
              "flex flex-col gap-2 rounded-lg transition-[box-shadow,background-color,border-color]",
              needsVarietySelection &&
                "border-2 border-primary/50 bg-primary/5 p-2.5 shadow-sm ring-2 ring-primary/25"
            )}
          >
            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-xs font-medium leading-none",
                  needsVarietySelection ? "text-primary" : "text-muted-foreground"
                )}
              >
                Variety
                {needsVarietySelection ? (
                  <span className="ml-0.5 font-semibold text-destructive">*</span>
                ) : null}
              </span>
              {needsVarietySelection ? (
                <span className="max-w-52 text-[11px] leading-snug text-muted-foreground">
                  Choose a variety to show gate passes below.
                </span>
              ) : null}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-10 min-w-[120px] justify-between gap-2",
                    needsVarietySelection &&
                      "border-primary/60 bg-background text-primary hover:bg-primary/10"
                  )}
                  aria-label={
                    needsVarietySelection
                      ? "Variety — required"
                      : "Variety filter"
                  }
                >
                  <Package className="size-4 shrink-0" />
                  {varietyFilter || "All"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuRadioGroup
                  value={varietyFilter}
                  onValueChange={(v) => setVarietyFilter(v ?? "")}
                >
                  <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
                  {uniqueVarieties.map((v) => (
                    <DropdownMenuRadioItem key={v} value={v}>
                      {v}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {uniqueLocations.chambers.length > 0 && (
          <LocationFilterDropdown
            label="Chamber"
            value={locationFilters.chamber}
            options={uniqueLocations.chambers}
            onChange={(chamber) =>
              setLocationFilters((prev) => ({ ...prev, chamber }))
            }
          />
        )}
        {uniqueLocations.floors.length > 0 && (
          <LocationFilterDropdown
            label="Floor"
            value={locationFilters.floor}
            options={uniqueLocations.floors}
            onChange={(floor) =>
              setLocationFilters((prev) => ({ ...prev, floor }))
            }
          />
        )}
        {uniqueLocations.rows.length > 0 && (
          <LocationFilterDropdown
            label="Row"
            value={locationFilters.row}
            options={uniqueLocations.rows}
            onChange={(row) =>
              setLocationFilters((prev) => ({ ...prev, row }))
            }
          />
        )}

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium leading-none text-muted-foreground">
            Reset
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 gap-2"
            onClick={handleResetFilters}
          >
            <RotateCcw className="size-4" />
            Reset filters
          </Button>
        </div>
      </div>

      <GatePassesMatrixTable
        displayGroups={displayGroups}
        visibleSizes={visibleSizes}
        selectedPassIds={selectedPassIds}
        onPassToggle={handlePassToggle}
        allocations={allocations}
        onAllocationChange={handleAllocationChange}
        onAllocationClear={handleAllocationClear}
        isLoading={isLoading}
        hasFilteredData={hasFilteredData}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  )
}

function LocationFilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium leading-none text-muted-foreground">
        {label}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 min-w-[100px] justify-between gap-2"
          >
            <MapPin className="size-4 shrink-0" />
            {value || "All"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v ?? "")}>
            <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
            {options.map((opt) => (
              <DropdownMenuRadioItem key={opt} value={opt}>
                {opt}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
