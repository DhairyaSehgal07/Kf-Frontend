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
