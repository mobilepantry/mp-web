import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  Scale,
  Utensils,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { getPickupRequestsByDonor } from '@/lib/db/pickups';
import { getDonorStats } from '@/lib/db/stats';
import type { PickupRequest, PickupStatus } from '@/types';
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

function formatDate(timestamp: { toDate: () => Date } | Date): string {
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

export default function DonorDashboardPage() {
  const router = useRouter();
  const { user, donor, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [stats, setStats] = useState<{ totalPounds: number; totalRescues: number }>({
    totalPounds: 0,
    totalRescues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/donor/dashboard');
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
        const [requestsData, statsData] = await Promise.all([
          getPickupRequestsByDonor(user.uid),
          getDonorStats(user.uid),
        ]);
        setRequests(requestsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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

  const pendingRequests = requests.filter(
    (r) => r.status === 'pending' || r.status === 'confirmed'
  );
  const recentDonations = requests.slice(0, 5);
  const mealsProvided = Math.round(stats.totalPounds / 1.2);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {donor.businessName}
              </h1>
              <p className="text-gray-600 mt-1">
                Thank you for helping rescue food in Columbus!
              </p>
            </div>
            <Link href="/donor/request">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Request a Pickup
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
                    <p className="text-sm text-gray-500">Pounds Donated</p>
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
                    <Utensils className="h-6 w-6 text-green-600" />
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

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalRescues}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Requests */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Pending Requests</CardTitle>
              <CardDescription>
                Your active pickup requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending requests</p>
                  <Link
                    href="/donor/request"
                    className="text-primary hover:underline text-sm mt-2 inline-block"
                  >
                    Request a pickup
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => {
                    const config = STATUS_CONFIG[request.status];
                    return (
                      <Link
                        key={request.id}
                        href={`/donor/request/${request.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={config.color}>
                                {config.label}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatDate(request.pickupDate)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {request.foodDescription}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {request.estimatedWeight} lbs &middot;{' '}
                              {formatTimeWindow(request.pickupTimeWindow)}
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

          {/* Recent Donations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Donations</CardTitle>
                  <CardDescription>Your latest pickup requests</CardDescription>
                </div>
                {requests.length > 5 && (
                  <Link
                    href="/donor/history"
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recentDonations.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    You haven&apos;t made any donations yet
                  </p>
                  <Link
                    href="/donor/request"
                    className="text-primary hover:underline text-sm mt-2 inline-block"
                  >
                    Make your first donation
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
                          <th className="pb-3 font-medium">Description</th>
                          <th className="pb-3 font-medium">Weight</th>
                          <th className="pb-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentDonations.map((request) => {
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
                              <td className="py-3 text-sm max-w-[200px] truncate">
                                {request.foodDescription}
                              </td>
                              <td className="py-3 text-sm">
                                {request.actualWeight ?? request.estimatedWeight}{' '}
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
                    {recentDonations.map((request) => {
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
                              {request.actualWeight ?? request.estimatedWeight}{' '}
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
