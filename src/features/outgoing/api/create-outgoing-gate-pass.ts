import apiClient, { getApiErrorMessage } from "@/lib/api-client"

import type { TransferStockItem } from "@/features/transfer-stock/types/storage-gate-pass"

import type {
  CreateOutgoingAllocation,
  CreateOutgoingGatePassBody,
  CreateOutgoingGatePassInput,
  CreateOutgoingGatePassResponse,
  CreateOutgoingStorageGatePass,
} from "./types"

function deriveVarietyFromItems(items: TransferStockItem[]): string {
  const varieties = new Set(
    items.map((item) => item.variety?.trim()).filter((value) => Boolean(value)),
  )

  if (varieties.size === 0) {
    throw new Error("Could not determine variety from selected allocations.")
  }

  if (varieties.size > 1) {
    throw new Error(
      "All selected allocations must be the same variety. Adjust gate pass selections and try again.",
    )
  }

  return [...varieties][0]!
}

function buildStorageGatePassesPayload(
  items: TransferStockItem[],
): CreateOutgoingStorageGatePass[] {
  const byPassId = new Map<string, CreateOutgoingAllocation[]>()

  for (const item of items) {
    const allocations = byPassId.get(item.storageGatePassId) ?? []
    allocations.push({
      size: item.bagSize,
      quantityToAllocate: item.quantity,
      chamber: item.location.chamber,
      floor: item.location.floor,
      row: item.location.row,
    })
    byPassId.set(item.storageGatePassId, allocations)
  }

  return [...byPassId.entries()].map(([storageGatePassId, allocations]) => ({
    storageGatePassId,
    allocations,
  }))
}

export function toCreateOutgoingGatePassBody({
  form,
  gatePassNo,
  items,
}: CreateOutgoingGatePassInput): CreateOutgoingGatePassBody {
  if (items.length === 0) {
    throw new Error("Select at least one allocation in the gate passes table.")
  }

  const body: CreateOutgoingGatePassBody = {
    farmerStorageLinkId: form.farmerStorageLinkId,
    gatePassNo,
    date: form.date,
    variety: deriveVarietyFromItems(items),
    from: form.from.trim(),
    to: form.to.trim(),
    truckNumber: form.truckNumber.trim(),
    storageGatePasses: buildStorageGatePassesPayload(items),
    idempotencyKey: crypto.randomUUID(),
  }

  if (form.manualGatePassNumber != null) {
    body.manualGatePassNumber = form.manualGatePassNumber
  }

  const remarks = form.remarks.trim()
  if (remarks) {
    body.remarks = remarks
  }

  return body
}

export async function createOutgoingGatePass(
  input: CreateOutgoingGatePassInput,
): Promise<CreateOutgoingGatePassResponse> {
  try {
    const { data } = await apiClient.post<CreateOutgoingGatePassResponse>(
      "/outgoing-gate-pass/",
      toCreateOutgoingGatePassBody(input),
    )

    if (data.status !== "Success") {
      throw new Error(data.message ?? "Failed to create outgoing gate pass")
    }

    return data
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to create outgoing gate pass"),
      { cause: error },
    )
  }
}
