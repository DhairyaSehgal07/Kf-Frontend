import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Item, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  Thermometer,
  LayoutGrid,
  FolderOpen,
  FileStack,
  ChevronRight,
} from 'lucide-react';

const MODULES = [
  {
    title: 'Temperature Monitoring',
    description: 'Track and monitor storage temperature',
    to: '/store-admin/additional/temperature-monitoring',
    icon: Thermometer,
  },
  {
    title: 'Option 2',
    description: 'Additional module',
    to: '/store-admin/additional/option-2',
    icon: LayoutGrid,
  },
  {
    title: 'Option 3',
    description: 'Additional module',
    to: '/store-admin/additional/option-3',
    icon: FolderOpen,
  },
  {
    title: 'Option 4',
    description: 'Additional module',
    to: '/store-admin/additional/option-4',
    icon: FileStack,
  },
] as const;

const AdditionalModulesPage = memo(function AdditionalModulesPage() {
  return (
    <main className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <LayoutGrid className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                Additional modules
              </ItemTitle>
            </div>
          </ItemHeader>
        </Item>

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.to}
                to={module.to as '/'}
                className="focus-visible:ring-primary group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Card className="focus-within:ring-primary h-full rounded-xl transition-all duration-200 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 hover:-translate-y-1 hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                          <Icon className="text-primary h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="font-custom text-lg font-semibold">
                            {module.title}
                          </CardTitle>
                          <CardDescription className="font-custom mt-1">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
});

export default AdditionalModulesPage;
