import { memo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  Package,
  Boxes,
  ClipboardList,
  Warehouse,
  Truck,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsOverviewData } from '@/types/analytics';

/** Placeholder data for UI-only display (no data fetching) */
const PLACEHOLDER_DATA: AnalyticsOverviewData = {
  totalIncomingBags: 0,
  totalIncomingWeight: 0,
  totalUngradedBags: 0,
  totalUngradedWeight: 0,
  totalGradingBags: { initialQuantity: 0, currentQuantity: 0 },
  totalGradingWeight: 0,
  totalBagsStored: 0,
  totalBagsDispatched: 0,
  totalOutgoingBags: 0,
};

/** Format number with locale (e.g. 37144 → "37,144") */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

/** Format weight in kg with locale */
function formatWeight(kg: number): string {
  return `${formatNumber(Math.round(kg * 10) / 10)} kg`;
}

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  iconBgClass?: string;
}

const StatCard = memo(function StatCard({
  title,
  value,
  description,
  icon,
  iconBgClass = 'bg-primary/10 text-primary',
}: StatCardProps) {
  return (
    <Card className="font-custom transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-[#333] sm:text-lg">
          {title}
        </CardTitle>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            iconBgClass
          )}
        >
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        <p className="font-custom text-2xl font-bold tracking-tight text-[#333] sm:text-3xl">
          {value}
        </p>
        {description != null && description !== '' && (
          <CardDescription className="font-custom mt-1 text-sm text-[#6f6f6f]">
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
});

interface GradingCardProps {
  initialQuantity: number;
  currentQuantity: number;
  weightKg: number;
}

const GradingCard = memo(function GradingCard({
  initialQuantity,
  currentQuantity,
  weightKg,
}: GradingCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="font-custom transition-shadow duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
          <CardTitle className="text-base font-semibold text-[#333] sm:text-lg">
            Grading (Initial)
          </CardTitle>
          <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <ClipboardList className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-custom text-2xl font-bold tracking-tight text-[#333] sm:text-3xl">
            {formatNumber(initialQuantity)}
          </p>
          <CardDescription className="font-custom text-sm text-[#6f6f6f]">
            {formatWeight(weightKg)}
          </CardDescription>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="font-custom hover:text-primary mt-2 h-auto gap-1.5 px-0 text-[#6f6f6f]"
            >
              {open ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide current
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show current
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="font-custom border-t border-gray-200 pt-3 text-sm">
              <span className="text-[#6f6f6f]">Current quantity: </span>
              <span className="font-semibold text-[#333]">
                {formatNumber(currentQuantity)}
              </span>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
});

const OverviewContent = memo(function OverviewContent({
  data,
}: {
  data: AnalyticsOverviewData;
}) {
  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
      <StatCard
        title="Total Incoming Bags"
        value={formatNumber(data.totalIncomingBags)}
        description={formatWeight(data.totalIncomingWeight)}
        icon={<Package className="h-5 w-5" />}
      />
      <StatCard
        title="Ungraded Bags"
        value={formatNumber(data.totalUngradedBags)}
        description={`${formatWeight(data.totalUngradedWeight)} ungraded`}
        icon={<Boxes className="h-5 w-5" />}
      />
      <GradingCard
        initialQuantity={data.totalGradingBags.initialQuantity}
        currentQuantity={data.totalGradingBags.currentQuantity}
        weightKg={data.totalGradingWeight}
      />
      <StatCard
        title="Bags Stored"
        value={formatNumber(data.totalBagsStored)}
        icon={<Warehouse className="h-5 w-5" />}
      />
      <StatCard
        title="Dispatch"
        value={formatNumber(data.totalBagsDispatched)}
        icon={<Truck className="h-5 w-5" />}
      />
      <StatCard
        title="Total Outgoing Bags"
        value={formatNumber(data.totalOutgoingBags)}
        icon={<ArrowUpRight className="h-5 w-5" />}
      />
    </div>
  );
});

const Overview = memo(function Overview() {
  return (
    <section className="px-4 pt-6 pb-16 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-300 px-4 sm:px-6 lg:px-8">
        <h2 className="font-custom mb-6 text-2xl font-semibold text-[#333] sm:mb-8 lg:text-3xl">
          Analytics Overview
        </h2>
        <OverviewContent data={PLACEHOLDER_DATA} />
      </div>
    </section>
  );
});

export default Overview;
