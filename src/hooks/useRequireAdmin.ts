import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';
import { User } from 'firebase/auth';

/**
 * Hook that requires user to be an admin
 * Redirects to donor dashboard if authenticated but not admin
 * Redirects to login if not authenticated
 *
 * @returns User object if authenticated and admin, null during loading
 *
 * @example
 * function AdminDashboard() {
 *   const user = useRequireAdmin();
 *
 *   if (!user) return <div>Loading...</div>;
 *
 *   return <div>Admin Panel for {user.email}</div>;
 * }
 */
export function useRequireAdmin(): User | null {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
      } else if (!isAdmin) {
        // Authenticated but not admin - redirect to donor dashboard
        router.push('/donor/dashboard');
      }
    }
  }, [user, loading, isAdmin, router]);

  // Only return user if they are an admin
  return isAdmin ? user : null;
}
