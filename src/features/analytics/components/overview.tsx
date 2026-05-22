import {
  ArrowDownRight,
  ArrowUpRight,
  Inbox,
  Minus,
  Boxes,
  Package,
  Scale,
  Sprout,
  Truck,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type TrendDirection = "up" | "down" | "neutral"

type SummaryMetric = {
  label: string
  value: string
  description: string
  icon: LucideIcon
  trend: {
    label: string
    direction: TrendDirection
  }
}

// Placeholder values until analytics API is connected
const SUMMARY_METRICS: SummaryMetric[] = [
  {
    label: "Gate passes",
    value: "0",
    description: "Incoming entries in selected range",
    icon: Sprout,
    trend: { label: "No prior period", direction: "neutral" },
  },
  {
    label: "Net weight",
    value: "0 kg",
    description: "Total net product weight",
    icon: Scale,
    trend: { label: "No prior period", direction: "neutral" },
  },
  {
    label: "Graded lots",
    value: "0",
    description: "Lots through grading",
    icon: Inbox,
    trend: { label: "No prior period", direction: "neutral" },
  },
  {
    label: "In storage",
    value: "0",
    description: "Lots currently stored",
    icon: Package,
    trend: { label: "No prior period", direction: "neutral" },
  },
  {
    label: "Dispatched",
    value: "0",
    description: "Pre & post storage dispatch",
    icon: Truck,
    trend: { label: "No prior period", direction: "neutral" },
  },
  {
    label: "Bags received",
    value: "0",
    description: "Total bags across gate passes",
    icon: Boxes,
    trend: { label: "No prior period", direction: "neutral" },
  },
]

const trendIcon: Record<TrendDirection, LucideIcon> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
}

const trendBadgeClass: Record<TrendDirection, string> = {
  up: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  down: "border-destructive/30 bg-destructive/10 text-destructive",
  neutral: "bg-muted/50 text-muted-foreground",
}

function SummaryCard({ metric }: { metric: SummaryMetric }) {
  const Icon = metric.icon
  const TrendIcon = trendIcon[metric.trend.direction]

  return (
    <Card size="sm" className={cn("card-hover gap-0")}>
      <CardHeader className="pb-2">
        <CardDescription className="transition-colors duration-200 group-hover/card:text-foreground/80">
          {metric.label}
        </CardDescription>
        <CardAction>
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-xl bg-primary/10",
              "transition-colors duration-200 group-hover/card:bg-primary/15"
            )}
          >
            <Icon
              className="size-4 text-primary transition-transform duration-200 group-hover/card:scale-105"
              aria-hidden
            />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {metric.value}
        </p>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {metric.description}
        </p>

        <Badge
          variant="outline"
          className={cn("w-fit gap-1 font-normal", trendBadgeClass[metric.trend.direction])}
        >
          <TrendIcon className="size-3 shrink-0" aria-hidden />
          {metric.trend.label}
        </Badge>
      </CardContent>
    </Card>
  )
}

const Overview = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {SUMMARY_METRICS.map((metric) => (
        <SummaryCard key={metric.label} metric={metric} />
      ))}
    </div>
  )
}

export default Overview
