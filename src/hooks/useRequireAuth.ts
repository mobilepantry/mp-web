import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';

interface UseRequireAuthOptions {
  redirectTo?: string;
  requireSupplierProfile?: boolean;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/auth/login', requireSupplierProfile = true } = options;
  const { user, supplier, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`${redirectTo}?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (requireSupplierProfile && !supplier && !isAdmin) {
      router.push('/auth/complete-profile');
    }
  }, [user, supplier, loading, isAdmin, router, redirectTo, requireSupplierProfile]);

  return { user, supplier, loading, isAdmin, isAuthenticated: !!user };
}
