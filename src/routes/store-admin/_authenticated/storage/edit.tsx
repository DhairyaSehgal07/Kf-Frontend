import { createFileRoute } from '@tanstack/react-router';
import EditStorageGatePassForm from '@/components/forms/storage/edit';

export const Route = createFileRoute(
  '/store-admin/_authenticated/storage/edit'
)({
  component: EditStorageGatePassForm,
});
