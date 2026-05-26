export const peopleQueryKeys = {
  all: ["people"] as const,
  farmerStorageLinks: () =>
    [...peopleQueryKeys.all, "farmer-storage-links"] as const,
  quickRegister: () => [...peopleQueryKeys.all, "quick-register"] as const,
  dispatchLedgers: () => [...peopleQueryKeys.all, "dispatch-ledgers"] as const,
  createDispatchLedger: () =>
    [...peopleQueryKeys.dispatchLedgers(), "create"] as const,
}
