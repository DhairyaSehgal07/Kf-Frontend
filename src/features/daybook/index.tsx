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
import DaybookIncomingTab from "./components/incoming-tab"

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
        <TabsList className="h-11 w-full">

          <TabsTrigger value="incoming">
            <Sprout className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Incoming</span>
          </TabsTrigger>

          <TabsTrigger value="grading">
            <Inbox className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Grading</span>
          </TabsTrigger>

          <TabsTrigger value="storage">
            <Scale className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Storage</span>
          </TabsTrigger>

          <TabsTrigger value="dispatch-pre-storage">
            <PackageCheck className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Dispatch (pre-storage)</span>
          </TabsTrigger>

          <TabsTrigger value="dispatch-post-storage">
            <ArrowLeftRight className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Dispatch (post-storage)</span>
          </TabsTrigger>

        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="incoming" className="min-w-0">
         <DaybookIncomingTab/>
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