import { Outlet, Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';

export function AdminGuard() {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}