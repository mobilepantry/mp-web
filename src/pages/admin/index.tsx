import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { Layout } from '@/components/layout';
import { getAllPickupRequests, getPendingPickupRequests } from '@/lib/db/pickups';
import { getTotalPoundsRescued, getActiveDonorsCount } from '@/lib/db/stats';
import { getAllDonors } from '@/lib/db/donors';
import type { PickupRequest, Donor } from '@/types';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/ui';

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useRequireAdmin();
  const [pendingRequests, setPendingRequests] = useState<PickupRequest[]>([]);
  const [recentCompleted, setRecentCompleted] = useState<PickupRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [totalPounds, setTotalPounds] = useState(0);
  const [activeDonors, setActiveDonors] = useState(0);
  const [weeklyRescues, setWeeklyRescues] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData() {
    try {
      const [pending, allRequests, pounds, donorCount, donorsList] = await Promise.all([
        getPendingPickupRequests(),
        getAllPickupRequests(),
        getTotalPoundsRescued(),
        getActiveDonorsCount(),
        getAllDonors(),
      ]);

      setPendingRequests(pending);
      setTotalPounds(pounds);
      setActiveDonors(donorCount);
      setDonors(donorsList);

      // Completed pickups
      const completed = allRequests.filter((r) => r.status === 'completed');
      setRecentCompleted(completed.slice(0, 5));

      // Rescues this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeek = completed.filter((r) => {
        const date = r.completedAt
          ? 'toDate' in r.completedAt
            ? r.completedAt.toDate()
            : r.completedAt
          : null;
        return date && date >= oneWeekAgo;
      });
      setWeeklyRescues(thisWeek.length);
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

  // Build a donor lookup map for displaying business names
  const donorMap = new Map(donors.map((d) => [d.id, d]));

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage pickup requests and donor relationships
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/admin/requests">
                <Button variant="outline">View All Requests</Button>
              </Link>
              <Link href="/admin/donors">
                <Button variant="outline">View All Donors</Button>
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
                      <p className="text-sm text-gray-500">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {pendingRequests.length}
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
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rescues This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{weeklyRescues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Scale className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Pounds Rescued</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalPounds.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/admin/donors">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Donors</p>
                      <p className="text-2xl font-bold text-gray-900">{activeDonors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Pending Requests */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pending Requests</CardTitle>
                  <CardDescription>Requests awaiting confirmation</CardDescription>
                </div>
                <Link
                  href="/admin/requests?status=pending"
                  className="text-sm text-primary hover:underline"
                >
                  View all requests
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-10 w-10 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending requests — all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => {
                    const donor = donorMap.get(request.donorId);
                    return (
                      <Link
                        key={request.id}
                        href={`/admin/requests/${request.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                Pending
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">
                                {donor?.businessName || 'Unknown Donor'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {request.foodDescription}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(request.pickupDate)} &middot;{' '}
                              {formatTimeWindow(request.pickupTimeWindow)} &middot;{' '}
                              ~{request.estimatedWeight} lbs
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
                          <th className="pb-3 font-medium">Business</th>
                          <th className="pb-3 font-medium">Description</th>
                          <th className="pb-3 font-medium">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentCompleted.map((request) => {
                          const donor = donorMap.get(request.donorId);
                          return (
                            <tr
                              key={request.id}
                              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                              onClick={() => router.push(`/admin/requests/${request.id}`)}
                            >
                              <td className="py-3 text-sm">
                                {request.completedAt
                                  ? formatDate(request.completedAt)
                                  : formatDate(request.createdAt)}
                              </td>
                              <td className="py-3 text-sm font-medium">
                                {donor?.businessName || 'Unknown'}
                              </td>
                              <td className="py-3 text-sm max-w-[200px] truncate">
                                {request.foodDescription}
                              </td>
                              <td className="py-3 text-sm">
                                {request.actualWeight ?? request.estimatedWeight} lbs
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {recentCompleted.map((request) => {
                      const donor = donorMap.get(request.donorId);
                      return (
                        <Link
                          key={request.id}
                          href={`/admin/requests/${request.id}`}
                          className="block"
                        >
                          <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {donor?.businessName || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {request.completedAt
                                  ? formatDate(request.completedAt)
                                  : formatDate(request.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {request.foodDescription}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {request.actualWeight ?? request.estimatedWeight} lbs
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
