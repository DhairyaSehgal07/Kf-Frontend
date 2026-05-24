import { useMemo, useState, type MouseEvent } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  History,
  Loader2,
  RefreshCw,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { IncomingGatePassAudit } from "@/features/incoming/api/types"
import { useIncomingGatePassEdits } from "@/features/incoming/api/use-incoming-gate-pass-edits"
import {
  formatAuditFieldValue,
  getIncomingGatePassAuditChangedFields,
  INCOMING_GATE_PASS_AUDIT_FIELD_LABELS,
} from "@/features/incoming/utils/format-audit-field-value"
import { cn } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0]

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

function formatAuditTimestamp(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function IncomingEditHistorySkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Skeleton className="h-10 w-10 rounded-lg" />
        </ItemMedia>
        <ItemContent>
          <Skeleton className="h-5 w-48" />
        </ItemContent>
        <ItemActions>
          <Skeleton className="h-9 w-24 rounded-md" />
        </ItemActions>
      </Item>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function AuditChangeTable({ audit }: { audit: IncomingGatePassAudit }) {
  const changedFields = getIncomingGatePassAuditChangedFields(
    audit.previousState,
    audit.modifiedState,
  )

  if (changedFields.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        No field changes recorded.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] caption-bottom text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="h-10 px-3 text-left font-medium text-muted-foreground">
              Field
            </th>
            <th className="h-10 px-3 text-left font-medium text-muted-foreground">
              Before
            </th>
            <th className="h-10 px-3 text-left font-medium text-muted-foreground">
              After
            </th>
          </tr>
        </thead>
        <tbody>
          {changedFields.map((field) => (
            <tr
              key={field}
              className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
            >
              <td className="px-3 py-2.5 font-medium text-foreground">
                {INCOMING_GATE_PASS_AUDIT_FIELD_LABELS[field]}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {formatAuditFieldValue(field, audit.previousState[field])}
              </td>
              <td className="px-3 py-2.5 text-foreground">
                {formatAuditFieldValue(field, audit.modifiedState[field])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function IncomingEditAuditCard({ audit }: { audit: IncomingGatePassAudit }) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/10 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0 space-y-1">
          <p className="font-heading text-base font-semibold text-foreground">
            Gate pass edit
          </p>
          <p className="text-sm text-muted-foreground">
            {formatAuditTimestamp(audit.createdAt)}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 shrink-0 self-start"
        >
          <Link
            to="/incoming/$id"
            params={{ id: audit.incomingGatePassId }}
          >
            View gate pass
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 border-b border-border/60 px-4 py-4 sm:grid-cols-2 sm:px-5">
        <div className="flex items-start gap-2 text-sm">
          <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {audit.editedById.name}
            </p>
            {audit.editedById.mobileNumber ? (
              <p className="text-muted-foreground tabular-nums">
                {audit.editedById.mobileNumber}
              </p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 text-sm">
          <p className="font-medium text-foreground">Reason</p>
          <p className="text-muted-foreground">{audit.reason || "—"}</p>
        </div>
      </div>

      <AuditChangeTable audit={audit} />
    </article>
  )
}

const IncomingEditHistoryPage = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE)

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
    }),
    [page, pageSize],
  )

  const { data, isLoading, isError, error, isFetching, refetch } =
    useIncomingGatePassEdits(queryParams)

  const audits = data?.audits ?? []
  const pagination = data?.pagination
  const totalCount = pagination?.total ?? 0
  const currentPage = pagination?.page ?? page
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1)
  const isOnFirstPage = currentPage <= 1
  const isOnLastPage = currentPage >= totalPages

  const handlePrevPage = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (isOnFirstPage || isFetching) return
    setPage((previous) => Math.max(previous - 1, 1))
  }

  const handleNextPage = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (isOnLastPage || isFetching) return
    setPage((previous) => previous + 1)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value) as PageSize)
    setPage(1)
  }

  if (isLoading) {
    return <IncomingEditHistorySkeleton />
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 h-9 px-2 text-muted-foreground"
          >
            <Link to="/daybook" search={{ tab: "incoming" }}>
              <ArrowLeft className="mr-1.5 size-4" />
              Back to daybook
            </Link>
          </Button>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Incoming edit history
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit trail of incoming gate pass changes in your cold storage.
          </p>
        </div>
      </div>

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>
            {totalCount.toLocaleString("en-IN")} edit
            {totalCount === 1 ? "" : "s"}
          </ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </ItemActions>
      </Item>

      {isError ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History />
            </EmptyMedia>
            <EmptyTitle>Could not load edit history</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching edit history."}
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Try again
          </Button>
        </Empty>
      ) : audits.length > 0 ? (
        <div className="space-y-4">
          {audits.map((audit) => (
            <IncomingEditAuditCard key={audit._id} audit={audit} />
          ))}
        </div>
      ) : (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History />
            </EmptyMedia>
            <EmptyTitle>No edits recorded yet</EmptyTitle>
            <EmptyDescription>
              Changes to incoming gate passes will appear here after they are
              saved.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <Item
        variant="outline"
        size="sm"
        className="rounded-xl px-4 py-3 sm:px-5 sm:py-4"
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
              disabled={isFetching}
            >
              <SelectTrigger
                className="h-9 w-18 tabular-nums"
                aria-label="Items per page"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>items per page</span>
          </div>

          <Pagination className="mx-0 w-full sm:w-auto sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrevPage}
                  aria-disabled={isOnFirstPage || isFetching}
                  className={cn(
                    isOnFirstPage || isFetching
                      ? "pointer-events-none opacity-50"
                      : "",
                  )}
                />
              </PaginationItem>

              <PaginationItem>
                <span className="text-sm font-medium tabular-nums">
                  {currentPage} / {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNextPage}
                  aria-disabled={isOnLastPage || isFetching}
                  className={cn(
                    isOnLastPage || isFetching
                      ? "pointer-events-none opacity-50"
                      : "",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Item>
    </div>
  )
}

export default IncomingEditHistoryPage
