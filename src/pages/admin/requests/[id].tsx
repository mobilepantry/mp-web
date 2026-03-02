import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Building2,
  Scale,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { Layout } from '@/components/layout';
import { getPickupRequest, updatePickupRequest } from '@/lib/db/pickups';
import { getDonor } from '@/lib/db/donors';
import type { PickupRequest, PickupStatus, Donor } from '@/types';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
} from '@/components/ui';
import { toast } from 'sonner';

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

function formatDate(timestamp: { toDate: () => Date } | Date | undefined): string {
  if (!timestamp) return '—';
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

function formatAddress(address: { street: string; city: string; state: string; zip: string }): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

export default function AdminRequestDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAdmin, loading: authLoading } = useRequireAdmin();
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Complete modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actualWeight, setActualWeight] = useState('');

  // Cancel confirmation state
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id || typeof id !== 'string') return;
      try {
        const requestData = await getPickupRequest(id);
        if (requestData) {
          setRequest(requestData);
          const donorData = await getDonor(requestData.donorId);
          setDonor(donorData);
        }
      } catch (err) {
        console.error('Error fetching request:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user && isAdmin && id) {
      fetchData();
    }
  }, [user, isAdmin, id]);

  async function handleConfirm() {
    if (!request) return;
    setUpdating(true);
    try {
      await updatePickupRequest(request.id, {
        status: 'confirmed',
        confirmedAt: Timestamp.now(),
      });
      setRequest({ ...request, status: 'confirmed', confirmedAt: Timestamp.now() });
      toast.success('Pickup confirmed');
    } catch (err) {
      console.error('Error confirming request:', err);
      toast.error('Failed to confirm pickup');
    } finally {
      setUpdating(false);
    }
  }

  async function handleComplete() {
    if (!request) return;
    const weight = parseFloat(actualWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Please enter a valid weight greater than 0');
      return;
    }
    setUpdating(true);
    try {
      await updatePickupRequest(request.id, {
        status: 'completed',
        actualWeight: weight,
        completedAt: Timestamp.now(),
      });
      setRequest({
        ...request,
        status: 'completed',
        actualWeight: weight,
        completedAt: Timestamp.now(),
      });
      setShowCompleteModal(false);
      setActualWeight('');
      toast.success('Pickup marked as completed');
    } catch (err) {
      console.error('Error completing request:', err);
      toast.error('Failed to complete pickup');
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    if (!request) return;
    setUpdating(true);
    try {
      await updatePickupRequest(request.id, { status: 'cancelled' });
      setRequest({ ...request, status: 'cancelled' });
      setShowCancelDialog(false);
      toast.success('Request cancelled');
    } catch (err) {
      console.error('Error cancelling request:', err);
      toast.error('Failed to cancel request');
    } finally {
      setUpdating(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  if (!request) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-3xl text-center py-20">
            <p className="text-gray-500 mb-4">Request not found</p>
            <Link href="/admin/requests">
              <Button variant="outline">Back to Requests</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const config = STATUS_CONFIG[request.status];
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(formatAddress(request.pickupAddress))}`;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back Link */}
          <div className="mb-6">
            <Link href="/admin/requests">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Requests
              </Button>
            </Link>
          </div>

          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Badge className={`${config.color} text-base px-3 py-1`}>
                {config.label}
              </Badge>
              <span className="text-sm text-gray-500">
                Submitted {formatDate(request.createdAt)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {request.status === 'pending' && (
                <>
                  <Button onClick={handleConfirm} disabled={updating}>
                    {updating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Confirm Pickup
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={updating}
                  >
                    Cancel Request
                  </Button>
                </>
              )}
              {request.status === 'confirmed' && (
                <>
                  <Button onClick={() => setShowCompleteModal(true)} disabled={updating}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={updating}
                  >
                    Cancel Request
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Request Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Pickup Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Food Description</p>
                <p className="text-gray-900">{request.foodDescription}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Weight</p>
                  <p className="text-gray-900">{request.estimatedWeight} lbs</p>
                </div>
                {request.actualWeight && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Actual Weight</p>
                    <p className="text-gray-900 font-medium">{request.actualWeight} lbs</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Pickup Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">
                      {formatAddress(request.pickupAddress)}
                    </p>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Open in Maps
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pickup Date</p>
                  <p className="text-gray-900">{formatDate(request.pickupDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time Window</p>
                  <p className="text-gray-900">
                    {formatTimeWindow(request.pickupTimeWindow)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Contact on Arrival</p>
                <p className="text-gray-900">{request.contactOnArrival}</p>
              </div>

              {request.specialInstructions && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Special Instructions</p>
                  <p className="text-gray-900">{request.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donor Info */}
          {donor && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Donor Information</CardTitle>
                  <Link
                    href={`/admin/donors/${donor.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View donor profile
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">{donor.businessName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{donor.contactName}</span>
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
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${donor.email}`}
                    className="text-primary hover:underline text-sm"
                  >
                    {donor.email}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900">{formatDate(request.createdAt)}</span>
                </div>
                {request.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Confirmed</span>
                    <span className="text-gray-900">{formatDate(request.confirmedAt)}</span>
                  </div>
                )}
                {request.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed</span>
                    <span className="text-gray-900">{formatDate(request.completedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Complete Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Completed</DialogTitle>
            <DialogDescription>
              Enter the actual weight of food rescued from this pickup.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="actualWeight">Actual Weight (lbs)</Label>
            <div className="flex items-center gap-2 mt-2">
              <Scale className="h-4 w-4 text-gray-400" />
              <Input
                id="actualWeight"
                type="number"
                min="1"
                step="0.1"
                placeholder="e.g. 45"
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save &amp; Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this pickup request? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Request
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
