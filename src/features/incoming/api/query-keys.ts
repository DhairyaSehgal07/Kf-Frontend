import type { IncomingGatePassListParams } from "./types"

export const incomingGatePassKeys = {
  all: ["incoming-gate-pass"] as const,
  lists: () => [...incomingGatePassKeys.all, "list"] as const,
  list: (params: IncomingGatePassListParams) =>
    [...incomingGatePassKeys.lists(), params] as const,
  searches: () => [...incomingGatePassKeys.all, "search"] as const,
  search: (number: number) =>
    [...incomingGatePassKeys.searches(), number] as const,
  create: () => [...incomingGatePassKeys.all, "create"] as const,
}
