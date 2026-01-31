import { createFileRoute, Link } from '@tanstack/react-router';
import NikasiGatePassForm from '@/components/forms/nikasi';

export const Route = createFileRoute('/store-admin/_authenticated/nikasi/')({
  validateSearch: (
    search: Record<string, unknown>
  ): { farmerStorageLinkId?: string } => ({
    farmerStorageLinkId:
      typeof search.farmerStorageLinkId === 'string'
        ? search.farmerStorageLinkId
        : undefined,
  }),
  component: NikasiFormPage,
});

function NikasiFormPage() {
  const { farmerStorageLinkId } = Route.useSearch();

  if (!farmerStorageLinkId) {
    return (
      <main className="font-custom mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
        <div className="mb-8 space-y-4">
          <h1 className="font-custom text-3xl font-bold text-[#333] sm:text-4xl dark:text-white">
            Create Nikasi Gate Pass
          </h1>
          <p className="text-muted-foreground font-custom text-base">
            Open this page from the Daybook: select an incoming gate pass,
            switch to the Nikasi tab, and click “Create Nikasi voucher”.
          </p>
          <Link
            to="/store-admin/daybook"
            className="font-custom text-primary text-base font-medium underline underline-offset-4 hover:no-underline"
          >
            Go to Daybook
          </Link>
        </div>
      </main>
    );
  }

  return <NikasiGatePassForm farmerStorageLinkId={farmerStorageLinkId} />;
}
