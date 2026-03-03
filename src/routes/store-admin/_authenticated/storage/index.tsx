import { createFileRoute } from '@tanstack/react-router';
import StorageGatePassForm from '@/components/forms/storage';

export const Route = createFileRoute('/store-admin/_authenticated/storage/')({
  validateSearch: (
    search: Record<string, unknown>
  ): { farmerStorageLinkId?: string; gradingPassId?: string } => ({
    farmerStorageLinkId:
      typeof search.farmerStorageLinkId === 'string'
        ? search.farmerStorageLinkId
        : undefined,
    gradingPassId:
      typeof search.gradingPassId === 'string'
        ? search.gradingPassId
        : undefined,
  }),
  component: StorageFormPage,
});

function StorageFormPage() {
  const { farmerStorageLinkId, gradingPassId } = Route.useSearch();

  return (
    <StorageGatePassForm
      farmerStorageLinkId={farmerStorageLinkId}
      gradingPassId={gradingPassId}
    />
  );
}
