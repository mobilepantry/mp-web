import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  Phone,
  FileText,
  Scale,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { getPickupRequest } from '@/lib/db/pickups';
import type { PickupRequest, PickupStatus } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '@/components/ui';

const STATUS_CONFIG: Record<
  PickupStatus,
  { label: string; color: string; icon: React.ElementType; message: string }
> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    message: "We've received your request and will confirm shortly.",
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle2,
    message: "Your pickup is confirmed! We'll see you soon.",
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    message: 'Thank you for your donation!',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    message: 'This request was cancelled.',
  },
};

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

function formatDate(timestamp: { toDate: () => Date } | Date): string {
  const date = 'toDate' in timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(timestamp: { toDate: () => Date } | Date): string {
  const date = 'toDate' in timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function RequestDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, donor, loading: authLoading } = useAuth();
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function fetchRequest() {
      if (!id || typeof id !== 'string') return;

      try {
        const data = await getPickupRequest(id);
        if (!data) {
          setError('Request not found');
          return;
        }

        // Check if user owns this request or is admin
        if (user && data.donorId !== user.uid) {
          setError('You do not have permission to view this request');
          return;
        }

        setRequest(data);
      } catch (err) {
        console.error('Error fetching request:', err);
        setError('Failed to load request');
      } finally {
        setLoading(false);
      }
    }

    if (user && id) {
      fetchRequest();
    }
  }, [id, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Link
                  href="/donor/dashboard"
                  className="text-primary hover:underline"
                >
                  Back to Dashboard
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[request.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            href="/donor/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>

          {/* Status Banner */}
          <Card className={`mb-6 border-2 ${statusConfig.color.split(' ')[2]}`}>
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${statusConfig.color.split(' ')[0]}`}
                >
                  <StatusIcon
                    className={`h-6 w-6 ${statusConfig.color.split(' ')[1]}`}
                  />
                </div>
                <div>
                  <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                  <p className="text-gray-700 mt-1">{statusConfig.message}</p>
                  {request.status === 'completed' && request.actualWeight && (
                    <p className="text-green-700 font-medium mt-1">
                      We rescued {request.actualWeight} lbs of food!
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Pickup Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Food Description */}
              <div className="flex gap-4">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Food Description</p>
                  <p className="font-medium">{request.foodDescription}</p>
                </div>
              </div>

              {/* Estimated Weight */}
              <div className="flex gap-4">
                <Scale className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Estimated Weight</p>
                  <p className="font-medium">{request.estimatedWeight} lbs</p>
                  {request.actualWeight && (
                    <p className="text-sm text-green-600">
                      Actual: {request.actualWeight} lbs
                    </p>
                  )}
                </div>
              </div>

              {/* Pickup Address */}
              <div className="flex gap-4">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Pickup Address</p>
                  <p className="font-medium">
                    {request.pickupAddress.street}
                    <br />
                    {request.pickupAddress.city}, {request.pickupAddress.state}{' '}
                    {request.pickupAddress.zip}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${request.pickupAddress.street}, ${request.pickupAddress.city}, ${request.pickupAddress.state} ${request.pickupAddress.zip}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>

              {/* Pickup Date & Time */}
              <div className="flex gap-4">
                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Pickup Date & Time</p>
                  <p className="font-medium">
                    {formatDate(request.pickupDate)}
                    <br />
                    {formatTimeWindow(request.pickupTimeWindow)}
                  </p>
                </div>
              </div>

              {/* Contact on Arrival */}
              <div className="flex gap-4">
                <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contact on Arrival</p>
                  <p className="font-medium">{request.contactOnArrival}</p>
                </div>
              </div>

              {/* Special Instructions */}
              {request.specialInstructions && (
                <div className="flex gap-4">
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Special Instructions</p>
                    <p className="font-medium">{request.specialInstructions}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4 mt-6">
                <p className="text-sm text-gray-500">
                  Submitted: {formatDateTime(request.createdAt)}
                </p>
                {request.confirmedAt && (
                  <p className="text-sm text-gray-500">
                    Confirmed: {formatDateTime(request.confirmedAt)}
                  </p>
                )}
                {request.completedAt && (
                  <p className="text-sm text-gray-500">
                    Completed: {formatDateTime(request.completedAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-6 text-center">
            <Link
              href="/donor/request"
              className="text-primary hover:underline text-sm"
            >
              Submit another pickup request
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
