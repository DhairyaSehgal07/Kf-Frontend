import { Outlet } from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { AppTopbar } from '@/components/app-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <AppSidebar />
        <SidebarInset className="!mt-0 md:!mt-0 md:rounded-t-none">
          <AppTopbar />
          <section className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
            <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col gap-4 sm:gap-6">
              <Outlet />
            </div>
          </section>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
