import { useQuery, queryOptions } from '@tanstack/react-query';
import type { IncomingGatePassWithLink } from '@/types/incoming-gate-pass';

export type IncomingGatePassReportParams = {
  dateFrom?: string;
  dateTo?: string;
  groupByFarmer?: boolean;
  groupByVariety?: boolean;
};

const key = [
  'store-admin',
  'analytics',
  'incoming',
  'gate-pass-report',
] as const;

function queryKey(params: IncomingGatePassReportParams) {
  return [
    ...key,
    params.dateFrom ?? '',
    params.dateTo ?? '',
    params.groupByFarmer ?? false,
    params.groupByVariety ?? false,
  ] as const;
}

/**
 * Fetcher for incoming gate pass report.
 * Replace with real GET /analytics/incoming-gate-pass-report when available.
 */
async function fetchIncomingGatePassReport(
  _params: IncomingGatePassReportParams
): Promise<IncomingGatePassWithLink[]> {
  return [];
}

export const incomingGatePassReportQueryOptions = (
  params: IncomingGatePassReportParams
) =>
  queryOptions({
    queryKey: queryKey(params),
    queryFn: () => fetchIncomingGatePassReport(params),
  });

export function useGetIncomingGatePassReports(
  params: IncomingGatePassReportParams
) {
  return useQuery(incomingGatePassReportQueryOptions(params));
}
