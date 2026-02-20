/** Location for a bag size in rental incoming gate pass */
export interface RentalIncomingGatePassBagLocation {
  chamber: string;
  floor: string;
  row: string;
}

/** Single bag size entry in the create payload */
export interface CreateRentalIncomingGatePassBagSize {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: RentalIncomingGatePassBagLocation;
}

/** Request body for POST /rental-storage-gate-pass */
export interface CreateRentalIncomingGatePassInput {
  farmerStorageLinkId: string;
  date: string; // ISO date e.g. "2025-02-20"
  variety: string;
  bagSizes: CreateRentalIncomingGatePassBagSize[];
}

/** Created rental incoming gate pass (minimal shape; extend as API response is known) */
export interface RentalIncomingGatePass {
  _id: string;
  [key: string]: unknown;
}

/** API response for POST /rental-storage-gate-pass (201) */
export interface CreateRentalIncomingGatePassApiResponse {
  success: boolean;
  data: RentalIncomingGatePass | null;
  message: string;
}
