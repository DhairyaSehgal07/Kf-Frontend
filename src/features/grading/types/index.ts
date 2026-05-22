import type { GatePassData } from "@/components/incoming-gate-pass-card";

export type GradingSelectIncomingGatePasses = Pick<
  GatePassData,
 | "_id"
  | "gatePassNo"
  | "manualGatePassNumber"
  | "date"
  | "variety"
  | "truckNumber"
  | "bagsReceived"
  | "status"
>