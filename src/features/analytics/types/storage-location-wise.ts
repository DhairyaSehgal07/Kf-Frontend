export type VarietyStock = {
  variety: string
  initialQuantity: number
  currentQuantity: number
  quantityRemoved: number
}

export type StorageLocationRow = {
  row: string
  initialQuantity: number
  currentQuantity: number
  quantityRemoved: number
  varietyCount: number
  varieties: VarietyStock[]
}

export type StorageLocationFloor = {
  floor: string
  initialQuantity: number
  currentQuantity: number
  quantityRemoved: number
  varietyCount: number
  varieties: VarietyStock[]
  rows: StorageLocationRow[]
}

export type StorageLocationChamber = {
  chamber: string
  initialQuantity: number
  currentQuantity: number
  quantityRemoved: number
  varietyCount: number
  varieties: VarietyStock[]
  floors: StorageLocationFloor[]
}

export type StorageLocationWiseData = {
  chambers: StorageLocationChamber[]
}

export type StorageLocationQuantityMode = "current" | "initial" | "outgoing"

export type VarietyLocationEntry = {
  chamber: string
  floor: string
  row: string
  quantity: number
}

export type VarietyAggregate = {
  variety: string
  totalQuantity: number
  locations: VarietyLocationEntry[]
}
