export const outgoingGatePassKeys = {
  all: ["outgoing-gate-pass"] as const,
  lists: () => [...outgoingGatePassKeys.all, "list"] as const,
  create: () => [...outgoingGatePassKeys.all, "create"] as const,
  cancel: () => [...outgoingGatePassKeys.all, "cancel"] as const,
}
