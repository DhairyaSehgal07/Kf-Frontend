import { memo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useGetIncomingVarietyBreakdown } from '@/services/store-admin/analytics/incoming/useGetIncomingVarietyBreakdown';
import type { VarietyDistributionChartItem } from '@/types/analytics';

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];

function buildChartConfig(items: VarietyDistributionChartItem[]): ChartConfig {
  return items.reduce<ChartConfig>(
    (acc, item, i) => ({
      ...acc,
      [item.name]: {
        label: item.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
      },
    }),
    { value: { label: 'Bags' } }
  );
}

type DateParams = { dateFrom: string; dateTo: string } | Record<string, never>;

interface VarietyDistributionChartProps {
  dateParams: DateParams;
}

const VarietyDistributionChart = memo(function VarietyDistributionChart({
  dateParams,
}: VarietyDistributionChartProps) {
  const { data, isLoading, isError } =
    useGetIncomingVarietyBreakdown(dateParams);
  const items = data ?? [];

  if (isLoading) {
    return (
      <Card className="font-custom">
        <CardHeader>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Variety distribution
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Bags by variety in the selected range
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

  if (isError || items.length === 0) {
    return (
      <Card className="font-custom">
        <CardHeader>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Variety distribution
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Bags by variety in the selected range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/20 flex aspect-square max-h-[280px] items-center justify-center rounded-lg border border-dashed border-gray-200">
            <span className="font-custom text-sm text-[#6f6f6f]">
              No variety data for this range. Apply a date range or ensure data
              exists.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = buildChartConfig(items);

  return (
    <Card className="font-custom">
      <CardHeader>
        <CardTitle className="text-base font-semibold sm:text-lg">
          Variety distribution
        </CardTitle>
        <CardDescription className="text-sm text-[#6f6f6f]">
          Bags by variety in the selected range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[280px] w-full"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    'Bags',
                  ]}
                />
              }
            />
            <Pie
              data={items}
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
              {items.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.color ?? CHART_COLORS[index % CHART_COLORS.length]
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});

export default VarietyDistributionChart;
