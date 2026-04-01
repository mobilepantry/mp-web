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
import { getAllSuppliers } from '@/lib/db/suppliers';
import { getAllSurplusAlerts } from '@/lib/db/surplus-alerts';
import type { Supplier, SurplusAlert } from '@/types';
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

interface SupplierWithStats extends Supplier {
  totalLbsRescued: number;
  alertCount: number;
  lastActivityDate: Date | null;
}

const PAGE_SIZE = 20;

export default function AdminSuppliersPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useRequireAdmin();
  const [suppliers, setSuppliers] = useState<SupplierWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'rescued'>('recent');
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!user || !isAdmin) return;
      try {
        const [suppliersList, alerts] = await Promise.all([
          getAllSuppliers(),
          getAllSurplusAlerts(),
        ]);

        // Build per-supplier stats from completed alerts
        const supplierStats = new Map<string, { totalLbsRescued: number; alertCount: number; lastDate: Date | null }>();
        for (const alert of alerts) {
          const existing = supplierStats.get(alert.supplierId) || { totalLbsRescued: 0, alertCount: 0, lastDate: null };
          existing.alertCount += 1;
          if (alert.status === 'completed') {
            existing.totalLbsRescued += alert.actualWeightLbs ?? alert.estimatedWeightLbs;
          }
          const createdDate = alert.createdAt
            ? 'toDate' in alert.createdAt
              ? alert.createdAt.toDate()
              : alert.createdAt
            : null;
          if (createdDate && (!existing.lastDate || createdDate > existing.lastDate)) {
            existing.lastDate = createdDate;
          }
          supplierStats.set(alert.supplierId, existing);
        }

        const suppliersWithStats: SupplierWithStats[] = suppliersList.map((s) => {
          const stats = supplierStats.get(s.id);
          return {
            ...s,
            totalLbsRescued: stats?.totalLbsRescued ?? 0,
            alertCount: stats?.alertCount ?? 0,
            lastActivityDate: stats?.lastDate ?? null,
          };
        });

        setSuppliers(suppliersWithStats);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const filteredSuppliers = useMemo(() => {
    let result = suppliers;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.businessName.toLowerCase().includes(q) ||
          s.contactName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.businessName.localeCompare(b.businessName);
        case 'rescued':
          return b.totalLbsRescued - a.totalLbsRescued;
        case 'recent':
        default: {
          const dateA = a.lastActivityDate?.getTime() ?? 0;
          const dateB = b.lastActivityDate?.getTime() ?? 0;
          return dateB - dateA;
        }
      }
    });

    return result;
  }, [suppliers, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredSuppliers.length / PAGE_SIZE);
  const paginatedSuppliers = filteredSuppliers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
            <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-sm text-gray-500">{filteredSuppliers.length} suppliers</p>
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
                Recent
              </Button>
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('name')}
              >
                A-Z
              </Button>
              <Button
                variant={sortBy === 'rescued' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rescued')}
              >
                Top Suppliers
              </Button>
            </div>
          </div>

          {/* Suppliers List */}
          <Card>
            <CardContent className="p-0">
              {paginatedSuppliers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No suppliers match your search' : 'No suppliers yet'}
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
                          <th className="px-6 py-3 font-medium">Lbs Rescued</th>
                          <th className="px-6 py-3 font-medium">Alerts</th>
                          <th className="px-6 py-3 font-medium">Last Activity</th>
                          <th className="px-6 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSuppliers.map((supplier) => (
                          <tr
                            key={supplier.id}
                            className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/admin/suppliers/${supplier.id}`)}
                          >
                            <td className="px-6 py-4 text-sm font-medium">
                              {supplier.businessName}
                            </td>
                            <td className="px-6 py-4 text-sm">{supplier.contactName}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {supplier.email}
                            </td>
                            <td className="px-6 py-4 text-sm">{supplier.phone}</td>
                            <td className="px-6 py-4 text-sm">
                              {supplier.totalLbsRescued > 0
                                ? `${supplier.totalLbsRescued.toLocaleString()} lbs`
                                : '\u2014'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {supplier.alertCount}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {supplier.lastActivityDate
                                ? formatDate(supplier.lastActivityDate)
                                : '\u2014'}
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
                    {paginatedSuppliers.map((supplier) => (
                      <Link
                        key={supplier.id}
                        href={`/admin/suppliers/${supplier.id}`}
                        className="block"
                      >
                        <div className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {supplier.businessName}
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600">{supplier.contactName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {supplier.totalLbsRescued > 0
                              ? `${supplier.totalLbsRescued.toLocaleString()} lbs rescued`
                              : 'No rescues yet'}
                            {' \u00B7 '}{supplier.alertCount} alert{supplier.alertCount !== 1 ? 's' : ''}
                            {supplier.lastActivityDate &&
                              ` \u00B7 Last: ${formatDate(supplier.lastActivityDate)}`}
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
