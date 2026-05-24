import type { GradingGatePassListParams } from "./types"

export const gradingGatePassKeys = {
  all: ["grading-gate-pass"] as const,
  lists: () => [...gradingGatePassKeys.all, "list"] as const,
  list: (params: GradingGatePassListParams) =>
    [...gradingGatePassKeys.lists(), params] as const,
  searches: () => [...gradingGatePassKeys.all, "search"] as const,
  search: (number: number) =>
    [...gradingGatePassKeys.searches(), number] as const,
  create: () => [...gradingGatePassKeys.all, "create"] as const,
}
