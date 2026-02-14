import { createFileRoute } from '@tanstack/react-router';
import GroupedOrdersPage from '@/components/grouped';

export const Route = createFileRoute('/store-admin/_authenticated/grouped/')({
  component: GroupedOrdersPage,
});
