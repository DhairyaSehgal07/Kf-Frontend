export const gradingGatePassKeys = {
  all: ["grading-gate-pass"] as const,
  lists: () => [...gradingGatePassKeys.all, "list"] as const,
  create: () => [...gradingGatePassKeys.all, "create"] as const,
}
