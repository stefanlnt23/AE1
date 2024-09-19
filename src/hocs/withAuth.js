'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export function withAuth(WrappedComponent) {
  return function AuthComponent(props) {
    const router = useRouter();
    const { user, loading } = useAuth();

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!user) {
      router.push('/auth/login');
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}