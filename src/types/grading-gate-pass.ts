import type { FarmerStorageLinkFarmer } from './farmer';

/** Admin user (graded-by) in grading gate pass response */
export interface GradingGatePassGradedBy {
  _id: string;
  name: string;
  mobileNumber: string;
}

/** Linked-by admin as returned in nested incoming gate pass */
export interface GradingGatePassLinkedBy {
  _id: string;
  name: string;
}

/** Farmer storage link as returned inside grading gate pass incoming ref */
export interface GradingGatePassFarmerStorageLink {
  _id: string;
  farmerId: FarmerStorageLinkFarmer;
  coldStorageId: string;
  linkedById: GradingGatePassLinkedBy;
  accountNumber: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  notes?: string;
}

/** Minimal farmer storage link as returned in GET /grading-gate-pass list (populated) */
export interface GradingGatePassFarmerStorageLinkMinimal {
  _id: string;
  farmerId: { _id: string; name: string };
  accountNumber: number;
}

/** Incoming gate pass ref in GET /grading-gate-pass list response */
export interface GradingGatePassIncomingRef {
  _id: string;
  gatePassNo: number;
  manualGatePassNumber?: number;
  bagsReceived: number;
  /** Present when incoming gate pass is populated */
  truckNumber?: string;
}

/** Grading summary on nested incoming gate pass */
export interface GradingGatePassIncomingGradingSummary {
  totalGradedBags: number;
}

/** Incoming gate pass as nested in GET /grading-gate-pass response (legacy single ref) */
export interface GradingGatePassIncomingGatePass {
  _id: string;
  farmerStorageLinkId: GradingGatePassFarmerStorageLink;
  gatePassNo: number;
  date: string;
  variety: string;
  truckNumber: string;
  bagsReceived: number;
  status: string;
  gradingSummary: GradingGatePassIncomingGradingSummary;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** Single order detail row in a grading gate pass */
export interface GradingGatePassOrderDetail {
  size: string;
  bagType: string;
  currentQuantity: number;
  initialQuantity: number;
  weightPerBagKg: number;
}

/** Grading gate pass as returned by GET /grading-gate-pass (list response) */
export interface GradingGatePass {
  _id: string;
  farmerStorageLinkId: GradingGatePassFarmerStorageLinkMinimal;
  incomingGatePassIds: GradingGatePassIncomingRef[];
  createdBy: GradingGatePassGradedBy;
  gatePassNo: number;
  manualGatePassNumber?: number;
  date: string;
  variety: string;
  orderDetails: GradingGatePassOrderDetail[];
  allocationStatus: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** Query params for GET /grading-gate-pass (pagination and search) */
export interface GetGradingGatePassesParams {
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  gatePassNo?: number | string;
}

/** Pagination as returned in GET /grading-gate-pass */
export interface GradingGatePassPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Payload inside GET /grading-gate-pass response (data field) */
export interface GetGradingGatePassesData {
  gradingGatePasses: GradingGatePass[];
  pagination: GradingGatePassPagination;
}

/** API response for GET /grading-gate-pass */
export interface GetGradingGatePassesApiResponse {
  success: boolean;
  data: GetGradingGatePassesData;
  message?: string;
}

/** Order detail for POST /grading-gate-pass (size name can vary) */
export interface CreateGradingGatePassOrderDetail {
  size: string;
  bagType: string;
  currentQuantity: number;
  initialQuantity: number;
  weightPerBagKg: number;
}

/** Request body for POST /grading-gate-pass */
export interface CreateGradingGatePassInput {
  farmerStorageLinkId: string;
  incomingGatePassId: string;
  /** Optional list of incoming gate pass IDs to reference (from step 1 selection). */
  incomingGatePassIds?: string[];
  gradedById: string;
  gatePassNo: number;
  date: string;
  variety: string;
  orderDetails: CreateGradingGatePassOrderDetail[];
  allocationStatus: string;
  remarks?: string;
  manualGatePassNumber?: number;
}

/** Created grading gate pass as returned by POST /grading-gate-pass (refs as IDs) */
export interface CreatedGradingGatePass {
  _id: string;
  incomingGatePassId: string;
  gradedById: string;
  gatePassNo: number;
  date: string;
  variety: string;
  orderDetails: GradingGatePassOrderDetail[];
  allocationStatus: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** API response for POST /grading-gate-pass */
export interface CreateGradingGatePassApiResponse {
  success: boolean;
  data: CreatedGradingGatePass | null;
  message?: string;
}
