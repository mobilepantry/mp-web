import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';

interface UseRequireAuthOptions {
  redirectTo?: string;
  requireDonorProfile?: boolean;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/auth/login', requireDonorProfile = true } = options;
  const { user, donor, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`${redirectTo}?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (requireDonorProfile && !donor) {
      router.push('/auth/complete-profile');
    }
  }, [user, donor, loading, router, redirectTo, requireDonorProfile]);

  return { user, donor, loading, isAuthenticated: !!user };
}
