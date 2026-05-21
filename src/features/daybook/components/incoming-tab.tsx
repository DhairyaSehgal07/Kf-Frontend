import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowUpFromLine,
  NotebookText,
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
import {
  GatePassCard,
  type GatePassData,
} from "@/components/incoming-gate-pass-card"

const MOCK_INCOMING_GATE_PASSES: GatePassData[] = [
  {
    gatePassNo: 1042,
    manualGatePassNumber: 88,
    date: "2026-05-18T09:30:00.000Z",
    variety: "Potato",
    category: "A",
    location: "Karnal Cold Store",
    truckNumber: "HR-26-DK-4521",
    bagsReceived: 120,
    status: "Pending",
    stage: "Incoming",
    remarks: "Bags in good condition. Farmer requested early grading.",
    farmerStorageLinkId: {
      accountNumber: 12045,
      farmerId: {
        name: "Rajesh Sehgal",
        address: "Village Kheri, Karnal, Haryana 132001",
        mobileNumber: "9876543210",
      },
    },
    createdBy: { name: "Amit Sharma" },
    weightSlip: {
      slipNumber: "WS-2026-1842",
      grossWeightKg: 12450,
      tareWeightKg: 3450,
    },
  },
  {
    gatePassNo: 1041,
    date: "2026-05-17T14:15:00.000Z",
    variety: "Potato",
    category: "B",
    location: "Ludhiana Yard",
    truckNumber: "PB-03-AB-7789",
    bagsReceived: 95,
    status: "Completed",
    stage: "Grading",
    remarks: "Standard delivery.",
    farmerStorageLinkId: {
      accountNumber: 9821,
      farmerId: {
        name: "Gurpreet Singh",
        address: "Near Grain Market, Ludhiana, Punjab 141001",
        mobileNumber: "9123456780",
      },
    },
    createdBy: { name: "Priya Verma" },
    weightSlip: {
      slipNumber: "WS-2026-1841",
      grossWeightKg: 9850,
      tareWeightKg: 2920,
    },
  },
]

const DaybookIncomingTab = () => {
  const navigate = useNavigate()
  const [incomingGatePasses] = useState<GatePassData[]>(MOCK_INCOMING_GATE_PASSES)

  // Temporary placeholder states/values
  const canReadIncomingGatePass = true
  const emptyTitle = "No incoming gate passes found"
  const emptyDescription = "There are no incoming gate passes available."

  const itemsPerPage = 10
  const currentPage = 1
  const totalPages = 1

  const isOnFirstPage = true
  const isOnLastPage = true
  const isSearching = false

  const handlePrevPage = () => {}
  const handleNextPage = () => {}

  const handleAddIncoming = () => {
    navigate({ to: "/incoming" })
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header */}
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <NotebookText className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>
            {incomingGatePasses.length} incoming gate passes
          </ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </ItemActions>
      </Item>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Enter Gate Pass Number"
            className="w-full pl-10"
          />
        </div>

        {/* Controls — 2×2 grid on mobile, horizontal row on desktop */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
            <Select>
              <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:shrink-0">
            <Button variant="secondary" className="min-w-0 px-2.5 sm:px-3">
              <span className="truncate sm:hidden">Edit History</span>
              <span className="hidden sm:inline">Incoming Edit History</span>
            </Button>

            <Button
              className="min-w-0 px-2.5 sm:px-3"
              onClick={handleAddIncoming}
            >
              <ArrowUpFromLine className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add Incoming</span>
            </Button>
          </div>
        </div>
      </div>

      {/* List / Empty State */}
      {incomingGatePasses.length > 0 ? (
        <div className="space-y-6">
          {incomingGatePasses.map((gatePass) => (
            <GatePassCard
              key={gatePass.gatePassNo}
              data={gatePass}
            />
          ))}
        </div>
      ) : (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NotebookText />
            </EmptyMedia>

            <EmptyTitle>
              {canReadIncomingGatePass
                ? emptyTitle
                : "Access restricted for incoming gate passes"}
            </EmptyTitle>

            <EmptyDescription>
              {canReadIncomingGatePass
                ? emptyDescription
                : "You do not have read permission for incoming gate passes."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Pagination */}
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

export default DaybookIncomingTab