import { createFileRoute } from '@tanstack/react-router';

function DispatchPreStorageReportPage() {
  return <div>Dispatch pre-storage report</div>;
}

export const Route = createFileRoute(
  '/_authenticated/dispatch-pre-storage/report',
)({
  component: DispatchPreStorageReportPage,
});
