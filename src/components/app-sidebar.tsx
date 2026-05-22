import { Link, useRouterState } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  Building2,
  Layers,
  Settings,
  Users,
} from 'lucide-react';
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
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

type NavItem = {
  name: string;
  icon: LucideIcon;
  to?: string;
  disabled?: boolean;
};

// Updated navigation items
const coreNavItems: NavItem[] = [
  { name: 'Daybook', icon: BookOpen, to: '/daybook' },
  { name: 'People', icon: Users, to: '/people' },
  { name: 'Analytics', icon: BarChart3, to: '/analytics' },
  { name: 'Additional', icon: Layers, to: '/additional' },
];

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

            return (
              <SidebarMenuItem key={item.name}>
                {item.to && !item.disabled ? (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.to}
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