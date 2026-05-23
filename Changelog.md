# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-05-23

People tab wired to the farmer storage links API with search, sort, and card list UI.

### Added

- **Farmer storage links API** — `getFarmerStorageLinks`, React Query hook (`useFarmerStorageLinks`), and query keys for `/farmer-storage-link`.
- **People types** — `Farmer`, `FarmerStorageLink`, and typed API response shapes.
- **People card** — `PeopleCard` and `PeopleCardSkeleton` showing farmer name, account number, mobile, address, and active status.

### Changed

- **People tab** — Loads linked farmers from the API; client-side search by name and sort by newest/oldest; loading, error, and empty states; refresh with fetch indicator.

## [0.2.0] - 2026-05-23

Storage entry flow with review sheet, shared bag quantity UI, and daybook navigation into the new route.

### Added

- **Storage create form** — `/storage` route with `CreateStorageForm` (TanStack Form + Zod) for date, farmer link, variety/category, chamber/floor/row location, bag quantities, and remarks (mock options until API is connected).
- **Storage summary sheet** — `StorageSummarySheet` to review location, quantities, and totals before final submit.
- **Storage quantities** — `StorageQuantitiesSection` with default bag-size rows, extra rows, and validation via `storageFormSchema` / `storage-quantities-schema`.
- **Storage routes** — `storage.index` and `storage.$id` for create and future edit/detail flows.
- **Shared bag fields** — `BagSizeSelectField` and `FixedBagSizeLabel` in `bag-quantity-size-field.tsx` for grading and storage quantity tables.
- **Constants** — Chamber, floor, and storage row placeholders (`CHAMBERS`, `FLOORS`, `STORAGE_ROWS`) with defaults for form hints.

### Changed

- **Daybook storage tab** — “Add Storage” navigates to `/storage`.
- **Grading fill details step** — Extra quantity rows use `BagSizeSelectField`; default rows show fixed size labels instead of a disabled select.
- **Router** — Generated route tree registers `/storage` and `/storage/$id`.

## [0.1.9] - 2026-05-23

Grading create form review sheet, per-step validation, and scroll restoration for multi-step flows.

### Added

- **Grading summary sheet** — `GradingSummarySheet` to review selected gate passes, graded quantities, and totals before final submit on the create grading form.
- **Grading form schema** — Unified `gradingFormSchema` with per-step Zod schemas (`gradingSelectStepSchema`, `gradingFillDetailsSchema`) and shared `GRADING_FORM_STEPS` metadata.
- **Incoming gate passes summary card** — `IncomingGatePassesSummaryCard` for the review flow.
- **Grading constants & mock data** — Shared farmer link options and `MOCK_INCOMING_GATE_PASSES` module for gate pass selection and summary resolution.
- **Scroll helper** — `scrollMainToTop` scrolls the window and `data-main-scroll` containers after wizard step changes.

### Changed

- **Create grading form** — “Review” validates and opens the summary sheet; confirm submit runs from the sheet; per-step Next validation; Reset action; scroll to top when entering fill details.
- **Select gate passes step** — Parent-owned form instance; table uses shared mock data module.
- **Fill details step** — Wired to the parent form instance.
- **useCreateGradingForm** — Separate review vs submit submit actions with sheet open/close callbacks.
- **Data table** — Refinements for grading gate pass selection (sorting, layout, and mobile behavior).
- **Authenticated layout** — Main content uses `data-main-scroll` with vertical overflow for nested scroll restoration.
- **Router** — `scrollToTopSelectors` includes `[data-main-scroll]`.

### Removed

- **Multi-step example** — Demo wizard form (`multi-step-example.tsx`) and `/example` route.

## [0.1.7] - 2026-05-22

Incoming review sheet, param-based edit route, and gate pass card navigation by ID.

### Added

- **Incoming summary sheet** — `IncomingSummarySheet` for reviewing gate pass details (truck, farmer, variety, weights, remarks) before final submit on create and edit forms.
- **Edit incoming form** — Full `EditIncomingForm` on `/incoming/$id` with the same fields, validation, and review flow as create.

### Changed

- **Create incoming form** — “Review” validates the form and opens the summary sheet; confirm submit runs from the sheet instead of an immediate toast.
- **Incoming routes** — Edit moves from `/incoming/edit` to `/incoming/$id`; index route files use flat `incoming.index` / `incoming.$id` naming.
- **Gate pass card** — Edit navigates to `/incoming/$id` using `_id`; mock daybook data includes IDs for list keys and navigation.
- **Sheet** — Drops unnecessary `"use client"` directive.

### Removed

- **Incoming edit shell** — Placeholder `/incoming/edit` route replaced by the `$id` edit route.

## [0.1.6] - 2026-05-21

Incoming gate pass creation flow, form-ready date picker, and combobox/checkbox UI.

### Added

- **Incoming** — `/incoming` route with `CreateIncomingForm` (TanStack Form + Zod) for gate pass details, farmer link, variety/category/stage, weights, and remarks (mock options until API is connected).
- **Incoming edit route** — `/incoming/edit` route shell for future edit flow.
- **UI** — shadcn `Checkbox` and Base UI–backed `Combobox` components.
- **Dependencies** — `@base-ui/react` for combobox primitives.

### Changed

- **Daybook incoming tab** — “Add Incoming” navigates to `/incoming`.
- **Date picker** — `onBlur`, `aria-invalid`, and controlled sync without effect-driven updates; helpers kept module-private for form use.
- **Styles** — Hide number input spin buttons in WebKit and Firefox.
- **Vite** — Dev server listens on port 3000.

## [0.1.5] - 2026-05-20

Analytics and People pages, daybook workflow tab shells, and shared date/input UI.

### Added

- **Analytics** — `/analytics` route with from/to date pickers, apply/reset actions, and an overview grid of summary metric cards (placeholder data until API is connected).
- **People** — `/people` route with URL-synced tabs for People and Dispatch ledger, each with search/filter toolbars and empty-state shells.
- **Daybook tabs** — Grading, Storage, Dispatch pre-storage, and Dispatch post-storage tab components with list toolbars, pagination, and empty states wired into the daybook page.
- **Date picker** — `DatePickerInput` built on calendar popover and `InputGroup`.
- **UI** — shadcn `InputGroup` and `Textarea` components.

### Changed

- **Daybook** — Replaces placeholder card content for grading, storage, and dispatch tabs with dedicated tab components.
- **Popover** — Drops unnecessary `"use client"` directive.

## [0.1.4] - 2026-05-19

Daybook incoming tab with gate pass cards, filters, and supporting UI primitives.

### Added

- **Daybook incoming tab** — Search, sort/status filters, pagination shell, empty state, and mock gate pass list wired into the daybook page.
- **Gate pass card** — `GatePassCard` (`incoming-gate-pass-card.tsx`) with expandable details, farmer/weight-slip info, and action buttons.
- **UI** — shadcn `Empty`, `Item`, `Pagination`, and `Select` components.

### Changed

- **Sidebar** — Primary-accent active and hover styles for default menu buttons; focus ring aligned with app theme.
- **Daybook tabs** — Simplified tab trigger markup; incoming tab renders `DaybookIncomingTab` instead of placeholder card content.

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

[0.2.1]: https://github.com/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/compare/v0.1.9...v0.2.0
[0.1.9]: https://github.com/compare/v0.1.7...v0.1.9
[0.1.7]: https://github.com/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/compare/v0.0.0...v0.1.0
