import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { TanStackAppDevtools } from '@/components/tanstack-devtools';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from './lib/queryClient';
import { router } from './router';

export function Providers() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
        {import.meta.env.DEV ? <TanStackAppDevtools router={router} /> : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
