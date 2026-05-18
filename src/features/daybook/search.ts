import { z } from "zod"

export const DAYBOOK_TAB_VALUES = [
  "incoming",
  "grading",
  "storage",
  "dispatch-pre-storage",
  "dispatch-post-storage",
] as const

export const daybookTabSchema = z.enum(DAYBOOK_TAB_VALUES)

export const daybookSearchSchema = z.object({
  tab: daybookTabSchema.catch("incoming"),
})

export type DaybookTab = z.infer<typeof daybookTabSchema>

export const DAYBOOK_TABS: ReadonlyArray<{
  value: DaybookTab
  label: string
  heading: string
}> = [
  { value: "incoming", label: "Incoming", heading: "Incoming tab" },
  { value: "grading", label: "Grading", heading: "Grading tab" },
  { value: "storage", label: "Storage", heading: "Storage tab" },
  {
    value: "dispatch-pre-storage",
    label: "Dispatch (pre-storage)",
    heading: "Dispatch pre storage tab",
  },
  {
    value: "dispatch-post-storage",
    label: "Dispatch (post-storage)",
    heading: "Dispatch post storage tab",
  },
]
