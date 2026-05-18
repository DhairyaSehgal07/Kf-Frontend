import { useRouterState } from '@tanstack/react-router';
import { Loader2, LogOut, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLogout } from '@/features/auth/api/use-logout';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { cn } from '@/lib/utils';

const routeTitles: Record<string, string> = {
  '/daybook': 'Daybook',
};

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useResolvedThemeMode() {
  const { theme, resolvedTheme } = useTheme();

  if (theme === 'light' || theme === 'dark') {
    return theme;
  }

  return resolvedTheme === 'dark' ? 'dark' : 'light';
}

function ThemeToggle() {
  const { setTheme } = useTheme();
  const isClient = useIsClient();
  const resolvedMode = useResolvedThemeMode();

  if (!isClient) {
    return (
      <Button variant="ghost" size="icon-sm" disabled aria-label="Theme">
        <Sun className="size-4 text-muted-foreground" />
      </Button>
    );
  }

  const isDark = resolvedMode === 'dark';

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Change theme"
            >
              {isDark ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-foreground">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={resolvedMode}
          onValueChange={(value) => setTheme(value)}
        >
          <DropdownMenuRadioItem value="light">
            <Sun className="size-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" />
            Dark
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppTopbar() {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pageTitle =
    routeTitles[pathname] ?? user?.coldStorageId.name ?? 'Dashboard';

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center border-b border-border bg-background px-4 text-foreground',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator
          orientation="vertical"
          className="mx-2 !h-4 w-px !self-center shrink-0 bg-border"
        />
        <h1
          className="truncate font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg"
          title={pageTitle}
        >
          {pageTitle}
        </h1>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 rounded-md px-2 text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-24 truncate text-sm font-medium lg:inline">
                {user?.name ?? 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {user?.mobileNumber}
                </p>
                <Badge variant="secondary" className="w-fit">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <User className="size-4" />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onClick={() => logout()}
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {isLoggingOut ? 'Signing out…' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
