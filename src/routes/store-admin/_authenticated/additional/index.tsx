import { createFileRoute } from '@tanstack/react-router';
import AdditionalModulesPage from '@/components/additional';

export const Route = createFileRoute('/store-admin/_authenticated/additional/')(
  {
    component: AdditionalModulesPage,
  }
);
