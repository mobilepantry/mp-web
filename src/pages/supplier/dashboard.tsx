import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  Scale,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { getAlertsBySupplier } from '@/lib/db/surplus-alerts';
import { getSupplierStats } from '@/lib/db/stats';
import type { SurplusAlert, AlertStatus } from '@/types';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/ui';

const STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle2,
  },
  'picked-up': {
    label: 'Picked Up',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Truck,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
};

function formatDate(timestamp: { toDate: () => Date } | Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : 'toDate' in timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeWindow(window: string): string {
  switch (window) {
    case 'morning':
      return 'Morning (8am - 12pm)';
    case 'afternoon':
      return 'Afternoon (12pm - 5pm)';
    case 'evening':
      return 'Evening (5pm - 8pm)';
    default:
      return window;
  }
}

export default function SupplierDashboardPage() {
  const router = useRouter();
  const { user, supplier, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<SurplusAlert[]>([]);
  const [stats, setStats] = useState<{ totalPounds: number; totalAlerts: number }>({
    totalPounds: 0,
    totalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/supplier/dashboard');
        return;
      }
      if (!supplier) {
        router.push('/auth/complete-profile');
      }
    }
  }, [user, supplier, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const [alertsData, statsData] = await Promise.all([
          getAlertsBySupplier(user.uid),
          getSupplierStats(user.uid),
        ]);
        setAlerts(alertsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user && supplier) {
      fetchData();
    }
  }, [user, supplier]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !supplier) {
    return null;
  }

  const activeAlerts = alerts.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed'
  );
  const recentAlerts = alerts.slice(0, 5);

  return (
    <Layout>
      <Head>
        <title>Dashboard | MobilePantry</title>
      </Head>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {supplier.businessName}
              </h1>
              <p className="text-gray-600 mt-1">
                Thank you for helping rescue produce in Columbus!
              </p>
            </div>
            <Link href="/supplier/alert">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Submit Surplus Alert
              </Button>
            </Link>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pounds Rescued</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalPounds.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Bell className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Alerts Submitted</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalAlerts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeAlerts.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Active Alerts</CardTitle>
              <CardDescription>
                Your pending and confirmed surplus alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No surplus alerts yet</p>
                  <Link
                    href="/supplier/alert"
                    className="text-primary hover:underline text-sm mt-2 inline-block"
                  >
                    Submit your first surplus alert
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => {
                    const config = STATUS_CONFIG[alert.status];
                    return (
                      <Link
                        key={alert.id}
                        href={`/supplier/alert/${alert.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={config.color}>
                                {config.label}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatDate(alert.pickupDate)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {alert.produceDescription}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {alert.estimatedWeightLbs} lbs &middot;{' '}
                              {formatTimeWindow(alert.pickupTimeWindow)}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-4" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Your latest surplus alerts</CardDescription>
                </div>
                {alerts.length > 5 && (
                  <Link
                    href="/supplier/history"
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No surplus alerts yet
                  </p>
                  <Link
                    href="/supplier/alert"
                    className="text-primary hover:underline text-sm mt-2 inline-block"
                  >
                    Submit your first surplus alert
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Produce</th>
                          <th className="pb-3 font-medium">Weight</th>
                          <th className="pb-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentAlerts.map((alert) => {
                          const config = STATUS_CONFIG[alert.status];
                          return (
                            <tr
                              key={alert.id}
                              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                router.push(`/supplier/alert/${alert.id}`)
                              }
                            >
                              <td className="py-3 text-sm">
                                {formatDate(alert.createdAt)}
                              </td>
                              <td className="py-3 text-sm max-w-[200px] truncate">
                                {alert.produceDescription}
                              </td>
                              <td className="py-3 text-sm">
                                {alert.actualWeightLbs ?? alert.estimatedWeightLbs}{' '}
                                lbs
                              </td>
                              <td className="py-3">
                                <Badge className={config.color}>
                                  {config.label}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {recentAlerts.map((alert) => {
                      const config = STATUS_CONFIG[alert.status];
                      return (
                        <Link
                          key={alert.id}
                          href={`/supplier/alert/${alert.id}`}
                          className="block"
                        >
                          <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-500">
                                {formatDate(alert.createdAt)}
                              </span>
                              <Badge className={config.color}>
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {alert.produceDescription}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {alert.actualWeightLbs ?? alert.estimatedWeightLbs}{' '}
                              lbs
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
