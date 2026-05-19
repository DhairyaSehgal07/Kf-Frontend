import {
  ArrowUpFromLine,
  Inbox,
  RefreshCw,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const DaybookGradingTab = () => {
  const gatePassCount = 0

  const itemsPerPage = 10
  const currentPage = 1
  const totalPages = 1

  const isOnFirstPage = true
  const isOnLastPage = true
  const isSearching = false

  const handlePrevPage = () => {}
  const handleNextPage = () => {}

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Inbox className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>{gatePassCount} grading gate passes</ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Enter Gate Pass Number"
            className="w-full pl-10"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div>
            <Select>
              <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:shrink-0">
            <Button variant="secondary" className="min-w-0 px-2.5 sm:px-3">
              <span className="truncate sm:hidden">Edit History</span>
              <span className="hidden sm:inline">Grading Edit History</span>
            </Button>

            <Button className="min-w-0 px-2.5 sm:px-3">
              <ArrowUpFromLine className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add Grading</span>
            </Button>
          </div>
        </div>
      </div>

      <Empty className="rounded-xl border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>

          <EmptyTitle>Grading list coming soon</EmptyTitle>

          <EmptyDescription>
            Gate pass cards and grading details will appear here once this tab
            is connected to the API.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <Item
        variant="outline"
        size="sm"
        className="rounded-xl px-4 py-3 sm:px-5 sm:py-4"
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {itemsPerPage} items per page
          </div>

          <Pagination className="mx-0 w-full sm:w-auto sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrevPage}
                  aria-disabled={isOnFirstPage || isSearching}
                  className={
                    isOnFirstPage || isSearching
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>

              <PaginationItem>
                <span className="text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNextPage}
                  aria-disabled={isOnLastPage || isSearching}
                  className={
                    isOnLastPage || isSearching
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Item>
    </div>
  )
}

export default DaybookGradingTab
