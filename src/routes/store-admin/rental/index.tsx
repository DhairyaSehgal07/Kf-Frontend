import { createFileRoute } from '@tanstack/react-router';
import CreateRentalIncomingForm from '@/components/forms/rental-incoming-form';

export const Route = createFileRoute('/store-admin/rental/')({
  component: CreateRentalIncomingForm,
});
