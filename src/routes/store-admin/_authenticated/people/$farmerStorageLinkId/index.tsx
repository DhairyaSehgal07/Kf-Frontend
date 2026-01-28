import { createFileRoute, useRouterState } from '@tanstack/react-router';
import type { FarmerStorageLink } from '@/types/farmer';

export const Route = createFileRoute(
  '/store-admin/_authenticated/people/$farmerStorageLinkId/'
)({
  component: PeopleDetailPage,
});

function PeopleDetailPage() {
  const link = useRouterState({
    select: (state) =>
      (state.location.state as { link?: FarmerStorageLink } | undefined)?.link,
  });

  if (!link) {
    return (
      <main className="mx-auto max-w-[75rem] px-4 pt-6 pb-16 sm:px-8 sm:py-24">
        <p className="font-custom text-muted-foreground">Farmer not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[75rem] px-4 pt-6 pb-16 sm:px-8 sm:py-24">
      <h1 className="font-custom text-2xl font-semibold lg:text-3xl">
        {link.farmerId.name}
      </h1>
      <p className="font-custom text-muted-foreground mt-2">
        Account #{link.accountNumber} · {link.isActive ? 'Active' : 'Inactive'}
      </p>
    </main>
  );
}
