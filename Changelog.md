# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.0]: https://github.com/compare/v0.0.0...v0.1.0
