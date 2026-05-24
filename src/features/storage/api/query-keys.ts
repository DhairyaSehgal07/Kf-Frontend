import type { StorageGatePassListParams } from "./types"

export const storageGatePassKeys = {
  all: ["storage-gate-pass"] as const,
  lists: () => [...storageGatePassKeys.all, "list"] as const,
  list: (params: StorageGatePassListParams) =>
    [...storageGatePassKeys.lists(), params] as const,
  searches: () => [...storageGatePassKeys.all, "search"] as const,
  search: (number: number) =>
    [...storageGatePassKeys.searches(), number] as const,
  create: () => [...storageGatePassKeys.all, "create"] as const,
}
