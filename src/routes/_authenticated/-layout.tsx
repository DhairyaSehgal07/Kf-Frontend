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
          <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
            <div className="mx-auto w-full max-w-7xl flex-1">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
