import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';
import { User } from 'firebase/auth';

/**
 * Hook that requires user to be authenticated
 * Redirects to login page if not authenticated
 *
 * @returns User object if authenticated, null during loading
 *
 * @example
 * function DonorDashboard() {
 *   const user = useRequireAuth();
 *
 *   if (!user) return <div>Loading...</div>;
 *
 *   return <div>Welcome {user.email}</div>;
 * }
 */
export function useRequireAuth(): User | null {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login, preserving the intended destination
      router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [user, loading, router]);

  return user;
}
