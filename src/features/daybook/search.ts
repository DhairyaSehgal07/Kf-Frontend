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
