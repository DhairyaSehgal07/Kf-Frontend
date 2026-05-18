import { createFileRoute } from '@tanstack/react-router';
import DaybookPage from '@/features/daybook';


export const Route = createFileRoute('/_authenticated/daybook')({
  component: DaybookPage,
});
