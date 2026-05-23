export const peopleQueryKeys = {
  all: ["people"] as const,
  farmerStorageLinks: () =>
    [...peopleQueryKeys.all, "farmer-storage-links"] as const,
}
