# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-05-18

ERP-aligned UI polish, consistent authenticated page spacing, and configurable devtools.

### Added

- **Daybook feature** — `src/features/daybook/` with route wired from `/_authenticated/daybook`.
- **Devtools toggle** — `VITE_ENABLE_DEVTOOLS` in `.env.example` and `env.enableDevtools` so TanStack Router/Query/Form devtools can be turned on without relying on `import.meta.env.DEV` alone.
- **Typography** — Global `font-heading` on `h1`–`h3` in `index.css`.

### Changed

- **Authenticated layout** — Shared `<section>` shell with style-guide padding (`p-4 sm:p-6`), `max-w-7xl` content width, and vertical rhythm (`gap-4 sm:gap-6`) for all protected routes.
- **Login form** — Touch-friendly inputs, tabular mobile number, app name in description, and ERP-consistent card styling.
- **Chrome** — Sidebar group label, cold-storage branding truncation, and topbar page title (`font-heading`, `title` tooltip).
- **Theme** — Tighter `--radius`, neutral chart palette for light/dark.
- **Devtools** — Panel stays visible when enabled (`hideUntilHover: false`).

### Removed

- Empty `src/features/auth/index.tsx` barrel file.

## [0.1.2] - 2026-05-18

Authenticated app shell with sidebar navigation, top bar, and the first protected route.

### Added

- **Authenticated layout** — `/_authenticated` route guard (redirects unauthenticated users to login with return URL), shared layout with collapsible sidebar and top bar (`AppSidebar`, `AppTopbar`).
- **Daybook route** — `/daybook` as the first protected page under the authenticated layout.
- **Router auth context** — `auth` on router context (`isAuthenticated`, `user`, `accessToken`) supplied from `Providers` via the auth store.
- **UI** — shadcn `Sidebar` (and related primitives), `Avatar`, `Badge`, `Breadcrumb`, `Calendar`, `DropdownMenu`, `Popover`, `Sheet`, `Skeleton`, and `Tooltip`; `use-mobile` hook for responsive sidebar behavior.
- **Dependencies** — `date-fns` and `react-day-picker` for calendar/date UI.

### Changed

- Login success navigates to `/daybook` (or `?redirect=` when present); authenticated users visiting `/` are redirected to daybook or the redirect target.
- Home route validates optional `redirect` search param via Zod.

## [0.1.1] - 2026-05-18

Authentication flow, shared API client, and supporting UI for the login experience.

### Added

- **Authentication** — Login feature with TanStack Form + Zod validation, React Query mutations (`useLogin`, `useLogout`), and a Zustand auth store for access tokens and user session state.
- **API client** — Axios instance with bearer-token request interceptor, 401 handling (clear session + redirect), and typed env config (`VITE_API_BASE_URL`, `VITE_APP_NAME`) via `src/lib/env.ts`.
- **UI** — shadcn `Card`, `Field`, `Input`, `Label`, and `Separator` components; Sonner toasts for login feedback; theme provider (`next-themes`) with system/light/dark support.
- **Devtools** — Unified TanStack devtools panel (router, query, and form) in development.
- **Config** — `.env.example` documenting required `VITE_` variables; `.gitignore` entries for `.env` and local env overrides.

### Changed

- Home route (`/`) renders the login form instead of the starter demo.
- Router setup extracted to `src/router.ts`; providers wrap the app with `ThemeProvider`, `Toaster`, and consolidated devtools.
- Root layout simplified to route outlet only.

### Removed

- Example `useBearStore` Zustand demo store.

## [0.1.0] - 2026-05-17

First application scaffold for the Kapur frontend (`kf-frontend`).

### Added

- **Routing** — TanStack Router with file-based routes (`src/routes/`), generated route tree, intent-based preloading, and router context wired to React Query.
- **Data fetching** — TanStack Query with a shared `QueryClient` (60s default stale time, single retry) and dev-only React Query Devtools.
- **UI** — Tailwind CSS v4, shadcn/ui (`radix-luma` / zinc), Lucide icons, and an initial `Button` component.
- **State** — Zustand with an example `useBearStore`.
- **Tooling** — `@/` path alias, Prettier (+ Tailwind class sorting), React Compiler via Babel, and TanStack Router Vite plugin with auto code splitting.
- **Fonts** — Inter and Outfit variable font packages.
- **Dependencies** — Axios for HTTP, plus `class-variance-authority`, `clsx`, and `tailwind-merge` for component styling.

### Changed

- Replaced the Vite + React starter demo with a `Providers` entry point (`RouterProvider` + `QueryClientProvider`).
- Root layout includes basic navigation and route outlet; home route demonstrates shadcn `Button`.
- Vite config extended with Tailwind, TanStack Router, and React Compiler presets.

### Removed

- Default Vite starter styles (`App.css`) and demo application UI from the initial template.

[0.1.3]: https://github.com/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/compare/v0.0.0...v0.1.0
