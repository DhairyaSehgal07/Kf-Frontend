import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/daybook')({
  component: () => (
    <div>
      implement daybook here
    </div>
  ),
});
