import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Truck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import {
  pickupRequestSchema,
  type PickupRequestFormData,
  type PickupRequestFormInput,
} from '@/lib/validations/pickup';
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';

const TIME_WINDOWS = [
  { value: 'morning', label: 'Morning (8am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
  { value: 'evening', label: 'Evening (5pm - 8pm)' },
] as const;

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default function PickupRequestPage() {
  const router = useRouter();
  const { user, donor, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PickupRequestFormInput, unknown, PickupRequestFormData>({
    resolver: zodResolver(pickupRequestSchema),
    defaultValues: {
      useBusinessAddress: true,
      pickupDate: getTodayString(),
      state: 'OH',
      estimatedWeight: '',
    },
  });

  const useBusinessAddress = watch('useBusinessAddress');
  const pickupTimeWindow = watch('pickupTimeWindow');
  const state = watch('state');

  // Redirect if not authenticated or no donor profile
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login?redirect=/donor/request');
        return;
      }
      if (!donor) {
        router.push('/auth/complete-profile');
      }
    }
  }, [user, donor, loading, router]);

  // Pre-fill address from donor profile
  useEffect(() => {
    if (donor && useBusinessAddress) {
      setValue('street', donor.address.street);
      setValue('city', donor.address.city);
      setValue('state', donor.address.state);
      setValue('zip', donor.address.zip);
    }
  }, [donor, useBusinessAddress, setValue]);

  // Pre-fill contact info
  useEffect(() => {
    if (donor) {
      setValue('contactOnArrival', `Call ${donor.phone} or ask for ${donor.contactName}`);
    }
  }, [donor, setValue]);

  const onSubmit = async (data: PickupRequestFormData) => {
    if (!user || !donor) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/pickup-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: user.uid,
          foodDescription: data.foodDescription,
          estimatedWeight: data.estimatedWeight,
          pickupAddress: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
          },
          pickupDate: data.pickupDate,
          pickupTimeWindow: data.pickupTimeWindow,
          contactOnArrival: data.contactOnArrival,
          specialInstructions: data.specialInstructions || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request');
      }

      const result = await response.json();
      toast.success('Pickup request submitted!');
      router.push(`/donor/request/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !donor) {
    return null;
  }

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

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Request a Pickup</CardTitle>
                  <CardDescription>
                    Tell us about your food donation and we&apos;ll arrange a pickup
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Food Description */}
                <div className="space-y-2">
                  <Label htmlFor="foodDescription">
                    What food do you have? <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="foodDescription"
                    placeholder="e.g., 50 lbs prepared sandwiches, 20 lbs mixed salads, 10 lbs fresh fruit"
                    rows={3}
                    {...register('foodDescription')}
                  />
                  {errors.foodDescription && (
                    <p className="text-sm text-red-500">{errors.foodDescription.message}</p>
                  )}
                </div>

                {/* Estimated Weight */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedWeight">
                    Estimated weight (lbs) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="estimatedWeight"
                    type="number"
                    min="1"
                    placeholder="50"
                    {...register('estimatedWeight')}
                  />
                  {errors.estimatedWeight && (
                    <p className="text-sm text-red-500">{errors.estimatedWeight.message}</p>
                  )}
                </div>

                {/* Pickup Address */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>
                      Pickup Address <span className="text-red-500">*</span>
                    </Label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        {...register('useBusinessAddress')}
                      />
                      Use my business address
                    </label>
                  </div>

                  <div className={useBusinessAddress ? 'opacity-60' : ''}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          id="street"
                          placeholder="Street address"
                          disabled={useBusinessAddress}
                          {...register('street')}
                        />
                        {errors.street && (
                          <p className="text-sm text-red-500">{errors.street.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Input
                            id="city"
                            placeholder="City"
                            disabled={useBusinessAddress}
                            {...register('city')}
                          />
                          {errors.city && (
                            <p className="text-sm text-red-500">{errors.city.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Select
                            value={state}
                            onValueChange={(value) => setValue('state', value)}
                            disabled={useBusinessAddress}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.map((st) => (
                                <SelectItem key={st} value={st}>
                                  {st}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.state && (
                            <p className="text-sm text-red-500">{errors.state.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Input
                            id="zip"
                            placeholder="ZIP"
                            disabled={useBusinessAddress}
                            {...register('zip')}
                          />
                          {errors.zip && (
                            <p className="text-sm text-red-500">{errors.zip.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup Date */}
                <div className="space-y-2">
                  <Label htmlFor="pickupDate">
                    Pickup Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    min={getTodayString()}
                    {...register('pickupDate')}
                  />
                  {errors.pickupDate && (
                    <p className="text-sm text-red-500">{errors.pickupDate.message}</p>
                  )}
                </div>

                {/* Time Window */}
                <div className="space-y-2">
                  <Label>
                    Pickup Time Window <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={pickupTimeWindow}
                    onValueChange={(value) =>
                      setValue('pickupTimeWindow', value as 'morning' | 'afternoon' | 'evening')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time window" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_WINDOWS.map((window) => (
                        <SelectItem key={window.value} value={window.value}>
                          {window.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.pickupTimeWindow && (
                    <p className="text-sm text-red-500">{errors.pickupTimeWindow.message}</p>
                  )}
                </div>

                {/* Contact on Arrival */}
                <div className="space-y-2">
                  <Label htmlFor="contactOnArrival">
                    Best way to contact on arrival <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactOnArrival"
                    placeholder="Call 614-555-1234 or ask for Joe at front desk"
                    {...register('contactOnArrival')}
                  />
                  {errors.contactOnArrival && (
                    <p className="text-sm text-red-500">{errors.contactOnArrival.message}</p>
                  )}
                </div>

                {/* Special Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">
                    Special Instructions <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="e.g., Use loading dock, ring buzzer #3, parking in rear"
                    rows={2}
                    {...register('specialInstructions')}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Truck className="mr-2 h-4 w-4" />
                      Request Pickup
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
