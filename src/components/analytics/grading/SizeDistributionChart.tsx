import { memo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
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
import { useGetGradingSizeWiseDistribution } from '@/services/store-admin/grading-gate-pass/useGetGradingSizeWiseDistribution';

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];

type DateParams = { dateFrom: string; dateTo: string } | Record<string, never>;

interface SizeDistributionChartProps {
  dateParams: DateParams;
}

const SizeDistributionChart = memo(function SizeDistributionChart({
  dateParams,
}: SizeDistributionChartProps) {
  const { data, isLoading, isError } =
    useGetGradingSizeWiseDistribution(dateParams);
  const varieties = data?.data ?? [];

  if (isLoading) {
    return (
      <Card className="font-custom">
        <CardHeader>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Size-wise distribution
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Bags by size per variety
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/20 flex aspect-square max-h-[280px] items-center justify-center rounded-lg border border-dashed border-gray-200">
            <span className="font-custom text-sm text-[#6f6f6f]">Loading…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || varieties.length === 0) {
    return (
      <Card className="font-custom">
        <CardHeader>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Size-wise distribution
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Bags by size per variety
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/20 flex aspect-square max-h-[280px] items-center justify-center rounded-lg border border-dashed border-gray-200">
            <span className="font-custom text-sm text-[#6f6f6f]">
              No size distribution data for this range. Apply a date range or
              ensure data exists.
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
          Size-wise distribution
        </CardTitle>
        <CardDescription className="text-sm text-[#6f6f6f]">
          Bags by size per variety
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={varieties[0]?.variety ?? 'default'}
          className="w-full"
        >
          <TabsList className="font-custom mb-4 flex flex-wrap">
            {varieties.map((v) => (
              <TabsTrigger key={v.variety} value={v.variety}>
                {v.variety}
              </TabsTrigger>
            ))}
          </TabsList>
          {varieties.map((varietyItem) => {
            const pieData = varietyItem.sizes.map((s) => ({
              name: s.size,
              value: s.count,
            }));
            const config: ChartConfig = varietyItem.sizes.reduce(
              (acc, s, i) => ({
                ...acc,
                [s.size]: {
                  label: s.size,
                  color: CHART_COLORS[i % CHART_COLORS.length],
                },
              }),
              { value: { label: 'Bags' } }
            );

            if (pieData.length === 0) {
              return (
                <TabsContent
                  key={varietyItem.variety}
                  value={varietyItem.variety}
                  className="mt-0"
                >
                  <div className="bg-secondary/20 flex h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-200">
                    <span className="font-custom text-sm text-[#6f6f6f]">
                      No size data for {varietyItem.variety}
                    </span>
                  </div>
                </TabsContent>
              );
            }

            return (
              <TabsContent
                key={varietyItem.variety}
                value={varietyItem.variety}
                className="mt-0"
              >
                <ChartContainer
                  config={config}
                  className="mx-auto aspect-square max-h-[260px] w-full"
                >
                  <PieChart>
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
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius="80%"
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
});

export default SizeDistributionChart;
