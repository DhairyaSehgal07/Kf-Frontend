import type { Column, Table } from "@tanstack/react-table"
import { Plus, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IncomingGatePassReportRow } from "@/features/incoming-report/api/types"
import type {
  AdvancedFilterCondition,
  AdvancedFilterOperator,
  AdvancedReportGlobalFilter,
} from "@/features/incoming-report/utils/report-filter-fns"
import { cn } from "@/lib/utils"

interface AdvancedTabProps {
  table: Table<IncomingGatePassReportRow>
  draftGlobalFilter: AdvancedReportGlobalFilter
  onDraftGlobalFilterChange: (filter: AdvancedReportGlobalFilter) => void
}

type OperatorOption = {
  value: AdvancedFilterOperator
  label: string
  numericOnly?: boolean
  requiresValue?: boolean
}

const OPERATOR_OPTIONS: OperatorOption[] = [
  { value: "contains", label: "contains", requiresValue: true },
  { value: "notContains", label: "does not contain", requiresValue: true },
  { value: "equals", label: "equals", requiresValue: true },
  { value: "notEquals", label: "does not equal", requiresValue: true },
  { value: "startsWith", label: "starts with", requiresValue: true },
  { value: "endsWith", label: "ends with", requiresValue: true },
  { value: "greaterThan", label: ">", numericOnly: true, requiresValue: true },
  {
    value: "greaterThanOrEqual",
    label: ">=",
    numericOnly: true,
    requiresValue: true,
  },
  { value: "lessThan", label: "<", numericOnly: true, requiresValue: true },
  {
    value: "lessThanOrEqual",
    label: "<=",
    numericOnly: true,
    requiresValue: true,
  },
  { value: "isEmpty", label: "is blank" },
  { value: "isNotEmpty", label: "is not blank" },
]

function getColumnLabel(column: Column<IncomingGatePassReportRow, unknown>) {
  return column.columnDef.meta?.filterLabel ?? column.id
}

function getDefaultOperator(column: Column<IncomingGatePassReportRow, unknown>) {
  return column.columnDef.meta?.numeric === true ? "greaterThan" : "contains"
}

function getOperatorOptions(
  column: Column<IncomingGatePassReportRow, unknown> | undefined,
) {
  const isNumeric = column?.columnDef.meta?.numeric === true
  return OPERATOR_OPTIONS.filter((option) => !option.numericOnly || isNumeric)
}

function createCondition(
  column: Column<IncomingGatePassReportRow, unknown>,
): AdvancedFilterCondition {
  return {
    id: `condition-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    columnId: column.id as keyof IncomingGatePassReportRow,
    operator: getDefaultOperator(column),
    value: "",
  }
}

function isValueRequired(operator: AdvancedFilterOperator) {
  return OPERATOR_OPTIONS.find((option) => option.value === operator)
    ?.requiresValue
}

const AdvancedTab = ({
  table,
  draftGlobalFilter,
  onDraftGlobalFilterChange,
}: AdvancedTabProps) => {
  const columns = table.getAllLeafColumns()
  const columnsById = new Map(columns.map((column) => [column.id, column]))
  const conditions = draftGlobalFilter.conditions
  const firstColumn = columns[0]

  const updateFilter = (next: Partial<AdvancedReportGlobalFilter>) => {
    onDraftGlobalFilterChange({
      ...draftGlobalFilter,
      ...next,
    })
  }

  const updateCondition = (
    conditionId: string,
    patch: Partial<AdvancedFilterCondition>,
  ) => {
    updateFilter({
      conditions: conditions.map((condition) =>
        condition.id === conditionId ? { ...condition, ...patch } : condition,
      ),
    })
  }

  const handleAddCondition = () => {
    if (!firstColumn) return
    updateFilter({ conditions: [...conditions, createCondition(firstColumn)] })
  }

  const handleRemoveCondition = (conditionId: string) => {
    updateFilter({
      conditions: conditions.filter((condition) => condition.id !== conditionId),
    })
  }

  const handleColumnChange = (conditionId: string, columnId: string) => {
    const column = columnsById.get(columnId)
    if (!column) return

    updateCondition(conditionId, {
      columnId: column.id as keyof IncomingGatePassReportRow,
      operator: getDefaultOperator(column),
      value: "",
    })
  }

  const handleReset = () => {
    onDraftGlobalFilterChange({ logic: "AND", conditions: [] })
  }

  const activeConditionCount = conditions.filter(
    (condition) =>
      !isValueRequired(condition.operator) ||
      condition.value.trim().length > 0,
  ).length

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Logic builder
            </p>
            <p className="text-sm text-muted-foreground">
              Combine conditions with AND / OR logic. For example, status equals
              Graded AND bags &gt; 10.
            </p>
          </div>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto shrink-0 gap-1 px-0 text-muted-foreground"
            disabled={conditions.length === 0 && draftGlobalFilter.logic === "AND"}
            onClick={handleReset}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <span>Match</span>
            <div className="inline-flex rounded-full bg-muted p-0.5">
              {(["AND", "OR"] as const).map((logic) => (
                <button
                  key={logic}
                  type="button"
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                    draftGlobalFilter.logic === logic
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => updateFilter({ logic })}
                  aria-pressed={draftGlobalFilter.logic === logic}
                >
                  {logic}
                </button>
              ))}
            </div>
            <span>conditions</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!firstColumn}
            onClick={handleAddCondition}
          >
            <Plus className="size-4" aria-hidden />
            Condition
          </Button>
        </div>

        {conditions.length > 0 ? (
          <div className="space-y-2">
            {conditions.map((condition) => {
              const selectedColumn = columnsById.get(String(condition.columnId))
              const operatorOptions = getOperatorOptions(selectedColumn)
              const needsValue = isValueRequired(condition.operator)

              return (
                <div
                  key={condition.id}
                  className="grid gap-2 rounded-xl border border-border bg-background p-2 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.9fr)_minmax(0,1.4fr)_auto] sm:items-center"
                >
                  <Select
                    value={String(condition.columnId)}
                    onValueChange={(value) =>
                      handleColumnChange(condition.id, value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {getColumnLabel(column)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(value) =>
                      updateCondition(condition.id, {
                        operator: value as AdvancedFilterOperator,
                        value:
                          value === "isEmpty" || value === "isNotEmpty"
                            ? ""
                            : condition.value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={condition.value}
                    disabled={!needsValue}
                    inputMode={
                      selectedColumn?.columnDef.meta?.numeric === true
                        ? "decimal"
                        : "text"
                    }
                    placeholder={
                      needsValue ? "Select or type value..." : "No value needed"
                    }
                    onChange={(event) =>
                      updateCondition(condition.id, {
                        value: event.target.value,
                      })
                    }
                    className="h-10"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="justify-self-end"
                    onClick={() => handleRemoveCondition(condition.id)}
                    aria-label="Remove condition"
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              No advanced logic yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a condition to filter rows with AND / OR rules.
            </p>
          </div>
        )}

        <p className="text-xs tabular-nums text-muted-foreground">
          {activeConditionCount.toLocaleString("en-IN")} active condition
          {activeConditionCount === 1 ? "" : "s"}
        </p>
      </section>
    </div>
  )
}

export default AdvancedTab