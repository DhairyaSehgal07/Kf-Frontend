import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "right"
    wrap?: boolean
    numeric?: boolean
    mono?: boolean
    groupStart?: boolean
    emphasize?: boolean
  }
  interface SortingFns {
    reportNumeric: SortingFn<unknown>
    reportDate: SortingFn<unknown>
  }
}
