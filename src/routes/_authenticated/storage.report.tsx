import { createFileRoute } from '@tanstack/react-router';

function StorageReportPage() {
  return <div>Storage report</div>;
}

export const Route = createFileRoute('/_authenticated/storage/report')({
  component: StorageReportPage,
});
