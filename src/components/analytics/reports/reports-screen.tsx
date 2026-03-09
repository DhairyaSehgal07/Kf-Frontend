import { memo } from 'react';
import { useSearch } from '@tanstack/react-router';
import IncomingReportTable from './incoming-report';
import PlaceholderReport from './placeholder-report';

function ReportsScreenInner() {
  const { report } = useSearch({
    from: '/store-admin/_authenticated/analytics/reports/',
  });

  if (!report) {
    return (
      <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
        <div className="space-y-6">
          <h2 className="font-custom text-2xl font-semibold text-[#333]">
            Analytics Reports
          </h2>
          <p className="font-custom text-sm text-[#6f6f6f]">
            Select a report from the Analytics overview cards (e.g. &quot;Get
            Reports&quot; on Incoming, Grading, or Dispatch), or use the URL:{' '}
            <code className="bg-secondary rounded px-1.5 py-0.5 text-xs">
              /store-admin/analytics/reports?report=incoming
            </code>
          </p>
        </div>
      </main>
    );
  }

  if (report === 'incoming') {
    return <IncomingReportTable />;
  }

  return <PlaceholderReport reportType={report} />;
}

const ReportsScreen = memo(ReportsScreenInner);
export default ReportsScreen;
