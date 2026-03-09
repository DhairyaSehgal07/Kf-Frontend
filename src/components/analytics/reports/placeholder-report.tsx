import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';
import type { AnalyticsReportType } from '@/types/analytics';

const REPORT_LABELS: Record<AnalyticsReportType, string> = {
  incoming: 'Incoming',
  ungraded: 'Ungraded',
  grading: 'Grading',
  stored: 'Storage',
  dispatch: 'Dispatch',
  outgoing: 'Outgoing',
};

interface PlaceholderReportProps {
  reportType: AnalyticsReportType;
}

const PlaceholderReport = memo(function PlaceholderReport({
  reportType,
}: PlaceholderReportProps) {
  const title = REPORT_LABELS[reportType];

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        <h2 className="font-custom text-2xl font-semibold text-[#333]">
          {title} Report
        </h2>
        <Card className="font-custom border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <span className="bg-muted text-muted-foreground flex h-14 w-14 shrink-0 items-center justify-center rounded-full">
              <FileQuestion className="h-7 w-7" aria-hidden />
            </span>
            <p className="text-center text-sm text-[#6f6f6f]">
              This report is not yet implemented. It will show tabular data with
              date filters and PDF export when available.
            </p>
            <Link
              to="/store-admin/analytics"
              className="font-custom text-primary hover:text-primary/90 focus-visible:ring-primary rounded text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Back to Analytics
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
});

export default PlaceholderReport;
