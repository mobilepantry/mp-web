import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from './auth/login';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace(isAdmin ? '/admin' : '/supplier/dashboard');
    }
  }, [user, loading, isAdmin, router]);

  if (!loading && user) return null;

  return <LoginPage />;
}
