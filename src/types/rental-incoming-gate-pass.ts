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
  manualRentalGatePassNumber?: string;
  bagSizes: CreateRentalIncomingGatePassBagSize[];
}

/** Bag size as returned in GET list (includes location) */
export interface RentalIncomingGatePassBagSizeItem {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: RentalIncomingGatePassBagLocation;
}

/** Farmer storage link as returned in GET list */
export interface RentalIncomingGatePassFarmerLink {
  name: string;
  accountNumber: number;
  address: string;
  mobileNumber: string;
}

/** Created-by user as returned in GET list */
export interface RentalIncomingGatePassCreatedBy {
  _id: string;
  name: string;
}

/** Single rental storage gate pass as returned by GET /rental-storage-gate-pass */
export interface RentalIncomingGatePass {
  _id: string;
  farmerStorageLinkId: RentalIncomingGatePassFarmerLink;
  createdBy: RentalIncomingGatePassCreatedBy;
  gatePassNo: number;
  date: string;
  type: string;
  variety: string;
  bagSizes: RentalIncomingGatePassBagSizeItem[];
  status: string;
  /** Optional manual gate pass number (e.g. from physical gate pass) */
  manualRentalGatePassNumber?: string;
  createdAt: string;
  updatedAt: string;
}

/** API response for GET /rental-storage-gate-pass (200) */
export interface GetRentalIncomingGatePassesApiResponse {
  success: boolean;
  data: RentalIncomingGatePass[];
}

/** API response for POST /rental-storage-gate-pass (201) */
export interface CreateRentalIncomingGatePassApiResponse {
  success: boolean;
  data: RentalIncomingGatePass | null;
  message: string;
}
