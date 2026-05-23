import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

export type ComboboxOption = {
  id: string
  label: string
  name?: string
  accountNumber?: number
}

export type SearchableOptionComboboxProps = {
  id: string
  name: string
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  isInvalid: boolean
  placeholder: string
  emptyMessage: string
  options: ComboboxOption[]
  sortedOptions: ComboboxOption[]
  search: string
  setSearch: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export function filterAndSortOptions(
  query: string,
  options: ComboboxOption[]
): ComboboxOption[] {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return options
  }

  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(normalized)
  )

  return filtered.sort((a, b) => {
    const aStarts = a.label.toLowerCase().startsWith(normalized)
    const bStarts = b.label.toLowerCase().startsWith(normalized)
    if (aStarts && !bStarts) return -1
    if (!aStarts && bStarts) return 1
    return a.label.localeCompare(b.label)
  })
}

export function SearchableOptionCombobox({
  id,
  name,
  value,
  onValueChange,
  onBlur,
  isInvalid,
  placeholder,
  emptyMessage,
  options,
  sortedOptions,
  search,
  setSearch,
  open,
  setOpen,
  disabled = false,
}: SearchableOptionComboboxProps) {
  const selected = options.find((option) => option.id === value) ?? null

  return (
    <Combobox
      items={sortedOptions}
      itemToStringValue={(option) => option.label}
      value={selected}
      inputValue={search}
      open={open}
      onOpenChange={setOpen}
      autoHighlight={"always" as unknown as boolean}
      onInputValueChange={(inputValue) => {
        setSearch(inputValue)
        const matches = filterAndSortOptions(inputValue, options)
        if (!inputValue.trim()) {
          onValueChange("")
          return
        }
        onValueChange(matches[0]?.id ?? "")
      }}
      onValueChange={(val) => {
        onValueChange(val ? val.id : "")
        setSearch(val ? val.label : "")
      }}
    >
      <ComboboxInput
        id={id}
        name={name}
        placeholder={placeholder}
        aria-invalid={isInvalid}
        disabled={disabled}
        onFocus={() => {
          if (!disabled) setOpen(true)
        }}
        onBlur={onBlur}
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.id} value={option}>
              {option.name != null && option.accountNumber != null ? (
                <>
                  <span>{option.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    (Account #{option.accountNumber})
                  </span>
                </>
              ) : (
                option.label
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
