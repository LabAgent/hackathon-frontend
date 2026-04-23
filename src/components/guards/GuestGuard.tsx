import { Outlet, Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';

export function GuestGuard() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
}