import { createFileRoute } from '@tanstack/react-router';

function GradingReportPage() {
  return <div>Grading report</div>;
}

export const Route = createFileRoute('/_authenticated/grading/report')({
  component: GradingReportPage,
});
