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
  Phone,
  Mail,
  Building2,
  Scale,
  Thermometer,
  AlertTriangle,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { Layout } from '@/components/layout';
import { getSurplusAlert, updateAlertStatus } from '@/lib/db/surplus-alerts';
import { getSupplier } from '@/lib/db/suppliers';
import type { SurplusAlert, AlertStatus, Supplier, ProduceGrade } from '@/types';
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
  AlertStatus,
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
  'picked-up': {
    label: 'Picked Up',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Truck,
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

function formatDate(timestamp: { toDate: () => Date } | Date | string | undefined): string {
  if (!timestamp) return '\u2014';
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
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

function getTempColor(temp: number): string {
  if (temp <= 38) return 'text-green-600';
  if (temp <= 41) return 'text-yellow-600';
  return 'text-red-600';
}

export default function AdminRequestDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAdmin, loading: authLoading } = useRequireAdmin();
  const [alert, setAlert] = useState<SurplusAlert | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Complete modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actualWeightLbs, setActualWeightLbs] = useState('');
  const [temperatureAtPickup, setTemperatureAtPickup] = useState('');
  const [actualGrade, setActualGrade] = useState<ProduceGrade | ''>('');

  // Cancel confirmation state
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id || typeof id !== 'string') return;
      try {
        const alertData = await getSurplusAlert(id);
        if (alertData) {
          setAlert(alertData);
          const supplierData = await getSupplier(alertData.supplierId);
          setSupplier(supplierData);
        }
      } catch (err) {
        console.error('Error fetching alert:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user && isAdmin && id) {
      fetchData();
    }
  }, [user, isAdmin, id]);

  async function handleConfirm() {
    if (!alert) return;
    setUpdating(true);
    try {
      await updateAlertStatus(alert.id, 'confirmed', {
        confirmedAt: Timestamp.now(),
      });
      setAlert({ ...alert, status: 'confirmed' });
      toast.success('Alert confirmed');
    } catch (err) {
      console.error('Error confirming alert:', err);
      toast.error('Failed to confirm alert');
    } finally {
      setUpdating(false);
    }
  }

  async function handlePickedUp() {
    if (!alert) return;
    setUpdating(true);
    try {
      await updateAlertStatus(alert.id, 'picked-up', {
        pickedUpAt: Timestamp.now(),
      });
      setAlert({ ...alert, status: 'picked-up' });
      toast.success('Marked as picked up');
    } catch (err) {
      console.error('Error marking as picked up:', err);
      toast.error('Failed to mark as picked up');
    } finally {
      setUpdating(false);
    }
  }

  async function handleComplete() {
    if (!alert) return;
    const weight = parseFloat(actualWeightLbs);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Please enter a valid weight greater than 0');
      return;
    }
    const temp = parseFloat(temperatureAtPickup);
    if (isNaN(temp)) {
      toast.error('Please enter a valid temperature');
      return;
    }
    if (!actualGrade) {
      toast.error('Please select a produce grade');
      return;
    }
    setUpdating(true);
    try {
      await updateAlertStatus(alert.id, 'completed', {
        actualWeightLbs: weight,
        temperatureAtPickup: temp,
        actualGrade: actualGrade as ProduceGrade,
        completedAt: Timestamp.now(),
      });
      setAlert({
        ...alert,
        status: 'completed',
        actualWeightLbs: weight,
        temperatureAtPickup: temp,
        actualGrade: actualGrade as ProduceGrade,
      });
      setShowCompleteModal(false);
      setActualWeightLbs('');
      setTemperatureAtPickup('');
      setActualGrade('');
      toast.success('Alert marked as completed');
    } catch (err) {
      console.error('Error completing alert:', err);
      toast.error('Failed to complete alert');
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    if (!alert) return;
    setUpdating(true);
    try {
      await updateAlertStatus(alert.id, 'cancelled');
      setAlert({ ...alert, status: 'cancelled' });
      setShowCancelDialog(false);
      toast.success('Alert cancelled');
    } catch (err) {
      console.error('Error cancelling alert:', err);
      toast.error('Failed to cancel alert');
    } finally {
      setUpdating(false);
    }
  }

  const tempValue = parseFloat(temperatureAtPickup);
  const showTempWarning = !isNaN(tempValue) && tempValue > 41;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  if (!alert) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-3xl text-center py-20">
            <p className="text-gray-500 mb-4">Alert not found</p>
            <Link href="/admin/requests">
              <Button variant="outline">Back to Alerts</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const config = STATUS_CONFIG[alert.status];
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(formatAddress(alert.pickupAddress))}`;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back Link */}
          <div className="mb-6">
            <Link href="/admin/requests">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Alerts
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
                Submitted {formatDate(alert.createdAt)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {alert.status === 'pending' && (
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
                    Cancel Alert
                  </Button>
                </>
              )}
              {alert.status === 'confirmed' && (
                <>
                  <Button onClick={handlePickedUp} disabled={updating}>
                    {updating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Truck className="mr-2 h-4 w-4" />
                    )}
                    Mark Picked Up
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={updating}
                  >
                    Cancel Alert
                  </Button>
                </>
              )}
              {alert.status === 'picked-up' && (
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
                    Cancel Alert
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Produce Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Produce Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Produce Description</p>
                <p className="text-gray-900">{alert.produceDescription}</p>
              </div>

              {alert.produceCategory && alert.produceCategory.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {alert.produceCategory.map((cat) => (
                      <Badge key={cat} className="bg-gray-100 text-gray-700 border-gray-200">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Weight</p>
                  <p className="text-gray-900">{alert.estimatedWeightLbs} lbs</p>
                </div>
                {alert.actualWeightLbs != null && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Actual Weight</p>
                    <p className="text-gray-900 font-medium">{alert.actualWeightLbs} lbs</p>
                  </div>
                )}
              </div>

              {alert.estimatedCaseCount != null && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Case Count</p>
                  <p className="text-gray-900">{alert.estimatedCaseCount}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {alert.produceGrade && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Supplier Grade Estimate</p>
                    <p className="text-gray-900">Grade {alert.produceGrade}</p>
                  </div>
                )}
                {alert.actualGrade && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Actual Grade</p>
                    <p className="text-gray-900 font-medium">Grade {alert.actualGrade}</p>
                  </div>
                )}
              </div>

              {alert.temperatureAtPickup != null && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Temperature at Pickup</p>
                  <p className={`font-medium ${getTempColor(alert.temperatureAtPickup)}`}>
                    {alert.temperatureAtPickup}{'\u00B0'}F
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Alert Type</p>
                <Badge className={
                  alert.alertType === 'standing'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }>
                  {alert.alertType === 'standing' ? 'Standing Weekly' : 'Ad-hoc'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Logistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Pickup Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pickup Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">
                      {formatAddress(alert.pickupAddress)}
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
                  <p className="text-gray-900">{formatDate(alert.pickupDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time Window</p>
                  <p className="text-gray-900">
                    {formatTimeWindow(alert.pickupTimeWindow)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Contact on Arrival</p>
                <p className="text-gray-900">{alert.contactOnArrival}</p>
              </div>

              {alert.specialInstructions && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Special Instructions</p>
                  <p className="text-gray-900">{alert.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier Info */}
          {supplier && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Supplier Information</CardTitle>
                  <Link
                    href={`/admin/suppliers/${supplier.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View supplier profile
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">{supplier.businessName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{supplier.contactName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a
                    href={`tel:${supplier.phone}`}
                    className="text-primary hover:underline text-sm"
                  >
                    {supplier.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${supplier.email}`}
                    className="text-primary hover:underline text-sm"
                  >
                    {supplier.email}
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
                  <span className="text-gray-900">{formatDate(alert.createdAt)}</span>
                </div>
                {(alert as any).confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Confirmed</span>
                    <span className="text-gray-900">{formatDate((alert as any).confirmedAt)}</span>
                  </div>
                )}
                {(alert as any).pickedUpAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Picked Up</span>
                    <span className="text-gray-900">{formatDate((alert as any).pickedUpAt)}</span>
                  </div>
                )}
                {(alert as any).completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed</span>
                    <span className="text-gray-900">{formatDate((alert as any).completedAt)}</span>
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
              Enter the actual weight, temperature, and grade for this pickup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="actualWeightLbs">Actual Weight (lbs) *</Label>
              <div className="flex items-center gap-2 mt-2">
                <Scale className="h-4 w-4 text-gray-400" />
                <Input
                  id="actualWeightLbs"
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder="e.g. 45"
                  value={actualWeightLbs}
                  onChange={(e) => setActualWeightLbs(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="temperatureAtPickup">Temperature at Pickup (&deg;F) *</Label>
              <div className="flex items-center gap-2 mt-2">
                <Thermometer className="h-4 w-4 text-gray-400" />
                <Input
                  id="temperatureAtPickup"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 38"
                  value={temperatureAtPickup}
                  onChange={(e) => setTemperatureAtPickup(e.target.value)}
                />
              </div>
              {showTempWarning && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    Temperature exceeds 41&deg;F. Per SOP, reject if rapid cooling isn&apos;t possible within 30 min.
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="actualGrade">Actual Produce Grade *</Label>
              <select
                id="actualGrade"
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={actualGrade}
                onChange={(e) => setActualGrade(e.target.value as ProduceGrade | '')}
              >
                <option value="">Select grade...</option>
                <option value="A">A — Minor cosmetic</option>
                <option value="B">B — Noticeable blemishes, fully edible</option>
                <option value="C">C — Very ripe, use immediately</option>
              </select>
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
            <DialogTitle>Cancel Alert</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this surplus alert? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Alert
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Cancel Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
