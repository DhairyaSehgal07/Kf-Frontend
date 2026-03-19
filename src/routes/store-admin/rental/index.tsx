import { createFileRoute } from '@tanstack/react-router';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';

function RentalIncomingFormUnavailable() {
  return (
    <div className="mx-auto max-w-[75rem] px-4 py-10 sm:px-8">
      <Empty className="font-custom">
        <EmptyHeader>
          <EmptyTitle className="font-custom">Rental Incoming</EmptyTitle>
        </EmptyHeader>
        <EmptyDescription className="font-custom">
          The rental incoming gate pass form is currently unavailable in this
          build.
        </EmptyDescription>
      </Empty>
    </div>
  );
}

export const Route = createFileRoute('/store-admin/rental/')({
  component: RentalIncomingFormUnavailable,
});
