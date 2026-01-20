import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';

interface UseRequireAdminOptions {
  redirectTo?: string;
}

export function useRequireAdmin(options: UseRequireAdminOptions = {}) {
  const { redirectTo = '/donor/dashboard' } = options;
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (!isAdmin) {
      router.push(redirectTo);
    }
  }, [user, isAdmin, loading, router, redirectTo]);

  return { user, isAdmin, loading };
}
