import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useGetAreaBreakdown } from '@/services/store-admin/grading-gate-pass/useGetAreaBreakdown';

function validateSearch(search: Record<string, unknown>): {
  area?: string;
  size?: string;
  variety?: string;
} {
  return {
    area: typeof search.area === 'string' ? search.area : undefined,
    size: typeof search.size === 'string' ? search.size : undefined,
    variety: typeof search.variety === 'string' ? search.variety : undefined,
  };
}

export const Route = createFileRoute(
  '/store-admin/_authenticated/area-breakdown/'
)({
  validateSearch,
  component: AreaBreakdownPage,
});

function AreaBreakdownPage() {
  const { area, size, variety } = Route.useSearch();
  const { data, isLoading, isError, error } = useGetAreaBreakdown({
    area,
    size,
    variety,
  });

  return (
    <main className="font-custom mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-12">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link
            to="/store-admin/analytics"
            className="font-custom text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analytics
          </Link>
        </Button>
      </div>

      <Card className="font-custom border-border overflow-hidden rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-custom text-xl font-bold sm:text-2xl">
            Area breakdown
          </CardTitle>
          <CardDescription className="font-custom text-muted-foreground text-sm">
            {[area, size, variety].filter(Boolean).length > 0 ? (
              <>
                Filter:{' '}
                {[
                  area && `Area: ${area}`,
                  size && `Size: ${size}`,
                  variety && `Variety: ${variety}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </>
            ) : (
              'Select area, size, and variety from the analytics table.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Skeleton className="font-custom min-h-[200px] w-full rounded-lg" />
          )}
          {isError && (
            <p className="font-custom text-destructive text-sm">
              {error instanceof Error
                ? error.message
                : 'Failed to load area breakdown.'}
            </p>
          )}
          {data?.farmers != null && data.farmers.length === 0 && !isLoading && (
            <p className="font-custom text-muted-foreground text-sm">
              No farmer data for the selected filters.
            </p>
          )}
          {data?.farmers != null && data.farmers.length > 0 && (
            <ul className="font-custom space-y-4">
              {data.farmers.map((entry) => (
                <li
                  key={entry.farmer.id}
                  className="border-border rounded-lg border p-4"
                >
                  <p className="font-custom font-semibold text-[#333]">
                    {entry.farmer.name}
                  </p>
                  <p className="font-custom text-muted-foreground text-sm">
                    {entry.farmer.address}
                  </p>
                  <div className="mt-2 space-y-1">
                    {entry.varieties.map((v) => (
                      <div key={v.variety} className="font-custom text-sm">
                        <span className="font-medium">{v.variety}:</span>{' '}
                        {v.sizes
                          .map(
                            (s) =>
                              `${s.size}: ${s.stock.toLocaleString('en-IN')}`
                          )
                          .join(', ')}
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
