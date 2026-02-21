import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { Layout } from '@/components/layout';
import { getAllPickupRequests } from '@/lib/db/pickups';
import { getAllDonors } from '@/lib/db/donors';
import type { PickupRequest, PickupStatus, Donor } from '@/types';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
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

const STATUS_TABS: { key: PickupStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

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
  const [allRequests, setAllRequests] = useState<PickupRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PickupStatus | 'all'>('all');
  const [page, setPage] = useState(0);

  // Read initial status filter from query param
  useEffect(() => {
    const { status } = router.query;
    if (status && STATUS_TABS.some((t) => t.key === status)) {
      setActiveTab(status as PickupStatus | 'all');
    }
  }, [router.query]);

  useEffect(() => {
    async function fetchData() {
      if (!user || !isAdmin) return;
      try {
        const [requests, donorsList] = await Promise.all([
          getAllPickupRequests(),
          getAllDonors(),
        ]);
        setAllRequests(requests);
        setDonors(donorsList);
      } catch (err) {
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const donorMap = new Map(donors.map((d) => [d.id, d]));

  const filteredRequests =
    activeTab === 'all'
      ? allRequests
      : allRequests.filter((r) => r.status === activeTab);

  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
  const paginatedRequests = filteredRequests.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  // Reset page when filter changes
  function handleTabChange(tab: PickupStatus | 'all') {
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
            <h1 className="text-2xl font-bold text-gray-900">Pickup Requests</h1>
            <p className="text-sm text-gray-500">{filteredRequests.length} requests</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.key === 'all'
                  ? allRequests.length
                  : allRequests.filter((r) => r.status === tab.key).length;
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

          {/* Requests */}
          <Card>
            <CardContent className="p-0">
              {paginatedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No requests found</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="px-6 py-3 font-medium">Date</th>
                          <th className="px-6 py-3 font-medium">Business</th>
                          <th className="px-6 py-3 font-medium">Pickup Date</th>
                          <th className="px-6 py-3 font-medium">Time</th>
                          <th className="px-6 py-3 font-medium">Est. Weight</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                          <th className="px-6 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRequests.map((request) => {
                          const donor = donorMap.get(request.donorId);
                          const config = STATUS_CONFIG[request.status];
                          return (
                            <tr
                              key={request.id}
                              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                router.push(`/admin/requests/${request.id}`)
                              }
                            >
                              <td className="px-6 py-4 text-sm">
                                {formatDate(request.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                {donor?.businessName || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {formatDate(request.pickupDate)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {formatTimeWindow(request.pickupTimeWindow)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {request.estimatedWeight} lbs
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
                    {paginatedRequests.map((request) => {
                      const donor = donorMap.get(request.donorId);
                      const config = STATUS_CONFIG[request.status];
                      return (
                        <Link
                          key={request.id}
                          href={`/admin/requests/${request.id}`}
                          className="block"
                        >
                          <div className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {donor?.businessName || 'Unknown'}
                              </span>
                              <Badge className={config.color}>{config.label}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 truncate mb-1">
                              {request.foodDescription}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(request.pickupDate)} &middot;{' '}
                              {formatTimeWindow(request.pickupTimeWindow)} &middot;{' '}
                              ~{request.estimatedWeight} lbs
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
