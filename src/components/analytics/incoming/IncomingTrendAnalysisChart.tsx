import { memo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetIncomingTrendAnalysis } from '@/services/store-admin/analytics/incoming/useGetIncomingTrendAnalysis';

const TREND_CHART_CONFIG = {
  date: { label: 'Date' },
  month: { label: 'Month' },
  bags: { label: 'Bags', color: 'var(--chart-1)' },
} satisfies ChartConfig;

type DateParams = { dateFrom: string; dateTo: string } | Record<string, never>;

interface IncomingTrendAnalysisChartProps {
  dateParams: DateParams;
}

const IncomingTrendAnalysisChart = memo(function IncomingTrendAnalysisChart({
  dateParams,
}: IncomingTrendAnalysisChartProps) {
  const { data, isLoading, isError } = useGetIncomingTrendAnalysis(dateParams);
  const daily = data?.daily ?? [];
  const monthly = data?.monthly ?? [];

  if (isLoading) {
    return (
      <Card className="font-custom">
        <CardHeader>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Incoming trend
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Daily and monthly bags over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/20 flex h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-200">
            <span className="font-custom text-sm text-[#6f6f6f]">Loading…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="font-custom">
        <CardHeader>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Incoming trend
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Daily and monthly bags over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/5 flex h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-200">
            <span className="font-custom text-destructive text-sm">
              Failed to load trend data.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDaily = daily.length > 0;
  const hasMonthly = monthly.length > 0;
  const hasAny = hasDaily || hasMonthly;

  if (!hasAny) {
    return (
      <Card className="font-custom">
        <CardHeader>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Incoming trend
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Daily and monthly bags over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/20 flex h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-200">
            <span className="font-custom text-sm text-[#6f6f6f]">
              No trend data for this range. Apply a date range or ensure data
              exists.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="font-custom">
      <CardHeader>
        <CardTitle className="text-base font-semibold sm:text-lg">
          Incoming trend
        </CardTitle>
        <CardDescription className="text-sm text-[#6f6f6f]">
          Daily and monthly bags over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={hasDaily ? 'daily' : 'monthly'} className="w-full">
          <TabsList className="font-custom mb-4">
            <TabsTrigger value="daily" disabled={!hasDaily}>
              Daily
            </TabsTrigger>
            <TabsTrigger value="monthly" disabled={!hasMonthly}>
              Monthly
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-0 space-y-4">
            <ChartContainer
              config={TREND_CHART_CONFIG}
              className="h-[220px] w-full"
            >
              <LineChart
                data={daily}
                margin={{ left: 12, right: 12 }}
                accessibilityLayer
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [
                        typeof value === 'number'
                          ? value.toLocaleString()
                          : value,
                        'Bags',
                      ]}
                      labelFormatter={(v) =>
                        new Date(v).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      }
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="bags"
                  stroke="var(--color-bags)"
                  strokeWidth={2}
                  dot={false}
                  name="Bags"
                />
              </LineChart>
            </ChartContainer>
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-custom font-medium">
                      Date
                    </TableHead>
                    <TableHead className="font-custom text-right font-medium">
                      Bags
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {daily.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-custom text-sm">
                        {new Date(row.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="font-custom text-right font-medium tabular-nums">
                        {row.bags.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="monthly" className="mt-0 space-y-4">
            <ChartContainer
              config={TREND_CHART_CONFIG}
              className="h-[220px] w-full"
            >
              <LineChart
                data={monthly}
                margin={{ left: 12, right: 12 }}
                accessibilityLayer
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [
                        typeof value === 'number'
                          ? value.toLocaleString()
                          : value,
                        'Bags',
                      ]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="bags"
                  stroke="var(--color-bags)"
                  strokeWidth={2}
                  dot={false}
                  name="Bags"
                />
              </LineChart>
            </ChartContainer>
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-custom font-medium">
                      Month
                    </TableHead>
                    <TableHead className="font-custom text-right font-medium">
                      Bags
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthly.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="font-custom text-sm">
                        {row.month}
                      </TableCell>
                      <TableCell className="font-custom text-right font-medium tabular-nums">
                        {row.bags.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

export default IncomingTrendAnalysisChart;
