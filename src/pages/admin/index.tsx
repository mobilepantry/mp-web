import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Loader2,
  Clock,
  Scale,
  Users,
  Package,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Thermometer,
  Truck,
} from 'lucide-react';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { Layout } from '@/components/layout';
import { getAllSurplusAlerts, getPendingAlerts } from '@/lib/db/surplus-alerts';
import {
  getActiveSuppliersCount,
  getWeeklyPoundsRescued,
  getAvgPickupTemperature,
  getAlertCountByStatus,
} from '@/lib/db/stats';
import { getAllSuppliers } from '@/lib/db/suppliers';
import type { SurplusAlert, AlertStatus, Supplier } from '@/types';
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
    icon: Clock,
  },
};

function formatDate(timestamp: { toDate: () => Date } | Date | string): string {
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const date = 'toDate' in timestamp ? timestamp.toDate() : timestamp;
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

function getTempColor(temp: number): string {
  if (temp <= 38) return 'text-green-600';
  if (temp <= 41) return 'text-yellow-600';
  return 'text-red-600';
}

function getTempBgColor(temp: number): string {
  if (temp <= 38) return 'bg-green-100';
  if (temp <= 41) return 'bg-yellow-100';
  return 'bg-red-100';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useRequireAdmin();
  const [pendingAlerts, setPendingAlerts] = useState<SurplusAlert[]>([]);
  const [recentCompleted, setRecentCompleted] = useState<SurplusAlert[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [weeklyPounds, setWeeklyPounds] = useState(0);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [avgTemp, setAvgTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData() {
    try {
      const [
        pending,
        allAlerts,
        weekly,
        activeSuppliers,
        temperature,
        suppliersList,
      ] = await Promise.all([
        getPendingAlerts(),
        getAllSurplusAlerts(),
        getWeeklyPoundsRescued(),
        getActiveSuppliersCount(),
        getAvgPickupTemperature(),
        getAllSuppliers(),
      ]);

      setPendingAlerts(pending);
      setPendingCount(pending.length);
      setWeeklyPounds(weekly);
      setSuppliersCount(activeSuppliers);
      setAvgTemp(temperature);
      setSuppliers(suppliersList);

      // Completed alerts
      const completed = allAlerts.filter((a) => a.status === 'completed');
      setRecentCompleted(completed.slice(0, 5));
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  function handleRefresh() {
    setRefreshing(true);
    fetchData();
  }

  // Build a supplier lookup map for displaying business names
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Ops Dashboard | MobilePantry</title>
      </Head>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage surplus alerts and supplier relationships
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/admin/requests">
                <Button variant="outline">View All Alerts</Button>
              </Link>
              <Link href="/admin/suppliers">
                <Button variant="outline">View All Suppliers</Button>
              </Link>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/admin/requests?status=pending">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Alerts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {pendingCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Scale className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lbs Rescued This Week</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {weeklyPounds.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/admin/suppliers">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Suppliers</p>
                      <p className="text-2xl font-bold text-gray-900">{suppliersCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${avgTemp !== null ? getTempBgColor(avgTemp) : 'bg-gray-100'}`}>
                    <Thermometer className={`h-6 w-6 ${avgTemp !== null ? getTempColor(avgTemp) : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Pickup Temp</p>
                    <p className={`text-2xl font-bold ${avgTemp !== null ? getTempColor(avgTemp) : 'text-gray-900'}`}>
                      {avgTemp !== null ? `${avgTemp.toFixed(1)}\u00B0F` : '\u2014'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Alerts */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pending Alerts</CardTitle>
                  <CardDescription>Alerts awaiting confirmation</CardDescription>
                </div>
                <Link
                  href="/admin/requests?status=pending"
                  className="text-sm text-primary hover:underline"
                >
                  View all alerts
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {pendingAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-10 w-10 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending alerts — all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAlerts.map((alert) => {
                    const supplier = supplierMap.get(alert.supplierId);
                    return (
                      <Link
                        key={alert.id}
                        href={`/admin/requests/${alert.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                Pending
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">
                                {supplier?.businessName || 'Unknown Supplier'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {alert.produceDescription}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {alert.produceCategory?.map((cat) => (
                                <Badge key={cat} className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(alert.pickupDate)} &middot;{' '}
                              {formatTimeWindow(alert.pickupTimeWindow)} &middot;{' '}
                              ~{alert.estimatedWeightLbs} lbs
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
                  <CardDescription>Recently completed pickups</CardDescription>
                </div>
                <Link
                  href="/admin/requests?status=completed"
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentCompleted.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No completed pickups yet</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Supplier</th>
                          <th className="pb-3 font-medium">Produce</th>
                          <th className="pb-3 font-medium">Weight</th>
                          <th className="pb-3 font-medium">Temp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentCompleted.map((alert) => {
                          const supplier = supplierMap.get(alert.supplierId);
                          const weight = alert.actualWeightLbs ?? alert.estimatedWeightLbs;
                          return (
                            <tr
                              key={alert.id}
                              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                              onClick={() => router.push(`/admin/requests/${alert.id}`)}
                            >
                              <td className="py-3 text-sm">
                                {formatDate(alert.createdAt)}
                              </td>
                              <td className="py-3 text-sm font-medium">
                                {supplier?.businessName || 'Unknown'}
                              </td>
                              <td className="py-3 text-sm max-w-[200px] truncate">
                                {alert.produceDescription}
                              </td>
                              <td className="py-3 text-sm">
                                {weight} lbs
                              </td>
                              <td className="py-3 text-sm">
                                {alert.temperatureAtPickup != null ? (
                                  <span className={getTempColor(alert.temperatureAtPickup)}>
                                    {alert.temperatureAtPickup}{'\u00B0'}F
                                  </span>
                                ) : (
                                  '\u2014'
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {recentCompleted.map((alert) => {
                      const supplier = supplierMap.get(alert.supplierId);
                      const weight = alert.actualWeightLbs ?? alert.estimatedWeightLbs;
                      return (
                        <Link
                          key={alert.id}
                          href={`/admin/requests/${alert.id}`}
                          className="block"
                        >
                          <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {supplier?.businessName || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(alert.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {alert.produceDescription}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {weight} lbs
                              {alert.temperatureAtPickup != null && (
                                <span className={`ml-2 ${getTempColor(alert.temperatureAtPickup)}`}>
                                  {alert.temperatureAtPickup}{'\u00B0'}F
                                </span>
                              )}
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
