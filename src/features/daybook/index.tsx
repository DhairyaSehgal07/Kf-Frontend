import { getRouteApi } from "@tanstack/react-router"

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

import { DAYBOOK_TABS, type DaybookTab } from "./search"

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
        <TabsList className="h-11 w-full">
          {DAYBOOK_TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYBOOK_TABS.map((item) => (
          <TabsContent key={item.value} value={item.value} className="min-w-0">
            <Card>
              <CardHeader>
                <CardTitle className="font-semibold text-foreground">
                  {item.heading}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Show {item.heading} content
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  )
}

export default DaybookPage
