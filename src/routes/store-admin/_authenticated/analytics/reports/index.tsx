import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import {
  ANALYTICS_REPORT_TYPES,
  type AnalyticsReportType,
} from '@/types/analytics';
import { Skeleton } from '@/components/ui/skeleton';

const ReportsScreen = lazy(
  () => import('@/components/analytics/reports/reports-screen')
);

function validateReport(search: Record<string, unknown>): {
  report?: AnalyticsReportType;
} {
  const report = search.report;
  const valid =
    typeof report === 'string' &&
    (ANALYTICS_REPORT_TYPES as readonly string[]).includes(report);
  return {
    report: valid ? (report as AnalyticsReportType) : undefined,
  };
}

export const Route = createFileRoute(
  '/store-admin/_authenticated/analytics/reports/'
)({
  validateSearch: validateReport,
  component: ReportsRouteComponent,
});

function ReportsRouteComponent() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
          <Skeleton className="font-custom mb-6 h-8 w-48 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-md" />
        </main>
      }
    >
      <ReportsScreen />
    </Suspense>
  );
}
