import { Link, useRouterState } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  Building2,
  ChevronRight,
  FileBarChart,
  Layers,
  Settings,
  Users,
} from 'lucide-react';
import { Collapsible } from 'radix-ui';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  icon: LucideIcon;
  to?: string;
  activePaths?: string[];
  disabled?: boolean;
};

// Updated navigation items
const coreNavItems: NavItem[] = [
  {
    name: 'Daybook',
    icon: BookOpen,
    to: '/daybook',
    activePaths: ['/daybook', '/incoming', '/grading', '/storage', '/transfer'],
  },
  {
    name: 'People',
    icon: Users,
    to: '/people',
    activePaths: ['/people'],
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    to: '/analytics',
    activePaths: ['/analytics'],
  },
  {
    name: 'Additional',
    icon: Layers,
    to: '/additional',
    activePaths: ['/additional'],
  },
];

const reportNavItems = [
  { name: 'Incoming', to: '/incoming/report' },
  { name: 'Grading', to: '/grading/report' },
  { name: 'Storage', to: '/storage/report' },
  { name: 'Dispatch pre-storage', to: '/dispatch-pre-storage/report' },
  { name: 'Dispatch post-storage', to: '/dispatch-post-storage/report' },
] as const;

function isReportPath(pathname: string) {
  return reportNavItems.some((item) => pathname === item.to);
}

function isPathActive(pathname: string, activePaths: string[]) {
  return activePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function NavReports({ pathname }: { pathname: string }) {
  const reportsActive = isReportPath(pathname);
  const [open, setOpen] = useState(false);
  const isOpen = reportsActive || open;

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <Collapsible.Trigger asChild>
          <SidebarMenuButton
            isActive={reportsActive}
            tooltip="Reports"
            className="group/collapsible-trigger"
          >
            <FileBarChart />
            <span>Reports</span>
            <ChevronRight
              className={cn(
                'ml-auto size-4 transition-transform duration-200',
                'group-data-[state=open]/collapsible:rotate-90',
              )}
            />
          </SidebarMenuButton>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <SidebarMenuSub>
            {reportNavItems.map((item) => (
              <SidebarMenuSubItem key={item.to}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === item.to}
                >
                  <Link to={item.to}>{item.name}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </Collapsible.Content>
      </SidebarMenuItem>
    </Collapsible.Root>
  );
}

function NavMain() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Core Operations
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {coreNavItems.map((item) => {
            const Icon = item.icon;
            const itemActivePaths = item.activePaths ?? (item.to ? [item.to] : []);
            const isActive =
              !isReportPath(pathname) && isPathActive(pathname, itemActivePaths);

            return (
              <SidebarMenuItem key={item.name}>
                {item.to && !item.disabled ? (
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                  >
                    <Link to={item.to}>
                      <Icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton disabled tooltip={item.name}>
                    <Icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
          <NavReports pathname={pathname} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const coldStorageName = useAuthStore(
    (s) => s.user?.coldStorageId.name ?? 'Cold Storage',
  );
  const userRole = useAuthStore((s) => s.user?.role);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/daybook" search={{ tab: "incoming" }}>
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span
                    className="truncate font-semibold text-sidebar-foreground"
                    title={coldStorageName}
                  >
                    {coldStorageName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userRole ?? 'Operations'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}