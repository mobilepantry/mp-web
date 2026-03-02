import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Users,
  Search,
} from 'lucide-react';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { Layout } from '@/components/layout';
import { getAllDonors } from '@/lib/db/donors';
import { getAllPickupRequests } from '@/lib/db/pickups';
import type { Donor, PickupRequest } from '@/types';
import {
  Button,
  Card,
  CardContent,
  Input,
} from '@/components/ui';

function formatDate(timestamp: { toDate: () => Date } | Date): string {
  const date = 'toDate' in timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface DonorWithStats extends Donor {
  totalDonated: number;
  lastDonationDate: Date | null;
}

const PAGE_SIZE = 20;

export default function AdminDonorsListPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useRequireAdmin();
  const [donors, setDonors] = useState<DonorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'donated'>('recent');
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!user || !isAdmin) return;
      try {
        const [donorsList, requests] = await Promise.all([
          getAllDonors(),
          getAllPickupRequests(),
        ]);

        // Build per-donor stats from completed requests
        const donorStats = new Map<string, { totalDonated: number; lastDate: Date | null }>();
        for (const req of requests) {
          if (req.status !== 'completed') continue;
          const existing = donorStats.get(req.donorId) || { totalDonated: 0, lastDate: null };
          existing.totalDonated += req.actualWeight ?? req.estimatedWeight;
          const completedDate = req.completedAt
            ? 'toDate' in req.completedAt
              ? req.completedAt.toDate()
              : req.completedAt
            : null;
          if (completedDate && (!existing.lastDate || completedDate > existing.lastDate)) {
            existing.lastDate = completedDate;
          }
          donorStats.set(req.donorId, existing);
        }

        const donorsWithStats: DonorWithStats[] = donorsList.map((d) => {
          const stats = donorStats.get(d.id);
          return {
            ...d,
            totalDonated: stats?.totalDonated ?? 0,
            lastDonationDate: stats?.lastDate ?? null,
          };
        });

        setDonors(donorsWithStats);
      } catch (err) {
        console.error('Error fetching donors:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const filteredDonors = useMemo(() => {
    let result = donors;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.businessName.toLowerCase().includes(q) ||
          d.contactName.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.businessName.localeCompare(b.businessName);
        case 'donated':
          return b.totalDonated - a.totalDonated;
        case 'recent':
        default: {
          const dateA = a.lastDonationDate?.getTime() ?? 0;
          const dateB = b.lastDonationDate?.getTime() ?? 0;
          return dateB - dateA;
        }
      }
    });

    return result;
  }, [donors, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredDonors.length / PAGE_SIZE);
  const paginatedDonors = filteredDonors.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page on search/sort change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, sortBy]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back */}
          <div className="mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
            <p className="text-sm text-gray-500">{filteredDonors.length} donors</p>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by business, contact, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                Most Recent
              </Button>
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('name')}
              >
                A-Z
              </Button>
              <Button
                variant={sortBy === 'donated' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('donated')}
              >
                Top Donors
              </Button>
            </div>
          </div>

          {/* Donors List */}
          <Card>
            <CardContent className="p-0">
              {paginatedDonors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No donors match your search' : 'No donors yet'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="px-6 py-3 font-medium">Business</th>
                          <th className="px-6 py-3 font-medium">Contact</th>
                          <th className="px-6 py-3 font-medium">Email</th>
                          <th className="px-6 py-3 font-medium">Phone</th>
                          <th className="px-6 py-3 font-medium">Total Donated</th>
                          <th className="px-6 py-3 font-medium">Last Donation</th>
                          <th className="px-6 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDonors.map((donor) => (
                          <tr
                            key={donor.id}
                            className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/admin/donors/${donor.id}`)}
                          >
                            <td className="px-6 py-4 text-sm font-medium">
                              {donor.businessName}
                            </td>
                            <td className="px-6 py-4 text-sm">{donor.contactName}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {donor.email}
                            </td>
                            <td className="px-6 py-4 text-sm">{donor.phone}</td>
                            <td className="px-6 py-4 text-sm">
                              {donor.totalDonated > 0
                                ? `${donor.totalDonated.toLocaleString()} lbs`
                                : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {donor.lastDonationDate
                                ? formatDate(donor.lastDonationDate)
                                : '—'}
                            </td>
                            <td className="px-6 py-4">
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y">
                    {paginatedDonors.map((donor) => (
                      <Link
                        key={donor.id}
                        href={`/admin/donors/${donor.id}`}
                        className="block"
                      >
                        <div className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {donor.businessName}
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600">{donor.contactName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {donor.totalDonated > 0
                              ? `${donor.totalDonated.toLocaleString()} lbs donated`
                              : 'No donations yet'}
                            {donor.lastDonationDate &&
                              ` · Last: ${formatDate(donor.lastDonationDate)}`}
                          </p>
                        </div>
                      </Link>
                    ))}
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
