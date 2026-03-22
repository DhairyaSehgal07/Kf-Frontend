import type { FarmerStorageLinkFarmer } from './farmer';

/** Category options for incoming gate pass (const object is erasable; enum is not) */
export const IncomingGatePassCategory = {
  OWN_STOCK: 'Own Stock',
  CONTRACT_FARMING: 'Contract Farming',
  FAZALPUR: 'Fazalpur',
  PURCHASES_APR: 'Purchases-Apr',
  CONVERSION: 'Conversion',
  TRANSFER_FROM_STORES: 'Transfer From Stores',
} as const;

export type IncomingGatePassCategory =
  (typeof IncomingGatePassCategory)[keyof typeof IncomingGatePassCategory];

/** Allowed stage values for incoming gate pass (create / edit) */
export const INCOMING_GATE_PASS_STAGES = [
  'G0',
  'G1',
  'G2',
  'G3',
  'Ration',
  'Unspecial',
] as const;

export type IncomingGatePassStage = (typeof INCOMING_GATE_PASS_STAGES)[number];

/** Weight slip sub-object for incoming gate pass */
export interface IncomingGatePassWeightSlip {
  slipNumber: string;
  grossWeightKg: number;
  tareWeightKg: number;
}

/** Grading summary for create/update payload */
export interface CreateIncomingGatePassGradingSummary {
  totalGradedBags: number;
}

/** Request body for POST /incoming-gate-pass */
export interface CreateIncomingGatePassInput {
  farmerStorageLinkId: string;
  receivedById?: string;
  gatePassNo: number;
  date: string; // ISO date string
  variety: string;
  truckNumber: string;
  bagsReceived: number;
  weightSlip?: IncomingGatePassWeightSlip;
  status?: 'OPEN' | 'CLOSED';
  gradingSummary?: CreateIncomingGatePassGradingSummary;
  remarks?: string;
  manualGatePassNumber?: number;
  category?: string; // One of IncomingGatePassCategory values
  /** Pipeline stage (e.g. G0–G3, Ration, Unspecial) */
  stage?: string;
}

/** Grading summary on an incoming gate pass */
export interface IncomingGatePassGradingSummary {
  totalGradedBags: number;
  /** True when this incoming voucher has been fully graded (should not be shown in grading form). */
  graded?: boolean;
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

/** Request body for PUT /incoming-gate-pass/:id */
export interface EditIncomingGatePassInput {
  manualGatePassNumber?: number;
  stage?: string;
  date?: string; // ISO date string
}

/** API response for PUT /incoming-gate-pass/:id */
export interface EditIncomingGatePassApiResponse {
  success: boolean;
  data: Record<string, unknown>;
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
  weightSlip?: IncomingGatePassWeightSlip;
  status: string;
  /** Workflow stage (daybook / pipeline). */
  stage?: string;
  gradingSummary: IncomingGatePassGradingSummary;
  remarks?: string;
  category?: string;
  manualGatePassNumber?: number;
  /** Admin who created/linked (may be populated by API) */
  createdBy?: { name?: string };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** Query params for GET /incoming-gate-pass (pagination and search) */
export interface GetIncomingGatePassesParams {
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  /** Sort field; when not set, backend may default to date */
  sortBy?: 'date' | 'gatePassNo';
  gatePassNo?: number | string;
  /** Filter by grading status */
  status?: 'graded' | 'ungraded';
  dateFrom?: string;
  dateTo?: string;
}

/** Pagination as returned in GET /incoming-gate-pass */
export interface IncomingGatePassPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Payload when GET /incoming-gate-pass returns paginated shape */
export interface GetIncomingGatePassesData {
  incomingGatePasses?: IncomingGatePassWithLink[];
  pagination?: IncomingGatePassPagination;
}

/** API response for GET /incoming-gate-pass (data may be array or paginated object) */
export interface GetIncomingGatePassesApiResponse {
  success: boolean;
  data: IncomingGatePassWithLink[] | GetIncomingGatePassesData;
  message?: string;
}

/** Payload for GET /incoming-gate-pass/farmer-storage-link/:id */
export interface GetIncomingGatePassesByFarmerData {
  incomingGatePasses: IncomingGatePassWithLink[];
}
