import { memo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAreaWiseAnalytics } from '@/services/store-admin/grading-gate-pass/useGetAreaWiseAnalytics';

type DateParams = { dateFrom: string; dateTo: string } | Record<string, never>;

interface AreaWiseAnalyticsProps {
  dateParams: DateParams;
}

const AreaWiseAnalytics = memo(function AreaWiseAnalytics({
  dateParams,
}: AreaWiseAnalyticsProps) {
  const { data, isLoading, isError } = useGetAreaWiseAnalytics(dateParams);
  const varieties = data?.data ?? [];

  if (isLoading) {
    return (
      <Card className="font-custom">
        <CardHeader>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Area-wise size distribution
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Bags by variety, area, and size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/20 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-200">
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
            Area-wise size distribution
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Bags by variety, area, and size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-destructive/30 bg-destructive/5 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
            <span className="font-custom text-destructive text-sm">
              Failed to load area-wise data.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (varieties.length === 0) {
    return (
      <Card className="font-custom">
        <CardHeader>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Area-wise size distribution
          </CardTitle>
          <CardDescription className="text-sm text-[#6f6f6f]">
            Bags by variety, area, and size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/20 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-200">
            <span className="font-custom text-sm text-[#6f6f6f]">
              No area-wise data for this range. Apply a date range or ensure
              data exists.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sizes = new Set<string>();
  varieties.forEach((v) =>
    v.areas.forEach((a) =>
      Object.keys(a.sizes ?? {}).forEach((s) => sizes.add(s))
    )
  );
  const sizeList = Array.from(sizes).sort();

  return (
    <Card className="font-custom">
      <CardHeader>
        <CardTitle className="text-base font-semibold sm:text-lg">
          Area-wise size distribution
        </CardTitle>
        <CardDescription className="text-sm text-[#6f6f6f]">
          Bags by variety, area, and size. Cells can link to area breakdown when
          that route is available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-custom font-medium">
                  Variety
                </TableHead>
                <TableHead className="font-custom font-medium">Area</TableHead>
                {sizeList.map((s) => (
                  <TableHead
                    key={s}
                    className="font-custom text-right font-medium"
                  >
                    {s}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {varieties.flatMap((v) =>
                v.areas.map((a) => (
                  <TableRow key={`${v.variety}-${a.area}`}>
                    <TableCell className="font-custom text-sm">
                      {v.variety}
                    </TableCell>
                    <TableCell className="font-custom text-sm">
                      {a.area}
                    </TableCell>
                    {sizeList.map((s) => (
                      <TableCell
                        key={s}
                        className="font-custom text-right font-medium tabular-nums"
                      >
                        {(a.sizes ?? {})[s] ?? '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});

export default AreaWiseAnalytics;
