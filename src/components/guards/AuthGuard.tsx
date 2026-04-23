import { Outlet, Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';

export function AuthGuard() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}