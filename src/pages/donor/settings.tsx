import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Loader2,
  ArrowLeft,
  Building2,
  Lock,
  Mail,
} from 'lucide-react';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { updateDonor } from '@/lib/db/donors';
import type { BusinessType } from '@/types';
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
} from '@/components/ui';

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'grocery', label: 'Grocery Store' },
  { value: 'caterer', label: 'Caterer' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'corporate', label: 'Corporate Cafeteria' },
  { value: 'other', label: 'Other' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const profileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
  businessType: z.enum(
    ['restaurant', 'grocery', 'caterer', 'bakery', 'corporate', 'other'],
    { message: 'Business type is required' }
  ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

function isEmailPasswordUser(providerData: { providerId: string }[]): boolean {
  return providerData.some((p) => p.providerId === 'password');
}

export default function DonorSettingsPage() {
  const router = useRouter();
  const { user, donor, loading: authLoading, refreshDonor } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    watch: watchProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const businessType = watchProfile('businessType');
  const state = watchProfile('state');

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/donor/settings');
        return;
      }
      if (!donor) {
        router.push('/auth/complete-profile');
      }
    }
  }, [user, donor, authLoading, router]);

  // Pre-fill profile form with current donor data
  useEffect(() => {
    if (donor) {
      resetProfile({
        businessName: donor.businessName,
        contactName: donor.contactName,
        phone: donor.phone,
        street: donor.address.street,
        city: donor.address.city,
        state: donor.address.state,
        zip: donor.address.zip,
        businessType: donor.businessType,
      });
    }
  }, [donor, resetProfile]);

  const onSaveProfile = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSavingProfile(true);
    try {
      await updateDonor(user.uid, {
        businessName: data.businessName,
        contactName: data.contactName,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
        },
        businessType: data.businessType,
      });
      await refreshDonor();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    if (!user || !user.email) return;

    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        data.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, data.newPassword);
      resetPassword();
      toast.success('Password changed successfully');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect');
      } else {
        console.error('Error changing password:', error);
        toast.error('Failed to change password. Please try again.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !donor) {
    return null;
  }

  const isEmailUser = isEmailPasswordUser(user.providerData);
  const isGoogleUser = user.providerData.some(
    (p) => p.providerId === 'google.com'
  );

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

          <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

          {/* Business Profile */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Business Profile</CardTitle>
                  <CardDescription>
                    Update your business information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleProfileSubmit(onSaveProfile)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Your Business"
                      {...registerProfile('businessName')}
                    />
                    {profileErrors.businessName && (
                      <p className="text-sm text-red-500">
                        {profileErrors.businessName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      placeholder="John Doe"
                      {...registerProfile('contactName')}
                    />
                    {profileErrors.contactName && (
                      <p className="text-sm text-red-500">
                        {profileErrors.contactName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="6145551234"
                    {...registerProfile('phone')}
                  />
                  {profileErrors.phone && (
                    <p className="text-sm text-red-500">
                      {profileErrors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    placeholder="123 Main St"
                    {...registerProfile('street')}
                  />
                  {profileErrors.street && (
                    <p className="text-sm text-red-500">
                      {profileErrors.street.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Columbus"
                      {...registerProfile('city')}
                    />
                    {profileErrors.city && (
                      <p className="text-sm text-red-500">
                        {profileErrors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={state}
                      onValueChange={(value) =>
                        setProfileValue('state', value)
                      }
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
                    {profileErrors.state && (
                      <p className="text-sm text-red-500">
                        {profileErrors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input
                      id="zip"
                      placeholder="43215"
                      {...registerProfile('zip')}
                    />
                    {profileErrors.zip && (
                      <p className="text-sm text-red-500">
                        {profileErrors.zip.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={businessType}
                    onValueChange={(value) =>
                      setProfileValue('businessType', value as BusinessType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {profileErrors.businessType && (
                    <p className="text-sm text-red-500">
                      {profileErrors.businessType.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account credentials
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Display */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-md">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
              </div>

              {/* Auth Provider Info */}
              {isGoogleUser && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    Signed in with Google. Password management is handled by
                    your Google account.
                  </p>
                </div>
              )}

              {/* Change Password (email/password users only) */}
              {isEmailUser && (
                <form
                  onSubmit={handlePasswordSubmit(onChangePassword)}
                  className="space-y-4 border-t pt-6"
                >
                  <h3 className="font-medium text-gray-900">Change Password</h3>

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...registerPassword('currentPassword')}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...registerPassword('newPassword')}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...registerPassword('confirmPassword')}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" variant="outline" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
