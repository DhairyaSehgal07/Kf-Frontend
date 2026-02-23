import { memo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const UNIT = '°F';

export type TemperatureChartDataPoint = {
  date: string;
  ch1: number | null;
  ch2: number | null;
  ch3: number | null;
  ch4: number | null;
};

const TEMPERATURE_CHART_CONFIG = {
  date: { label: 'Date' },
  ch1: { label: 'Chamber 1', color: 'var(--chart-1)' },
  ch2: { label: 'Chamber 2', color: 'var(--chart-2)' },
  ch3: { label: 'Chamber 3', color: 'var(--chart-3)' },
  ch4: { label: 'Chamber 4', color: 'var(--chart-4)' },
} satisfies ChartConfig;

interface TemperatureChartProps {
  data: TemperatureChartDataPoint[];
}

const TemperatureChart = memo(function TemperatureChart({
  data,
}: TemperatureChartProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="border-border rounded-xl shadow-sm">
      <CardHeader className="border-border border-b px-6 py-4">
        <CardTitle className="font-custom text-lg font-semibold">
          Temperature trend
        </CardTitle>
        <CardDescription className="font-custom text-sm">
          Last 30 readings by chamber ({UNIT})
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 sm:pt-6">
        <ChartContainer
          config={TEMPERATURE_CHART_CONFIG}
          className="font-custom aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const d = new Date(value);
                return d.toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              unit={UNIT}
              domain={['auto', 'auto']}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  formatter={(value) =>
                    value != null ? [`${value}${UNIT}`, ''] : ['–', '']
                  }
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  }
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="dataKey" />}
              verticalAlign="bottom"
            />
            <Line
              dataKey="ch1"
              type="monotone"
              stroke="var(--color-ch1)"
              strokeWidth={2}
              dot={false}
              connectNulls
              name="Chamber 1"
            />
            <Line
              dataKey="ch2"
              type="monotone"
              stroke="var(--color-ch2)"
              strokeWidth={2}
              dot={false}
              connectNulls
              name="Chamber 2"
            />
            <Line
              dataKey="ch3"
              type="monotone"
              stroke="var(--color-ch3)"
              strokeWidth={2}
              dot={false}
              connectNulls
              name="Chamber 3"
            />
            <Line
              dataKey="ch4"
              type="monotone"
              stroke="var(--color-ch4)"
              strokeWidth={2}
              dot={false}
              connectNulls
              name="Chamber 4"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});

export default TemperatureChart;
