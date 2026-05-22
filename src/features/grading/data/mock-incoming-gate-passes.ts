import type { GradingSelectIncomingGatePasses } from "@/features/grading/types"

export const MOCK_INCOMING_GATE_PASSES: GradingSelectIncomingGatePasses[] = [
  {
    _id: "728ed52f",
    gatePassNo: 1001,
    manualGatePassNumber: 100,
    date: "2026-05-22",
    variety: "Pukhraj",
    truckNumber: "HR-26-DK-4521",
    bagsReceived: 100,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed530",
    gatePassNo: 1002,
    manualGatePassNumber: 101,
    date: "2026-05-21",
    variety: "Jyoti",
    truckNumber: "PB-10-AX-7812",
    bagsReceived: 120,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed531",
    gatePassNo: 1003,
    manualGatePassNumber: 102,
    date: "2026-05-20",
    variety: "Kufri Chipsona",
    truckNumber: "RJ-14-BL-9021",
    bagsReceived: 95,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed532",
    gatePassNo: 1004,
    manualGatePassNumber: 103,
    date: "2026-05-19",
    variety: "Pukhraj",
    truckNumber: "HR-38-QW-6671",
    bagsReceived: 140,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed533",
    gatePassNo: 1005,
    manualGatePassNumber: 104,
    date: "2026-05-18",
    variety: "Santana",
    truckNumber: "PB-08-TY-5544",
    bagsReceived: 80,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed534",
    gatePassNo: 1006,
    manualGatePassNumber: 105,
    date: "2026-05-17",
    variety: "Jyoti",
    truckNumber: "UP-32-MN-7788",
    bagsReceived: 110,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed535",
    gatePassNo: 1007,
    manualGatePassNumber: 106,
    date: "2026-05-16",
    variety: "Kufri Badshah",
    truckNumber: "DL-01-RT-1133",
    bagsReceived: 150,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed536",
    gatePassNo: 1008,
    manualGatePassNumber: 107,
    date: "2026-05-15",
    variety: "Pukhraj",
    truckNumber: "HR-55-ZX-2299",
    bagsReceived: 90,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed537",
    gatePassNo: 1009,
    manualGatePassNumber: 108,
    date: "2026-05-14",
    variety: "Santana",
    truckNumber: "PB-11-KL-8810",
    bagsReceived: 130,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed538",
    gatePassNo: 1010,
    manualGatePassNumber: 109,
    date: "2026-05-13",
    variety: "Kufri Chipsona",
    truckNumber: "RJ-45-DF-6722",
    bagsReceived: 105,
    status: "NOT_GRADED",
  },
  {
    _id: "728ed539",
    gatePassNo: 1011,
    manualGatePassNumber: 110,
    date: "2026-05-12",
    variety: "Jyoti",
    truckNumber: "HR-26-PL-9981",
    bagsReceived: 115,
    status: "NOT_GRADED",
  },
]

export async function fetchMockIncomingGatePasses(): Promise<
  GradingSelectIncomingGatePasses[]
> {
  return MOCK_INCOMING_GATE_PASSES
}

export function resolveSelectedIncomingGatePasses(
  selectedIds: readonly string[],
  allGatePasses: readonly GradingSelectIncomingGatePasses[]
): GradingSelectIncomingGatePasses[] {
  const idSet = new Set(selectedIds)
  return allGatePasses.filter((gatePass) => idSet.has(gatePass._id))
}
