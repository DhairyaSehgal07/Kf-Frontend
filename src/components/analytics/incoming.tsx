import type { UseQueryResult } from '@tanstack/react-query';
import type { IncomingGatePassesResult } from '@/services/store-admin/incoming-gate-pass/useGetIncomingGatePasses';
import { Loader2 } from 'lucide-react';
import VarietyDistributionChart from './incoming/VarietyDistributionChart';
import IncomingTrendAnalysisChart from './incoming/IncomingTrendAnalysisChart';

type DateParams = { dateFrom: string; dateTo: string } | Record<string, never>;

interface IncomingGatePassAnalyticsScreenProps {
  queryResult: UseQueryResult<IncomingGatePassesResult>;
  dateParams: DateParams;
}

const IncomingGatePassAnalyticsScreen = ({
  queryResult,
  dateParams,
}: IncomingGatePassAnalyticsScreenProps) => {
  const { data, isLoading, isError, error } = queryResult;

  if (isLoading) {
    return (
      <div className="font-custom bg-secondary/20 flex min-h-[120px] items-center justify-center rounded-lg border border-gray-200">
        <div className="flex flex-col items-center gap-2 text-[#6f6f6f]">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <span className="text-sm">Loading incoming gate pass data…</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="font-custom border-destructive/30 bg-destructive/5 rounded-lg border p-4 text-sm text-[#333]">
        <p className="font-semibold">Failed to load incoming data</p>
        <p className="mt-1 text-[#6f6f6f]">
          {error instanceof Error ? error.message : 'Something went wrong.'}
        </p>
      </div>
    );
  }

  const list = data?.list ?? [];
  const total = data?.pagination?.total ?? list.length;

  return (
    <div className="font-custom space-y-6">
      <p className="text-sm text-[#6f6f6f]">
        Incoming gate passes: {total} record{total !== 1 ? 's' : ''} in range.
      </p>
      <div className="grid gap-6 lg:grid-cols-1">
        <VarietyDistributionChart dateParams={dateParams} />
        <IncomingTrendAnalysisChart dateParams={dateParams} />
      </div>
      {list.length > 0 && (
        <details className="bg-secondary/10 rounded-lg border border-gray-200">
          <summary className="font-custom cursor-pointer px-4 py-3 text-sm font-medium text-[#333]">
            Recent gate passes (first 10)
          </summary>
          <ul className="list-inside list-disc border-t border-gray-200 px-4 py-3 text-sm text-[#333]">
            {list.slice(0, 10).map((item) => (
              <li key={item._id}>
                GP #{item.gatePassNo} – {item.variety} – {item.bagsReceived}{' '}
                bags
              </li>
            ))}
            {list.length > 10 && (
              <li className="text-[#6f6f6f]">… and {list.length - 10} more</li>
            )}
          </ul>
        </details>
      )}
    </div>
  );
};

export default IncomingGatePassAnalyticsScreen;
