import { useContext } from 'react';
import { AuthContext } from '@/lib/auth-context';

/**
 * Hook to access authentication context
 *
 * @returns Authentication context with user, loading state, and auth methods
 * @throws Error if used outside of AuthProvider
 *
 * @example
 * const { user, loading, signIn, signOut } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
