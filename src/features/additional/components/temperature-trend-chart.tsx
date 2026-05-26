import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type TemperatureChartPoint = {
  label: string
  values: Record<string, number>
}

type TemperatureTrendChartProps = {
  chamberIds: readonly string[]
  data: TemperatureChartPoint[]
}

const CHAMBER_LINE_CLASSES = [
  'text-primary',
  'text-foreground',
  'text-muted-foreground',
  'text-destructive',
  'text-primary/70',
  'text-foreground/60',
]

function getSeriesPath(
  values: Array<number | undefined>,
  min: number,
  max: number,
) {
  const spread = max - min || 1
  const step = values.length > 1 ? 100 / (values.length - 1) : 100

  return values
    .map((value, index) => {
      if (value == null) return null

      const x = index * step
      const y = 90 - ((value - min) / spread) * 70
      return `${x},${y}`
    })
    .filter(Boolean)
    .join(' ')
}

export function TemperatureTrendChart({
  chamberIds,
  data,
}: TemperatureTrendChartProps) {
  const allValues = data.flatMap((point) =>
    chamberIds
      .map((chamberId) => point.values[chamberId])
      .filter((value): value is number => value != null),
  )

  const min = Math.min(...allValues, 30)
  const max = Math.max(...allValues, 50)

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Temperature trend
            </CardTitle>
            <CardDescription>
              Recent chamber movement across the filtered records.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {chamberIds.map((chamberId, index) => (
              <span
                key={chamberId}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className={cn(
                    'size-2 rounded-full bg-current',
                    CHAMBER_LINE_CLASSES[index % CHAMBER_LINE_CLASSES.length],
                  )}
                  aria-hidden="true"
                />
                Ch {chamberId}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            No trend data to display.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative h-56 overflow-hidden rounded-xl border border-border bg-muted/20 p-4">
              <div className="absolute inset-x-4 top-8 border-t border-border/70" />
              <div className="absolute inset-x-4 top-1/2 border-t border-border/70" />
              <div className="absolute inset-x-4 bottom-8 border-t border-border/70" />

              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="relative h-full w-full"
                role="img"
                aria-label="Temperature line chart"
              >
                {chamberIds.map((chamberId, index) => (
                  <polyline
                    key={chamberId}
                    points={getSeriesPath(
                      data.map((point) => point.values[chamberId]),
                      min,
                      max,
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    className={cn(
                      'opacity-90',
                      CHAMBER_LINE_CLASSES[
                        index % CHAMBER_LINE_CLASSES.length
                      ],
                    )}
                  />
                ))}
              </svg>
            </div>

            <div className="flex justify-between gap-3 text-xs text-muted-foreground">
              <span>{data[0]?.label}</span>
              <span className="tabular-nums">
                Range {min.toFixed(1)}°F - {max.toFixed(1)}°F
              </span>
              <span>{data[data.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
