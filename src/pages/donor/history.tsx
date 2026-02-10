import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Scale,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { getPickupRequestsByDonor } from '@/lib/db/pickups';
import type { PickupRequest, PickupStatus } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/ui';

const STATUS_CONFIG: Record<
  PickupStatus,
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

type FilterStatus = PickupStatus | 'all';

function formatDate(timestamp: { toDate: () => Date } | Date): string {
  const date = 'toDate' in timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DonationHistoryPage() {
  const router = useRouter();
  const { user, donor, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/donor/history');
        return;
      }
      if (!donor) {
        router.push('/auth/complete-profile');
      }
    }
  }, [user, donor, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const data = await getPickupRequestsByDonor(user.uid);
        setRequests(data);
      } catch (err) {
        console.error('Error fetching donation history:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user && donor) {
      fetchData();
    }
  }, [user, donor]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !donor) {
    return null;
  }

  const filteredRequests =
    filter === 'all'
      ? requests
      : requests.filter((r) => r.status === filter);

  const totalPounds = requests
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + (r.actualWeight ?? r.estimatedWeight), 0);

  const filterTabs: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href="/donor/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Donation History
              </h1>
              <p className="text-gray-600 mt-1">
                All your pickup requests in one place
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Total Donations</p>
                    <p className="text-xl font-bold">{requests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Total Pounds</p>
                    <p className="text-xl font-bold">
                      {totalPounds.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === tab.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Donation List */}
          <Card>
            <CardContent className="pt-6">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {filter === 'all'
                      ? "You haven't made any donations yet"
                      : `No ${filter} donations`}
                  </p>
                  {filter === 'all' && (
                    <Link
                      href="/donor/request"
                      className="text-primary hover:underline text-sm mt-2 inline-block"
                    >
                      Make your first donation
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Description</th>
                          <th className="pb-3 font-medium">Weight</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((request) => {
                          const config = STATUS_CONFIG[request.status];
                          return (
                            <tr
                              key={request.id}
                              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                router.push(`/donor/request/${request.id}`)
                              }
                            >
                              <td className="py-3 text-sm">
                                {formatDate(request.createdAt)}
                              </td>
                              <td className="py-3 text-sm max-w-[250px] truncate">
                                {request.foodDescription}
                              </td>
                              <td className="py-3 text-sm">
                                {request.actualWeight ??
                                  request.estimatedWeight}{' '}
                                lbs
                              </td>
                              <td className="py-3">
                                <Badge className={config.color}>
                                  {config.label}
                                </Badge>
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
                    {filteredRequests.map((request) => {
                      const config = STATUS_CONFIG[request.status];
                      return (
                        <Link
                          key={request.id}
                          href={`/donor/request/${request.id}`}
                          className="block"
                        >
                          <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-500">
                                {formatDate(request.createdAt)}
                              </span>
                              <Badge className={config.color}>
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {request.foodDescription}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {request.actualWeight ??
                                request.estimatedWeight}{' '}
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
