import { createFileRoute } from '@tanstack/react-router';
import TemperatureMonitoringPage from '@/components/additional/temperature-monitoring';

export const Route = createFileRoute(
  '/store-admin/_authenticated/additional/temperature-monitoring/'
)({
  component: TemperatureMonitoringPage,
});
