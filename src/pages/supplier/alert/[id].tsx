import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
  Leaf,
  Tag,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { getSurplusAlert } from '@/lib/db/surplus-alerts';
import type { SurplusAlert, AlertStatus } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '@/components/ui';

const STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; color: string; icon: React.ElementType; message: string }
> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    message: 'Your surplus alert has been received. Our team will confirm pickup shortly.',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle2,
    message: '', // Dynamic — set below based on alert data
  },
  'picked-up': {
    label: 'Picked Up',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Truck,
    message: 'Produce has been picked up and is being processed at our hub.',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    message: '', // Dynamic — set below based on alert data
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    message: 'This alert was cancelled.',
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

function formatDate(timestamp: { toDate: () => Date } | Date | string): string {
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
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

function getGradeLabel(grade: string): string {
  switch (grade) {
    case 'A':
      return 'A — Minor cosmetic';
    case 'B':
      return 'B — Noticeable blemishes, fully edible';
    case 'C':
      return 'C — Very ripe, use immediately';
    default:
      return grade;
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'fruits':
      return 'Fruits';
    case 'vegetables':
      return 'Vegetables';
    case 'leafy-greens':
      return 'Leafy Greens';
    case 'root-vegetables':
      return 'Root Vegetables';
    case 'herbs':
      return 'Herbs';
    case 'mixed':
      return 'Mixed';
    case 'other':
      return 'Other';
    default:
      return category;
  }
}

export default function SupplierAlertDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, supplier, loading: authLoading } = useAuth();
  const [alert, setAlert] = useState<SurplusAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function fetchAlert() {
      if (!id || typeof id !== 'string') return;

      try {
        const data = await getSurplusAlert(id);
        if (!data) {
          setError('Alert not found');
          return;
        }

        // Check if user owns this alert
        if (user && data.supplierId !== user.uid) {
          setError('You do not have permission to view this alert');
          return;
        }

        setAlert(data);
      } catch (err) {
        console.error('Error fetching alert:', err);
        setError('Failed to load alert');
      } finally {
        setLoading(false);
      }
    }

    if (user && id) {
      fetchAlert();
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
                  href="/supplier/dashboard"
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

  if (!alert) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[alert.status];
  const StatusIcon = statusConfig.icon;

  // Build dynamic status message
  let statusMessage = statusConfig.message;
  if (alert.status === 'confirmed') {
    statusMessage = `Pickup confirmed! We'll be there on ${formatDate(alert.pickupDate)} during the ${formatTimeWindow(alert.pickupTimeWindow).toLowerCase()} window.`;
  } else if (alert.status === 'completed' && alert.actualWeightLbs) {
    statusMessage = `Rescue complete! ${alert.actualWeightLbs} lbs of produce rescued.`;
  } else if (alert.status === 'completed') {
    statusMessage = 'Rescue complete! Thank you for your contribution.';
  }

  return (
    <Layout>
      <Head>
        <title>Alert Details | MobilePantry</title>
      </Head>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            href="/supplier/dashboard"
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
                  <p className="text-gray-700 mt-1">{statusMessage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Surplus Alert Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Produce Description */}
              <div className="flex gap-4">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Produce Description</p>
                  <p className="font-medium">{alert.produceDescription}</p>
                </div>
              </div>

              {/* Produce Categories */}
              {alert.produceCategory && alert.produceCategory.length > 0 && (
                <div className="flex gap-4">
                  <Tag className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Categories</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {alert.produceCategory.map((cat) => (
                        <Badge
                          key={cat}
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {getCategoryLabel(cat)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Estimated Weight / Actual Weight */}
              <div className="flex gap-4">
                <Scale className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Estimated Weight</p>
                  <p className="font-medium">{alert.estimatedWeightLbs} lbs</p>
                  {alert.actualWeightLbs && (
                    <p className="text-sm text-green-600">
                      Actual: {alert.actualWeightLbs} lbs
                    </p>
                  )}
                </div>
              </div>

              {/* Case Count */}
              {alert.estimatedCaseCount && (
                <div className="flex gap-4">
                  <Layers className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Case Count</p>
                    <p className="font-medium">{alert.estimatedCaseCount} cases</p>
                  </div>
                </div>
              )}

              {/* Produce Grade */}
              {(alert.produceGrade || alert.actualGrade) && (
                <div className="flex gap-4">
                  <Tag className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Produce Grade</p>
                    {alert.produceGrade && (
                      <p className="font-medium">
                        Estimated: {getGradeLabel(alert.produceGrade)}
                      </p>
                    )}
                    {alert.actualGrade && (
                      <p className="text-sm text-green-600">
                        Actual: {getGradeLabel(alert.actualGrade)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Alert Type */}
              <div className="flex gap-4">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Alert Type</p>
                  <Badge
                    className={
                      alert.alertType === 'standing'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }
                  >
                    {alert.alertType === 'standing' ? 'Standing Weekly Pickup' : 'Ad-hoc (One-time)'}
                  </Badge>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="flex gap-4">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Pickup Address</p>
                  <p className="font-medium">
                    {alert.pickupAddress.street}
                    <br />
                    {alert.pickupAddress.city}, {alert.pickupAddress.state}{' '}
                    {alert.pickupAddress.zip}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${alert.pickupAddress.street}, ${alert.pickupAddress.city}, ${alert.pickupAddress.state} ${alert.pickupAddress.zip}`
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
                    {formatDate(alert.pickupDate)}
                    <br />
                    {formatTimeWindow(alert.pickupTimeWindow)}
                  </p>
                </div>
              </div>

              {/* Contact on Arrival */}
              <div className="flex gap-4">
                <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contact on Arrival</p>
                  <p className="font-medium">{alert.contactOnArrival}</p>
                </div>
              </div>

              {/* Special Instructions */}
              {alert.specialInstructions && (
                <div className="flex gap-4">
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Special Instructions</p>
                    <p className="font-medium">{alert.specialInstructions}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4 mt-6">
                <p className="text-sm text-gray-500">
                  Submitted: {formatDateTime(alert.createdAt)}
                </p>
                {alert.confirmedAt && (
                  <p className="text-sm text-gray-500">
                    Confirmed: {formatDateTime(alert.confirmedAt)}
                  </p>
                )}
                {alert.completedAt && (
                  <p className="text-sm text-gray-500">
                    Completed: {formatDateTime(alert.completedAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-6 text-center">
            <Link
              href="/supplier/alert"
              className="text-primary hover:underline text-sm"
            >
              Submit another surplus alert
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
