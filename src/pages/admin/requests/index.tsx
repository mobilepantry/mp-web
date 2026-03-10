import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { Layout } from '@/components/layout';
import { getAllSurplusAlerts } from '@/lib/db/surplus-alerts';
import { getAllSuppliers } from '@/lib/db/suppliers';
import type { SurplusAlert, AlertStatus, Supplier } from '@/types';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
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

const STATUS_TABS: { key: AlertStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'picked-up', label: 'Picked Up' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

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
      return 'Morning';
    case 'afternoon':
      return 'Afternoon';
    case 'evening':
      return 'Evening';
    default:
      return window;
  }
}

const PAGE_SIZE = 20;

export default function AdminRequestsListPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useRequireAdmin();
  const [allAlerts, setAllAlerts] = useState<SurplusAlert[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AlertStatus | 'all'>('all');
  const [page, setPage] = useState(0);

  // Read initial status filter from query param
  useEffect(() => {
    const { status } = router.query;
    if (status && STATUS_TABS.some((t) => t.key === status)) {
      setActiveTab(status as AlertStatus | 'all');
    }
  }, [router.query]);

  useEffect(() => {
    async function fetchData() {
      if (!user || !isAdmin) return;
      try {
        const [alerts, suppliersList] = await Promise.all([
          getAllSurplusAlerts(),
          getAllSuppliers(),
        ]);
        setAllAlerts(alerts);
        setSuppliers(suppliersList);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

  const filteredAlerts =
    activeTab === 'all'
      ? allAlerts
      : allAlerts.filter((a) => a.status === activeTab);

  const totalPages = Math.ceil(filteredAlerts.length / PAGE_SIZE);
  const paginatedAlerts = filteredAlerts.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  // Reset page when filter changes
  function handleTabChange(tab: AlertStatus | 'all') {
    setActiveTab(tab);
    setPage(0);
  }

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
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Surplus Alerts</h1>
            <p className="text-sm text-gray-500">{filteredAlerts.length} alerts</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.key === 'all'
                  ? allAlerts.length
                  : allAlerts.filter((a) => a.status === tab.key).length;
              return (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label} ({count})
                </Button>
              );
            })}
          </div>

          {/* Alerts */}
          <Card>
            <CardContent className="p-0">
              {paginatedAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No alerts found</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="px-6 py-3 font-medium">Date</th>
                          <th className="px-6 py-3 font-medium">Supplier</th>
                          <th className="px-6 py-3 font-medium">Produce</th>
                          <th className="px-6 py-3 font-medium">Est. Wt</th>
                          <th className="px-6 py-3 font-medium">Actual Wt</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                          <th className="px-6 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAlerts.map((alert) => {
                          const supplier = supplierMap.get(alert.supplierId);
                          const config = STATUS_CONFIG[alert.status];
                          return (
                            <tr
                              key={alert.id}
                              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                router.push(`/admin/requests/${alert.id}`)
                              }
                            >
                              <td className="px-6 py-4 text-sm">
                                {formatDate(alert.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                {supplier?.businessName || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 text-sm max-w-[200px] truncate">
                                {alert.produceDescription}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {alert.estimatedWeightLbs} lbs
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {alert.actualWeightLbs != null
                                  ? `${alert.actualWeightLbs} lbs`
                                  : '\u2014'}
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={config.color}>{config.label}</Badge>
                              </td>
                              <td className="px-6 py-4">
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y">
                    {paginatedAlerts.map((alert) => {
                      const supplier = supplierMap.get(alert.supplierId);
                      const config = STATUS_CONFIG[alert.status];
                      return (
                        <Link
                          key={alert.id}
                          href={`/admin/requests/${alert.id}`}
                          className="block"
                        >
                          <div className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {supplier?.businessName || 'Unknown'}
                              </span>
                              <Badge className={config.color}>{config.label}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 truncate mb-1">
                              {alert.produceDescription}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(alert.pickupDate)} &middot;{' '}
                              {formatTimeWindow(alert.pickupTimeWindow)} &middot;{' '}
                              ~{alert.estimatedWeightLbs} lbs
                              {alert.actualWeightLbs != null && (
                                <span> &middot; Actual: {alert.actualWeightLbs} lbs</span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
