import {
  functionalUpdate,
  makeStateUpdater,
  type OnChangeFn,
  type RowData,
  type Table,
  type TableFeature,
  type Updater,
} from "@tanstack/react-table"

export type DensityState = "sm" | "md" | "lg"

export interface DensityTableState {
  density: DensityState
}

export interface DensityOptions {
  enableDensity?: boolean
  onDensityChange?: OnChangeFn<DensityState>
}

export interface DensityInstance {
  setDensity: (updater: Updater<DensityState>) => void
  toggleDensity: (value?: DensityState) => void
}

declare module "@tanstack/react-table" {
  interface TableState extends DensityTableState {}
  interface TableOptionsResolved<TData extends RowData> extends DensityOptions {}
  interface Table<TData extends RowData> extends DensityInstance {}
}

export const DensityFeature: TableFeature<RowData> = {
  getInitialState: (state): DensityTableState => ({
    density: "md",
    ...state,
  }),

  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): DensityOptions =>
    ({
      enableDensity: true,
      onDensityChange: makeStateUpdater("density", table),
    }) as DensityOptions,

  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.setDensity = (updater) => {
      const safeUpdater: Updater<DensityState> = (old) =>
        functionalUpdate(updater, old)
      return table.options.onDensityChange?.(safeUpdater)
    }

    table.toggleDensity = (value) => {
      table.setDensity((old) => {
        if (value) return value
        return old === "lg" ? "md" : old === "md" ? "sm" : "lg"
      })
    }
  },
}
