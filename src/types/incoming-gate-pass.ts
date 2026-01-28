import type { FarmerStorageLinkFarmer } from './farmer';

/** Request body for POST /incoming-gate-pass */
export interface CreateIncomingGatePassInput {
  farmerStorageLinkId: string;
  gatePassNo: number;
  date: string; // ISO date string
  variety: string;
  truckNumber: string;
  bagsReceived: number;
}

/** Grading summary on an incoming gate pass */
export interface IncomingGatePassGradingSummary {
  totalGradedBags: number;
}

/** Incoming gate pass as returned by the API */
export interface IncomingGatePass {
  _id: string;
  farmerStorageLinkId: string;
  gatePassNo: number;
  date: string;
  variety: string;
  truckNumber: string;
  bagsReceived: number;
  status: string;
  gradingSummary: IncomingGatePassGradingSummary;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** API response for POST /incoming-gate-pass */
export interface CreateIncomingGatePassApiResponse {
  success: boolean;
  data: IncomingGatePass | null;
  message: string;
}

/** Admin user who linked the farmer–storage pair in GET /incoming-gate-pass response */
export interface IncomingGatePassLinkedByAdmin {
  _id: string;
  name: string;
}

/** Farmer storage link as returned in GET /incoming-gate-pass response */
export interface IncomingGatePassFarmerStorageLink {
  _id: string;
  farmerId: FarmerStorageLinkFarmer;
  coldStorageId: string;
  linkedById: IncomingGatePassLinkedByAdmin;
  accountNumber: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  notes?: string;
}

/** Incoming gate pass as returned by GET /incoming-gate-pass (with populated farmerStorageLinkId) */
export interface IncomingGatePassWithLink {
  _id: string;
  farmerStorageLinkId: IncomingGatePassFarmerStorageLink;
  gatePassNo: number;
  date: string;
  variety: string;
  truckNumber: string;
  bagsReceived: number;
  status: string;
  gradingSummary: IncomingGatePassGradingSummary;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** API response for GET /incoming-gate-pass */
export interface GetIncomingGatePassesApiResponse {
  success: boolean;
  data: IncomingGatePassWithLink[];
  message?: string;
}
