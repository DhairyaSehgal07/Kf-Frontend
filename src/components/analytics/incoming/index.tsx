import type { UseQueryResult } from '@tanstack/react-query';
import type { IncomingGatePassesResult } from '@/services/store-admin/incoming-gate-pass/useGetIncomingGatePasses';
import VarietyDistributionChart from './VarietyDistributionChart';
import IncomingTrendAnalysisChart from './IncomingTrendAnalysisChart';

export interface IncomingDateParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface IncomingGatePassAnalyticsScreenProps {
  queryResult: UseQueryResult<IncomingGatePassesResult, Error>;
  dateParams?: IncomingDateParams;
}

export default function IncomingGatePassAnalyticsScreen({
  queryResult: _queryResult,
  dateParams = {},
}: IncomingGatePassAnalyticsScreenProps) {
  return (
    <div className="font-custom space-y-6">
      <VarietyDistributionChart dateParams={dateParams} />
      <IncomingTrendAnalysisChart dateParams={dateParams} />
    </div>
  );
}
