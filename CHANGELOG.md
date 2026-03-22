# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.21] - 2026-03-22

### Added
- Incoming gate pass: `stage` field with `INCOMING_GATE_PASS_STAGES` and related types on create/list payloads
- Incoming form: required **Stage** selector (`SearchSelector`) and summary row; stage included on submit
- Daybook incoming voucher: **Edit** dialog to update manual gate pass number, stage, and date via `useEditIncomingGatePass` (`PUT /incoming-gate-pass/:id`); stage badge and expanded detail row
- `useEditIncomingGatePass` mutation hook with daybook/incoming query invalidation and toasts

### Changed
- `IncomingVoucherPdf`: shows **Stage** when present

## [0.10.20] - 2026-03-20

### Added
- People (farmer storage) detail: storage tab now uses real data via `useGetStorageGatePassesOfSingleFarmer` with search, sort, pagination, refresh, and voucher rendering
- Storage gate pass types: `GetStorageGatePassesByFarmerData` for `GET /storage-gate-pass/farmer-storage-link/:id`

### Changed
- People (farmer storage) detail: header Storage summary now totals `bagSizes.initialQuantity` from storage gate passes; removed "View Stock Ledger" CTA/dialog from the page for now
- Analytics Reports (grading): pass total columns into shared table totals logic, including dynamic bag-size columns

### Fixed
- Grading report totals (table + PDF): numeric parsing now handles object-shaped values with `quantity`, and grouped sections render per-group totals consistently

## [0.10.19] - 2026-03-19

### Changed
- Analytics Reports: grading report and storage report table refinements (columns/sorting/PDF export)
- Daybook: storage voucher and gate pass search refinements

### Removed
- Rental incoming: removed rental incoming form components and service hooks

### Fixed
- Store admin rental route: render an “unavailable” placeholder instead of importing removed rental form code

## [0.10.18] - 2026-03-19

### Added
- Analytics Reports: Ungraded gate pass report at `/store-admin/analytics/reports?report=ungraded` with date filters, ungraded-only filtering, and PDF export

### Changed
- Analytics Reports: reports screen route `report=ungraded` to the Ungraded report table
- Daybook: storage gate pass search now matches exact gate pass number for numeric queries
- Incoming form: simplified default export to `IncomingForm` (type switcher removed)
- Storage form: storage category selector now includes `RENTAL` and uses `SearchSelector` for searchable selection

## [0.10.17] - 2026-03-16

### Added
- Storage gate pass edit: `useEditStorageGatePass` hook for `PUT /storage-gate-pass/:id` with optional `manualGatePassNumber`, `storageCategory`, and `date`; types `EditStorageGatePassInput`, `EditStorageGatePassApiResponse` in `storage-gate-pass.ts`
- Storage voucher (daybook): Edit action with dialog to update manual gate pass number, date, and storage category; success toast and cache invalidation on edit

### Changed
- Storage voucher: Edit button and dialog integrated with `useEditStorageGatePass`; date and category options (OWNED, PURCHASED, CONTRACT FARMING) in edit form

## [0.10.16] - 2026-03-16

### Added
- Analytics Reports: Storage report at `/store-admin/analytics/reports?report=stored` with date filters, data table (columns, sort, column visibility), and PDF export via `storage-report-table-pdf`
- Storage report: `StorageReportTable` with storage gate pass list data; columns and constants for storage report; snapshot-based PDF generation
- Storage form: optional `storageCategory` field (category name for the storage gate pass)

### Changed
- Reports screen: routes `report=stored` to `StorageReportTable`; placeholder hint updated with storage report URL example
- Storage gate pass types: `storageCategory` optional on `CreateStorageGatePassInput` and storage gate pass response types

## [0.10.15] - 2026-03-14

### Changed
- Daybook: Incoming and Grading tabs default sort by Voucher Number (gatePassNo); pass `sortBy` to list APIs
- Gate pass list APIs: optional `sortBy` param (`'date' | 'gatePassNo'`) in `useGetIncomingGatePasses` and `useGetGradingGatePasses`; types `GetIncomingGatePassesParams` and `GetGradingGatePassesParams` extended with `sortBy`

## [0.10.14] - 2026-03-11

### Added
- Analytics Reports: Grading report at `/store-admin/analytics/reports?report=grading` with date filters, data table (columns, sort, column visibility), and PDF export via `grading-report-table-pdf`
- Grading report: `GradingReportTable` component with grading gate pass list data; columns and constants for grading report; snapshot-based PDF generation
- Grading gate pass types: `GradingGatePassWeightSlip`, `GradingGatePassIncomingRef` with `date`, and report-related type extensions in `grading-gate-pass.ts`

### Changed
- Reports screen: routes `report=grading` to `GradingReportTable`; placeholder hint updated with grading report URL example
- Incoming report data-table: refinements for consistency with shared report patterns

## [0.10.13] - 2026-03-09

### Added
- Analytics: Grading and Incoming tabs refactored with dedicated screen components (`GradingGatePassAnalyticsScreen`, `IncomingGatePassAnalyticsScreen`) in `grading/index.tsx` and `incoming/index.tsx`
- Area breakdown: route at `/store-admin/area-breakdown` and hook `useGetAreaBreakdown` for `GET /analytics/farmers-stock-by-filters` (area, size, variety params)
- Analytics report hooks: `useGetGradingGatePassReports`, `useGetNikasiGatePassReports`, `useGetStorageGatePassReports` for grading, nikasi, and storage gate pass report data

### Changed
- Analytics: AreaWiseAnalytics, SizeDistributionChart, IncomingTrendAnalysisChart, VarietyDistributionChart refinements and date-params integration
- Analytics hooks: `useGetOverview`, `useGetIncomingTrendAnalysis`, `useGetIncomingVarietyBreakdown`, `useGetIncomingGatePassReports` updated for params and prefetch; `useGetAreaWiseAnalytics`, `useGetGradingSizeWiseDistribution` with date params and prefetch support
- Daybook: refactored and simplified
- People (farmer storage) detail page: refactored and simplified
- Types: analytics types extended for area breakdown and report APIs

## [0.10.12] - 2026-03-09

### Added
- Analytics: Incoming tab with trend analysis chart and variety distribution chart; hooks `useGetIncomingTrendAnalysis`, `useGetIncomingVarietyBreakdown`
- Analytics: Grading tab with area-wise analytics and size distribution chart; hooks `useGetAreaWiseAnalytics`, `useGetGradingSizeWiseDistribution`
- Analytics: Reports screen at `/store-admin/analytics/reports` with report type from query (`?report=incoming`); Incoming report table with date filters, columns, sort, export to PDF; placeholder report for other report types
- Incoming report: data table with column visibility, PDF export via `incoming-report-table-pdf`; columns and data-table components
- Service hooks: `useGetIncomingGatePassReports` for incoming report data; analytics overview re-enabled with real API and date params
- Route: `store-admin/_authenticated/analytics/reports/index.tsx` for reports sub-route

### Changed
- Analytics overview: uses `useGetOverview` with date params; overview cards link to Incoming, Grading, and Reports; shared date picker and apply/reset with prefetch for overview, incoming, grading size distribution, and area-wise analytics
- Daybook: minor updates
- Grading form: step 1 and constants refinements
- Types: analytics, grading-gate-pass, and incoming-gate-pass updates for new API shapes and report columns
- Helpers and table UI: updates for analytics and report usage

## [0.10.11] - 2026-03-06

### Added
- Grading voucher: Incoming Gate Passes table columns for Bardana (kg) and Net product (kg) per row and in totals (incoming bardana = bags × 0.7 kg JUTE)
- Grading voucher: Order Details table columns for Bag wt (kg), Deduction (kg), and Net (kg) per row and in totals (JUTE 0.7 kg, LENO 0.06 kg per bag type)
- People (farmer storage) detail: Incoming & grading table columns for Bardana (kg), Net product (kg), and Grading bardana (kg); summary cards and footer totals for same

### Changed
- Grading voucher: wastage and percentages use net product (incoming weight − incoming bags × 0.7 kg); grading weight uses bag-type deduction (JUTE 700 g, LENO 60 g per bag) via `computeGradingOrderTotals`
- Grading voucher: total graded weight display limited to 2 decimal places (kg and % of net)
- People detail: incoming/grading row calculations aligned with grading voucher (incoming bardana JUTE only; grading bardana by bag type); conversion and wastage % based on net product
- Grading voucher calculations: comments clarifying incoming bags are always JUTE; grading uses `getBagWeightKg(bagType)` for JUTE vs LENO

## [0.10.10] - 2026-03-05

### Added
- People (farmer storage) detail: Incoming and Grading tabs with real data via `ContractTabPanel`; search, sort, pagination, refresh, and voucher cards
- Service hook `useGetIncomingGatePassesOfSingleFarmer` for `GET /incoming-gate-pass/farmer-storage-link/:id` with prefetch support
- Types: `GetIncomingGatePassesByFarmerData` (incoming-gate-pass), `GetGradingGatePassesByFarmerData` (grading-gate-pass) for per-farmer list API responses

### Changed
- People detail page: Incoming and Grading sections use `IncomingVoucher` and `GradingVoucher` with `mapIncomingPassToVoucherProps` / `mapGradingPassToVoucherProps`; prefetches incoming and grading passes on link load
- `useGetGradingPassesOfSingleFarmer`: expects API shape `GetGradingGatePassesByFarmerData` (`.gradingGatePasses`) only; removed dual array/paginated handling
- Analytics overview: uses placeholder data (no API); removed loading/error/skeleton and `useGetOverview` dependency

## [0.10.9] - 2026-03-03

### Added
- Storage gate pass: new API shape with `bagSizes` (size, bagType, currentQuantity, initialQuantity, chamber, floor, row) instead of grading-gate-pass allocations; types `CreateStorageGatePassBagSize`, `StorageGatePassBagSize`, `StorageGatePassWithLink`, `StorageGatePassFarmerStorageLink`, `StorageGatePassLinkedByAdmin`
- Storage form: direct entry flow — farmer/variety/date selection, size quantities and bag types grid, optional extra rows, location-by-size, summary sheet; uses `CreateStorageGatePassInput.bagSizes` for create payload

### Changed
- Storage form: refactored into single form (TanStack Form + zod); removed separate step components (GradingFiltersBar, Step1BagsCard, Step2LocationCard, StorageAllocationTable, StorageFormHeader, StorageFormFooter, StorageFormStepIndicator); create payload sends `bagSizes` array
- Storage voucher (daybook): uses `StorageGatePassWithLink`; farmer from `voucher.farmerStorageLinkId` when not passed; order details replaced by `bagSizes`; removed "Grading refs" row; totals from `totalBagsFromBagSizes(bagSizes)`
- Daybook voucher types: `StorageBagSizeRow`, `totalBagsFromBagSizes` for bag-size-based storage; grading voucher cleanup
- `useCreateStorageGatePass` / `useGetStorageGatePasses`: aligned with new storage gate pass API (bagSizes, populated farmerStorageLinkId)
- Storage route and form types/utils: updates for bagSizes flow

## [0.10.8] - 2026-02-28

### Added
- Grading form step 1: farmer and variety filters (SearchSelector) before gate pass selection; gate pass list and Select all/Clear scoped to selected farmer + variety; initial selection from Daybook context (farmer/variety/ids) when opening with pre-selected IDs

### Changed
- Grading form: `farmerStorageLinkId`, `incomingGatePassId`, and `variety` props are optional; context resolved from first selected incoming pass when not provided; validation toast if submitting without at least one selected pass
- Grading page: always shows form (no "Open from Daybook" block); variety line in header only when variety is set

## [0.10.7] - 2026-02-28

### Added
- Daybook Grading tab: real data from `useGetGradingGatePasses` with pagination, search by gate pass number, and sort order; loading and empty states with "Add Grading Gate Pass" CTA
- Grading voucher: "Source Incoming" section showing incoming gate pass refs (gate pass no, manual no, bags); support for `incomingGatePassIds` prop and manual gate pass number in header
- Grading gate pass types: `GradingGatePassFarmerStorageLinkMinimal`, `GradingGatePassIncomingRef`, `GetGradingGatePassesParams`, `GradingGatePassPagination`, `GetGradingGatePassesData` for list API

### Changed
- Daybook: Grading tab uses `ContractTabPanel` with `GradingVoucher` and `mapGradingPassToVoucherProps`; sort-order-only (no sort-by field)
- `useGetGradingGatePasses`: accepts params (page, limit, sortOrder, gatePassNo); returns `{ list, pagination }`; query key and prefetch support params
- `useGetGradingPassesOfSingleFarmer`: handles both array and paginated object response shapes
- Grading gate pass type `GradingGatePass`: `farmerStorageLinkId` as minimal link, `incomingGatePassIds` array, `createdBy` (replaces `gradedById`); list API response includes pagination
- Storage form utils and Nikasi form: minor refinements

## [0.10.6] - 2026-02-28

### Added
- Daybook: `ContractTabPanel` component for reusable contract-type tabs (search, sort, pagination, refresh, empty/loading states)
- Incoming gate pass types: `IncomingGatePassWithLink` and populated link handling for daybook voucher mapping

### Changed
- Daybook: refactored to use `ContractTabPanel` for Incoming, Grading, Storage, Nikasi, Outgoing, and Rental tabs; incoming tab uses `useGetIncomingGatePasses` with `mapIncomingPassToVoucherProps` for populated or plain farmer-storage link
- Stock Ledger PDF: refactored to use shared `stockLedgerPdfTypes` and `stockLedgerPdfUtils`; component simplified
- Stock Ledger Excel: aligned with shared types and utils from PDF module; `stockLedgerExcel.ts` simplified
- Grading form: step 1 and form index refinements; Grading voucher PDF refactored for consistency
- People (farmer storage) detail page: minor updates
- Daybook and incoming gate pass types: updates for voucher and API response shapes

## [0.10.5] - 2026-02-23

### Added
- Theme: `--chart-6` CSS variable for chart palette (light and dark) to support additional series in temperature charts

### Changed
- Temperature monitoring: refactored main module layout and logic; TemperatureChart enhancements and integration

## [0.10.4] - 2026-02-23

### Added
- Edit farmer: `EditFarmerModal` for updating farmer and farmer-storage-link (name, address, mobile, account number, Aadhar, PAN, cost per bag) with duplicate validation
- Service hook `useEditFarmer` for `PUT /store-admin/farmer-storage-link/:id`; invalidates farmer-storage-links on success
- Types: `UpdateFarmerStorageLinkInput`, `UpdateFarmerStorageLinkApiResponse` in `src/types/farmer.ts`
- Temperature monitoring: `TemperatureChart.tsx` component for chart rendering (extracted from main module)

### Changed
- Temperature monitoring: refactored to use `TemperatureChart`; component and layout updates
- Add farmer modal: refinements and alignment with edit-farmer validation patterns
- People (farmer storage) detail page: integrated Edit Farmer action and modal

## [0.10.3] - 2026-02-22

### Added
- Temperature monitoring: bar charts for overview (all chambers) and per-chamber temperature over time using recharts
- Chart UI component (`chart.tsx`) with ChartContainer, ChartTooltip, and recharts integration
- Dependency: recharts 2.15.4

### Changed
- Voucher number type: `rental-incoming-order` renamed to `rental-storage-gate-pass` in useGetVoucherNumber and rental incoming form

## [0.10.2] - 2026-02-21

### Added
- Stock Ledger: shared types in `stockLedgerPdfTypes.ts` and computation helpers in `stockLedgerPdfUtils.ts` for PDF and Excel reuse

### Changed
- Stock Ledger PDF: refactored to use `stockLedgerPdfTypes` and `stockLedgerPdfUtils`; component simplified and uses store where needed
- Stock Ledger Excel: aligned with shared types and utils from PDF module
- Grading constants: expanded potato varieties list and buy-back cost configuration
- Rental incoming form: minor updates to create form and form base
- People (farmer storage) page: small refinements

## [0.10.1] - 2026-02-21

### Added
- Daybook: Rental tab with list of rental incoming gate passes, search, refresh, and "Add Rental Incoming" CTA
- Rental incoming voucher component (`RentalIncomingVoucher`) for daybook with entry details
- Service hook `useGetRentalIncomingGatePasses` for fetching rental incoming gate passes

### Changed
- Temperature monitoring: component and hooks (`useGetTemperatureReadings`, `useCreateTemperatureReading`); types in `src/types/temperature.ts`
- Rental incoming gate pass types and `useCreateRentalIncomingGatePass` hook updates
- Daybook: integration of rental tab and voucher exports in `vouchers/index.ts`

## [0.10.0] - 2026-02-21

### Added
- Rental incoming gate pass: form with validation and submission (`RentalIncomingFormBase`, `CreateRentalIncomingForm`, rental summary sheet)
- Rental incoming route and page at `/store-admin/rental`
- Service hook `useCreateRentalIncomingGatePass` and types in `src/types/rental-incoming-gate-pass.ts`
- Voucher number hook: support for rental incoming gate pass type in `useGetVoucherNumber`

### Changed
- Incoming form: updates and refinements
- Route tree: new rental routes under store-admin

## [0.9.9] - 2026-02-20

### Added
- Additional modules section: landing page at `/store-admin/additional` with module cards (Temperature Monitoring and placeholders)
- Temperature Monitoring: full CRUD UI — list readings (table with chamber, temperature, date), add reading (dialog with chamber, temperature, datetime), edit reading (inline dialog), search and refresh; hooks `useGetTemperatureReadings`, `useCreateTemperatureReading`, `useUpdateTemperatureReading`; types in `src/types/temperature.ts`
- App sidebar: "Additional" nav item linking to `/store-admin/additional`
- Routes: `store-admin/_authenticated/additional/index.tsx`, `additional/temperature-monitoring/index.tsx`; generated route tree updates

### Changed
- Incoming form, summary sheet, daybook incoming voucher, grading constants, and incoming gate pass types: updates and refinements

## [0.9.8] - 2026-02-17

### Added
- Stock Ledger export: dialog on farmer detail page to choose "View PDF" or "Download Excel"
- Stock Ledger Excel export: `downloadStockLedgerExcel` in `src/utils/stockLedgerExcel.ts` using xlsx; columns aligned with PDF (gate pass, dates, variety, weights, shortage, amount payable)
- Dependency: `xlsx` for Excel generation

### Changed
- Stock Ledger PDF: exported shared helpers (`SIZE_HEADER_LABELS`, `formatWeight`, `roundUpToMultipleOf10`, `computeWtReceivedAfterGrading`, `getTotalJuteAndLenoBags`, `computeLessBardanaAfterGrading`, `computeActualWtOfPotato`, `computeIncomingActualWeight`, `computeWeightShortage`, `computeWeightShortagePercent`, `getBuyBackRate`, `computeAmountPayable`, `sortRowsByGatePassNo`) for reuse by Excel export

## [0.9.7] - 2026-02-11

### Added
- Storage form: variety-based filtering (step 1), sort by voucher number (ascending default / descending), and group-by (farmer or date) using `Object.groupBy`; shared `storage-form-utils` with `groupPassesByFarmer`, `groupPassesByDate`, and display group helpers
- Storage form components: `GradingFiltersBar`, `Step1BagsCard`, `Step2LocationCard`, `StorageAllocationTable`, `StorageFormHeader`, `StorageFormFooter`, `StorageFormStepIndicator`; types and utils in `storage-form-types.ts` and `storage-form-utils.ts`
- Bulk storage gate pass: `useCreateBulkStorageGatePasses` for `POST /storage-gate-pass/bulk`

### Changed
- Storage form: main filter is variety only (date range removed); vouchers displayed then sort by voucher # then optional grouping (farmer-wise or date-wise)
- Nikasi form: same filtering, sorting, and grouping flow as storage — variety filter (default **All Varieties** to show all), sort by voucher (asc/desc), group by farmer or date; uses shared `storage-form-utils`; date range and “sort by date” removed; table uses unified display groups
- Nikasi variety filter: default option **All Varieties** so all varieties are shown until a specific variety is selected

## [0.9.6] - 2026-02-10

### Added
- Bulk nikasi gate pass: `useCreateBulkNikasiGatePasses` hook for `POST /nikasi-gate-pass/bulk`
- Types: `CreateBulkNikasiGatePassInput`, `CreateBulkNikasiGatePassApiResponse` for bulk create request/response

### Changed
- Nikasi form: support for multiple passes per submit — add/remove pass cards, each with its own From, To, Date, Remarks and grading allocation table; shared filters and column toggle; summary sheet lists all passes and shows voucher range (e.g. #2–#3); submit sends `passes` array with sequential gate pass numbers
- Nikasi voucher (daybook): "Detailed Breakdown" table with columns Type, Ref, Initial Quantity, Issued, Avail; removed Location column; removed Farmer Details and Grading Gate Passes from expanded (More) section; short mobile-friendly headings with tooltips; `table-fixed` and responsive padding to avoid horizontal scroll on small screens
- Daybook voucher types: `gradingGatePassIds` may be `string[]` (bulk API) or object array; nikasi voucher supports both

## [0.9.4] - 2026-02-08

### Changed
- Grading voucher: Weight % now uses total graded weight (sum of initial qty × weight per bag) as denominator so row percentages sum to 100%
- Grading voucher order details table: per-row Weight % = (initial qty × weight per bag) / total graded weight × 100; total row shows 100% and total graded weight in Wt/Bag column
- Grading voucher PDF: same percentage logic applied for consistency with voucher UI

## [0.9.3] - 2026-02-02

### Changed
- Daybook: voucher components (grading, incoming, nikasi, outgoing, storage) and types
- Daybook index and filter integration
- Nikasi and storage forms and routes
- Gate pass services: grading, incoming, nikasi, storage create hooks and daybook fetch
- Daybook types updates

## [0.9.2] - 2026-02-02

### Changed
- Daybook: improvements and fixes
- Incoming form: updates
- Search selector: refinements
- People listing and farmer detail page: updates

## [0.9.0] - 2026-01-31

### Added
- Progress UI component (shadcn, Radix) for progress bars
- Optional manual gate pass number field on Incoming, Grading, Nikasi, and Storage gate pass forms
- Incoming gate pass voucher: stage progress bar (Incoming → Grading → Storage → Nikasi → Outgoing) with labels and percentage
- Success toasts on form submission (incoming, storage) via sonner

### Changed
- Incoming, Grading, Nikasi, and Storage gate pass types: added optional `manualGatePassNumber`
- Summary sheets pass through manual gate pass number for all gate pass types
- Incoming gate pass voucher: layout and stage visibility improvements

## [0.8.0] - 2026-01-30

### Added
- Nikasi (outgoing) gate pass form with validation and submission
- Nikasi gate pass summary sheet for review before submit
- Nikasi gate pass route and page (`/store-admin/nikasi`)
- Service hooks: `useCreateNikasiGatePass`, `useGetNikasiGatePasses`
- Type definitions for nikasi gate pass data structures

### Changed
- Nikasi gate pass voucher: full implementation (replacing placeholder) with farmer, vehicle, variety, and grading details
- Incoming gate pass voucher: layout and content updates
- Grading form: minor adjustments

## [0.7.0] - 2026-01-29

### Added
- Grading gate pass form: bag type and weight per size entry in quantities grid
- Grading summary sheet: table-style size rows with Size, Bag Type, Qty, Wt (kg) columns

### Changed
- Grading gate pass form: responsive quantities layout (mobile cards, desktop table-like grid) with improved typography and spacing
- Grading gate pass form: allocation status set to `UNALLOCATED` on submit (was `PENDING`)
- Grading summary sheet: refactored meta row and size rows into `SummaryMetaRow` and `RowCells` components; updated styling (zinc palette, compact layout)

## [0.6.0] - 2026-01-29

### Added
- Empty UI component for empty states (Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyActions)
- Daybook voucher placeholder components: grading, nikasi (out), outgoing, and storage gate pass vouchers

### Changed
- Incoming gate pass voucher: layout and content updates
- Incoming gate pass form and summary sheet improvements
- Incoming gate pass types updates

## [0.5.0] - 2026-01-29

### Added
- Incoming gate pass listing in daybook with search, sort, voucher count, and refresh actions
- Incoming gate pass voucher card component showing farmer, vehicle, variety, and grading details
- Service hook `useGetIncomingGatePasses` and types for populated incoming gate pass responses

### Changed
- Updated daybook empty and loading states for incoming gate passes

## [0.4.0] - 2026-01-29

### Added
- Incoming gate pass form with comprehensive validation and submission
- Date picker component with calendar integration
- Search selector component for farmer selection with search functionality
- Calendar UI component (shadcn/ui)
- Command UI component (shadcn/ui) for searchable dropdowns
- Spinner UI component for loading states
- Summary sheet component for incoming gate pass review
- Voucher number service hook (`useGetVoucherNumber`)
- Incoming gate pass creation service (`useCreateIncomingGatePass`)
- Incoming gate pass route and page
- Type definitions for incoming gate pass data structures

### Changed
- Enhanced daybook component with improved functionality
- Updated app sidebar with incoming gate pass navigation
- Improved dialog component with better accessibility
- Updated sheet component styling
- Enhanced add farmer modal with better integration

### Technical Details
- Added `date-fns` for date manipulation
- Added `react-day-picker` for calendar functionality
- Added `cmdk` for command palette/search functionality

## [0.1.0] - 2026-01-27

### Added
- Initial project setup with React 19, TypeScript, and Vite
- TanStack Router integration for routing
- Tailwind CSS v4 for styling
- ESLint and Prettier configuration for code quality
- Husky pre-commit hooks with lint-staged
- Basic home page with welcome message
- TypeScript configuration for React and Node.js
- Development and build scripts

### Technical Details
- React 19.2.0
- TypeScript 5.9.3
- Vite with Rolldown (rolldown-vite@7.2.5)
- TanStack Router 1.157.16
- Tailwind CSS 4.1.18
- React Compiler enabled
