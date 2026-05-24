import type { StorageGatePass as ApiStorageGatePass } from "@/features/storage/api/types"
import type { StorageGatePass } from "@/features/transfer-stock/types/storage-gate-pass"

export function toTransferStorageGatePass(
  pass: ApiStorageGatePass,
): StorageGatePass {
  const farmerStorageLinkId =
    typeof pass.farmerStorageLinkId === "string"
      ? pass.farmerStorageLinkId
      : (pass.farmerStorageLinkId._id ?? "")

  return {
    _id: pass._id,
    farmerStorageLinkId,
    gatePassNo: pass.gatePassNo,
    manualGatePassNumber: pass.manualGatePassNumber ?? 0,
    date: pass.date,
    variety: pass.variety,
    storageCategory: pass.storageCategory,
    bagSizes: pass.bagSizes.map((bag) => ({
      size: bag.size,
      currentQuantity: bag.currentQuantity,
      initialQuantity: bag.initialQuantity,
      bagType: String(bag.bagType),
      chamber: bag.chamber,
      floor: bag.floor,
      row: bag.row,
    })),
    remarks: pass.remarks ?? "",
  }
}
