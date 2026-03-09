import type { UseQueryResult } from '@tanstack/react-query';
import type { GradingGatePassesResult } from '@/services/store-admin/grading-gate-pass/useGetGradingGatePasses';
import { Loader2 } from 'lucide-react';
import SizeDistributionChart from './grading/SizeDistributionChart';
import AreaWiseAnalytics from './grading/AreaWiseAnalytics';

type DateParams = { dateFrom: string; dateTo: string } | Record<string, never>;

interface GradingGatePassAnalyticsScreenProps {
  queryResult: UseQueryResult<GradingGatePassesResult>;
  dateParams: DateParams;
}

const GradingGatePassAnalyticsScreen = ({
  queryResult,
  dateParams,
}: GradingGatePassAnalyticsScreenProps) => {
  const { data, isLoading, isError, error } = queryResult;

  if (isLoading) {
    return (
      <div className="font-custom bg-secondary/20 flex min-h-[120px] items-center justify-center rounded-lg border border-gray-200">
        <div className="flex flex-col items-center gap-2 text-[#6f6f6f]">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <span className="text-sm">Loading grading gate pass data…</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="font-custom border-destructive/30 bg-destructive/5 rounded-lg border p-4 text-sm text-[#333]">
        <p className="font-semibold">Failed to load grading data</p>
        <p className="mt-1 text-[#6f6f6f]">
          {error instanceof Error ? error.message : 'Something went wrong.'}
        </p>
      </div>
    );
  }

  const total = data?.pagination?.total ?? (data?.list ?? []).length;

  return (
    <div className="font-custom space-y-6">
      <p className="text-sm text-[#6f6f6f]">
        Grading gate passes: {total} record{total !== 1 ? 's' : ''} in range.
      </p>
      <div className="grid gap-6 lg:grid-cols-1">
        <SizeDistributionChart dateParams={dateParams} />
        <AreaWiseAnalytics dateParams={dateParams} />
      </div>
    </div>
  );
};

export default GradingGatePassAnalyticsScreen;
