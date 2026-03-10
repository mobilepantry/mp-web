import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Building2,
  Scale,
  Utensils,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from 'lucide-react';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { Layout } from '@/components/layout';
import { getSupplier } from '@/lib/db/suppliers';
import { getAlertsBySupplier } from '@/lib/db/surplus-alerts';
import { getSupplierStats } from '@/lib/db/stats';
import type { Supplier, SurplusAlert, AlertStatus } from '@/types';
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
  { label: string; color: string }
> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'picked-up': { label: 'Picked Up', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  distributor: 'Distributor',
  wholesale: 'Wholesale',
  farm: 'Farm',
  grocery: 'Grocery Store',
  restaurant: 'Restaurant',
  processor: 'Processor',
  caterer: 'Caterer',
  bakery: 'Bakery',
  corporate: 'Corporate Cafeteria',
  other: 'Other',
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

function formatAddress(address: { street: string; city: string; state: string; zip: string }): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

export default function AdminSupplierDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAdmin, loading: authLoading } = useRequireAdmin();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [alerts, setAlerts] = useState<SurplusAlert[]>([]);
  const [stats, setStats] = useState<{ totalPounds: number; totalRescues: number }>({
    totalPounds: 0,
    totalRescues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id || typeof id !== 'string') return;
      try {
        const [supplierData, alertsData, statsData] = await Promise.all([
          getSupplier(id),
          getAlertsBySupplier(id),
          getSupplierStats(id),
        ]);
        setSupplier(supplierData);
        setAlerts(alertsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching supplier:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user && isAdmin && id) {
      fetchData();
    }
  }, [user, isAdmin, id]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  if (!supplier) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-3xl text-center py-20">
            <p className="text-gray-500 mb-4">Supplier not found</p>
            <Link href="/admin/suppliers">
              <Button variant="outline">Back to Suppliers</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const mealsProvided = Math.round(stats.totalPounds / 1.2);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back Link */}
          <div className="mb-6">
            <Link href="/admin/suppliers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Suppliers
              </Button>
            </Link>
          </div>

          {/* Supplier Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{supplier.businessName}</h1>
            <p className="text-gray-500 mt-1">
              Member since {formatDate(supplier.createdAt)}
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Rescues</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRescues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Pounds</p>
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
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Utensils className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Meals Provided</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mealsProvided.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">
                  {BUSINESS_TYPE_LABELS[supplier.businessType] || supplier.businessType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {supplier.contactName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href={`mailto:${supplier.email}`}
                  className="text-primary hover:underline text-sm"
                >
                  {supplier.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href={`tel:${supplier.phone}`}
                  className="text-primary hover:underline text-sm"
                >
                  {supplier.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">
                  {formatAddress(supplier.address)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Alert History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No surplus alerts yet</p>
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
                          <th className="pb-3 font-medium">Est. Wt</th>
                          <th className="pb-3 font-medium">Actual Wt</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {alerts.map((alert) => {
                          const config = STATUS_CONFIG[alert.status];
                          return (
                            <tr
                              key={alert.id}
                              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                router.push(`/admin/requests/${alert.id}`)
                              }
                            >
                              <td className="py-3 text-sm">
                                {formatDate(alert.createdAt)}
                              </td>
                              <td className="py-3 text-sm max-w-[200px] truncate">
                                {alert.produceDescription}
                              </td>
                              <td className="py-3 text-sm">
                                {alert.estimatedWeightLbs} lbs
                              </td>
                              <td className="py-3 text-sm">
                                {alert.actualWeightLbs != null
                                  ? `${alert.actualWeightLbs} lbs`
                                  : '\u2014'}
                              </td>
                              <td className="py-3">
                                <Badge className={config.color}>{config.label}</Badge>
                              </td>
                              <td className="py-3">
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {alerts.map((alert) => {
                      const config = STATUS_CONFIG[alert.status];
                      return (
                        <Link
                          key={alert.id}
                          href={`/admin/requests/${alert.id}`}
                          className="block"
                        >
                          <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-500">
                                {formatDate(alert.createdAt)}
                              </span>
                              <Badge className={config.color}>{config.label}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {alert.produceDescription}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Est: {alert.estimatedWeightLbs} lbs
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
        </div>
      </div>
    </Layout>
  );
}
