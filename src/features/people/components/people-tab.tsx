import {
  Plus,
  RefreshCw,
  Search,
  Users,
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const PeopleTab = () => {
  const peopleCount = 0

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>{peopleCount} people</ItemTitle>
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

          <Input placeholder="Search by name" className="w-full pl-10" />
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
              <span className="hidden sm:inline">People Edit History</span>
            </Button>

            <Button className="min-w-0 px-2.5 sm:px-3">
              <Plus className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add Farmer</span>
            </Button>
          </div>
        </div>
      </div>

      <Empty className="rounded-xl border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>

          <EmptyTitle>People list coming soon</EmptyTitle>

          <EmptyDescription>
            People records will appear here once this tab is connected to the
            API.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

export default PeopleTab
