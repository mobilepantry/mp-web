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
} from 'lucide-react';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { Layout } from '@/components/layout';
import { getDonor } from '@/lib/db/donors';
import { getPickupRequestsByDonor } from '@/lib/db/pickups';
import { getDonorStats } from '@/lib/db/stats';
import type { Donor, PickupRequest, PickupStatus } from '@/types';
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
  { label: string; color: string }
> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  grocery: 'Grocery Store',
  caterer: 'Caterer',
  bakery: 'Bakery',
  corporate: 'Corporate Cafeteria',
  other: 'Other',
};

function formatDate(timestamp: { toDate: () => Date } | Date): string {
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

export default function AdminDonorDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAdmin, loading: authLoading } = useRequireAdmin();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [stats, setStats] = useState<{ totalPounds: number; totalRescues: number }>({
    totalPounds: 0,
    totalRescues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id || typeof id !== 'string') return;
      try {
        const [donorData, requestsData, statsData] = await Promise.all([
          getDonor(id),
          getPickupRequestsByDonor(id),
          getDonorStats(id),
        ]);
        setDonor(donorData);
        setRequests(requestsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching donor:', err);
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

  if (!donor) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-3xl text-center py-20">
            <p className="text-gray-500 mb-4">Donor not found</p>
            <Link href="/admin/donors">
              <Button variant="outline">Back to Donors</Button>
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
            <Link href="/admin/donors">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Donors
              </Button>
            </Link>
          </div>

          {/* Donor Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{donor.businessName}</h1>
            <p className="text-gray-500 mt-1">
              Member since {formatDate(donor.createdAt)}
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
                    <p className="text-sm text-gray-500">Total Donations</p>
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
                  {BUSINESS_TYPE_LABELS[donor.businessType] || donor.businessType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {donor.contactName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href={`mailto:${donor.email}`}
                  className="text-primary hover:underline text-sm"
                >
                  {donor.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href={`tel:${donor.phone}`}
                  className="text-primary hover:underline text-sm"
                >
                  {donor.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">
                  {formatAddress(donor.address)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Donation History</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pickup requests yet</p>
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
                          <th className="pb-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => {
                          const config = STATUS_CONFIG[request.status];
                          return (
                            <tr
                              key={request.id}
                              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                router.push(`/admin/requests/${request.id}`)
                              }
                            >
                              <td className="py-3 text-sm">
                                {formatDate(request.createdAt)}
                              </td>
                              <td className="py-3 text-sm max-w-[200px] truncate">
                                {request.foodDescription}
                              </td>
                              <td className="py-3 text-sm">
                                {request.actualWeight ?? request.estimatedWeight} lbs
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
                    {requests.map((request) => {
                      const config = STATUS_CONFIG[request.status];
                      return (
                        <Link
                          key={request.id}
                          href={`/admin/requests/${request.id}`}
                          className="block"
                        >
                          <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-500">
                                {formatDate(request.createdAt)}
                              </span>
                              <Badge className={config.color}>{config.label}</Badge>
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
