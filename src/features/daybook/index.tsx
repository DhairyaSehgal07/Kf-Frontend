import { getRouteApi } from "@tanstack/react-router"
import {
  Sprout,
  Inbox,
  Scale,
  PackageCheck,
  ArrowLeftRight
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import type { DaybookTab } from "./search"

const daybookRouteApi = getRouteApi("/_authenticated/daybook")

const DaybookPage = () => {
  const { tab } = daybookRouteApi.useSearch()
  const navigate = daybookRouteApi.useNavigate()

  const handleTabChange = (value: string) => {
    navigate({
      search: { tab: value as DaybookTab },
    })
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">

        {/* Tab Triggers */}
        <TabsList className="h-11 w-full flex sm:justify-start justify-center gap-2 sm:gap-0">

          <TabsTrigger value="incoming" className="sm:flex-none flex-1 sm:h-11 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
            <span className="sm:hidden flex items-center justify-center">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="hidden sm:block">Incoming</span>
          </TabsTrigger>

          <TabsTrigger value="grading" className="sm:flex-none flex-1 sm:h-11 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
            <span className="sm:hidden flex items-center justify-center">
              <Inbox className="h-5 w-5" />
            </span>
            <span className="hidden sm:block">Grading</span>
          </TabsTrigger>

          <TabsTrigger value="storage" className="sm:flex-none flex-1 sm:h-11 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
            <span className="sm:hidden flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </span>
            <span className="hidden sm:block">Storage</span>
          </TabsTrigger>

          <TabsTrigger value="dispatch-pre-storage" className="sm:flex-none flex-1 sm:h-11 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
            <span className="sm:hidden flex items-center justify-center">
              <PackageCheck className="h-5 w-5" />
            </span>
            <span className="hidden sm:block">Dispatch (pre-storage)</span>
          </TabsTrigger>

          <TabsTrigger value="dispatch-post-storage" className="sm:flex-none flex-1 sm:h-11 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
            <span className="sm:hidden flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5" />
            </span>
            <span className="hidden sm:block">Dispatch (post-storage)</span>
          </TabsTrigger>

        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="incoming" className="min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold text-foreground">
                Incoming tab
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Show Incoming tab content
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grading" className="min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold text-foreground">
                Grading tab
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Show Grading tab content
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold text-foreground">
                Storage tab
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Show Storage tab content
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispatch-pre-storage" className="min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold text-foreground">
                Dispatch pre storage tab
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Show Dispatch pre storage tab content
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispatch-post-storage" className="min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold text-foreground">
                Dispatch post storage tab
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Show Dispatch post storage tab content
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </main>
  )
}

export default DaybookPage