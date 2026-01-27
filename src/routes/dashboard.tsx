import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Home,
  IndianRupee,
  CheckSquare,
  Zap,
  Sprout,
  Droplets,
  FileText,
  Package,
} from 'lucide-react';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const activities = [
    {
      title: 'Wheat field irrigation completed',
      time: '2 hours ago',
      type: 'irrigation',
    },
    {
      title: 'New crop planted in Field 3',
      time: '5 hours ago',
      type: 'planting',
    },
    {
      title: 'Harvest scheduled for Field 1',
      time: '1 day ago',
      type: 'harvest',
    },
    {
      title: 'Soil analysis report received',
      time: '2 days ago',
      type: 'analysis',
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Navigation */}
      <nav className="bg-card border-border sticky top-0 z-50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-primary text-2xl font-bold">
                Bhatti Agri-tech
              </h1>
              <span className="text-muted-foreground ml-4">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/">Home</Link>
              </Button>
              <Button>Profile</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-foreground text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Overview of your farm operations and key metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Crops
                  </p>
                  <p className="text-card-foreground mt-2 text-3xl font-bold">
                    24
                  </p>
                </div>
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <Users className="text-primary h-6 w-6" />
                </div>
              </div>
              <p className="text-primary mt-4 text-sm">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Active Fields
                  </p>
                  <p className="text-card-foreground mt-2 text-3xl font-bold">
                    8
                  </p>
                </div>
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <Home className="text-chart-2 h-6 w-6" />
                </div>
              </div>
              <p className="text-chart-2 mt-4 text-sm">
                3 fields ready for harvest
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Revenue
                  </p>
                  <p className="text-card-foreground mt-2 text-3xl font-bold">
                    ₹2.4L
                  </p>
                </div>
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <IndianRupee className="text-chart-4 h-6 w-6" />
                </div>
              </div>
              <p className="text-chart-4 mt-4 text-sm">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Tasks
                  </p>
                  <p className="text-card-foreground mt-2 text-3xl font-bold">
                    12
                  </p>
                </div>
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <CheckSquare className="text-chart-3 h-6 w-6" />
                </div>
              </div>
              <p className="text-chart-3 mt-4 text-sm">5 pending tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="bg-muted hover:bg-accent flex items-start gap-4 rounded-lg p-4 transition-colors"
                  >
                    <div className="bg-background border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                      <Zap className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-card-foreground font-medium">
                        {activity.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" size="lg">
                  <Sprout className="mr-2 h-4 w-4" />
                  Add New Crop
                </Button>
                <Button
                  className="bg-chart-2 hover:bg-chart-2/90 w-full justify-start"
                  size="lg"
                >
                  <Droplets className="mr-2 h-4 w-4" />
                  Schedule Irrigation
                </Button>
                <Button
                  className="bg-chart-4 hover:bg-chart-4/90 w-full justify-start"
                  size="lg"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
                <Button
                  className="bg-chart-3 hover:bg-chart-3/90 w-full justify-start"
                  size="lg"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Manage Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
