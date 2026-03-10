import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Leaf, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import {
  surplusAlertSchema,
  type SurplusAlertFormData,
  type SurplusAlertFormInput,
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

const PRODUCE_CATEGORIES = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'leafy-greens', label: 'Leafy Greens' },
  { value: 'root-vegetables', label: 'Root Vegetables' },
  { value: 'herbs', label: 'Herbs' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'other', label: 'Other' },
] as const;

const PRODUCE_GRADES = [
  { value: 'A', label: 'A — Minor cosmetic' },
  { value: 'B', label: 'B — Noticeable blemishes, fully edible' },
  { value: 'C', label: 'C — Very ripe, use immediately' },
] as const;

function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default function SurplusAlertPage() {
  const router = useRouter();
  const { user, supplier, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SurplusAlertFormInput, unknown, SurplusAlertFormData>({
    resolver: zodResolver(surplusAlertSchema),
    defaultValues: {
      useBusinessAddress: true,
      pickupDate: getTodayString(),
      state: 'OH',
      produceCategory: [],
      alertType: 'ad-hoc' as const,
      estimatedWeightLbs: '',
    },
  });

  const useBusinessAddress = watch('useBusinessAddress');
  const pickupTimeWindow = watch('pickupTimeWindow');
  const state = watch('state');
  const produceCategory = watch('produceCategory') || [];
  const alertType = watch('alertType');
  const produceGrade = watch('produceGrade');

  // Redirect if not authenticated or no supplier profile
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login?redirect=/supplier/alert');
        return;
      }
      if (!supplier) {
        router.push('/auth/complete-profile');
      }
    }
  }, [user, supplier, loading, router]);

  // Pre-fill address from supplier profile
  useEffect(() => {
    if (supplier && useBusinessAddress) {
      setValue('street', supplier.address.street);
      setValue('city', supplier.address.city);
      setValue('state', supplier.address.state);
      setValue('zip', supplier.address.zip);
    }
  }, [supplier, useBusinessAddress, setValue]);

  // Pre-fill contact info
  useEffect(() => {
    if (supplier) {
      setValue('contactOnArrival', `Call ${supplier.phone} or ask for ${supplier.contactName}`);
    }
  }, [supplier, setValue]);

  const handleCategoryToggle = (category: string) => {
    const current = produceCategory as string[];
    if (current.includes(category)) {
      setValue(
        'produceCategory',
        current.filter((c) => c !== category) as typeof produceCategory
      );
    } else {
      setValue(
        'produceCategory',
        [...current, category] as typeof produceCategory
      );
    }
  };

  const onSubmit = async (data: SurplusAlertFormData) => {
    if (!user || !supplier) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/surplus-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: user.uid,
          produceDescription: data.produceDescription,
          produceCategory: data.produceCategory,
          estimatedWeightLbs: data.estimatedWeightLbs,
          estimatedCaseCount: data.estimatedCaseCount || undefined,
          produceGrade: data.produceGrade || undefined,
          alertType: data.alertType,
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
        throw new Error(error.message || 'Failed to submit alert');
      }

      const result = await response.json();
      toast.success('Surplus alert submitted!');
      router.push(`/supplier/alert/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit alert');
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

  if (!user || !supplier) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Submit Surplus Alert | MobilePantry</title>
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

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Submit Surplus Alert</CardTitle>
                  <CardDescription>
                    Tell us about available surplus produce and we&apos;ll arrange a pickup
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Produce Description */}
                <div className="space-y-2">
                  <Label htmlFor="produceDescription">
                    What produce is available? <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="produceDescription"
                    placeholder="e.g., 20 cases mixed stone fruit, 10 cases romaine lettuce — cosmetic only"
                    rows={3}
                    {...register('produceDescription')}
                  />
                  {errors.produceDescription && (
                    <p className="text-sm text-red-500">{errors.produceDescription.message}</p>
                  )}
                </div>

                {/* Produce Category (multi-select checkboxes) */}
                <div className="space-y-2">
                  <Label>
                    Produce category <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRODUCE_CATEGORIES.map((cat) => (
                      <label
                        key={cat.value}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          (produceCategory as string[]).includes(cat.value)
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          checked={(produceCategory as string[]).includes(cat.value)}
                          onChange={() => handleCategoryToggle(cat.value)}
                        />
                        <span className="text-sm">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.produceCategory && (
                    <p className="text-sm text-red-500">{errors.produceCategory.message}</p>
                  )}
                </div>

                {/* Estimated Weight */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedWeightLbs">
                    Estimated weight (lbs) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="estimatedWeightLbs"
                    type="number"
                    min="1"
                    placeholder="500"
                    {...register('estimatedWeightLbs')}
                  />
                  {errors.estimatedWeightLbs && (
                    <p className="text-sm text-red-500">{errors.estimatedWeightLbs.message}</p>
                  )}
                </div>

                {/* Estimated Case Count */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedCaseCount">
                    Estimated case count <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Input
                    id="estimatedCaseCount"
                    type="number"
                    min="1"
                    placeholder="30"
                    {...register('estimatedCaseCount')}
                  />
                  {errors.estimatedCaseCount && (
                    <p className="text-sm text-red-500">{errors.estimatedCaseCount.message}</p>
                  )}
                </div>

                {/* Produce Grade */}
                <div className="space-y-2">
                  <Label>
                    Produce grade <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Select
                    value={produceGrade}
                    onValueChange={(value) =>
                      setValue('produceGrade', value as 'A' | 'B' | 'C')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How would you rate the condition?" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCE_GRADES.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Alert Type */}
                <div className="space-y-2">
                  <Label>
                    Alert type <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        className="text-primary focus:ring-primary"
                        value="ad-hoc"
                        checked={alertType === 'ad-hoc'}
                        onChange={() => setValue('alertType', 'ad-hoc')}
                      />
                      <div>
                        <span className="text-sm font-medium">One-time surplus (ad-hoc)</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        className="text-primary focus:ring-primary"
                        value="standing"
                        checked={alertType === 'standing'}
                        onChange={() => setValue('alertType', 'standing')}
                      />
                      <div>
                        <span className="text-sm font-medium">Standing weekly pickup</span>
                        <p className="text-xs text-gray-500">
                          We&apos;ll pick up at the same time every week
                        </p>
                      </div>
                    </label>
                  </div>
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
                    placeholder="Call 614-555-1234 or ask for warehouse manager"
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
                    placeholder="e.g., Use loading dock B, bring your own bins, product is on pallets"
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
                      <Leaf className="mr-2 h-4 w-4" />
                      Submit Surplus Alert
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
