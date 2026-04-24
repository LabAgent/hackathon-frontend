import { Outlet, Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';

function getRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonPayload);
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function AdminGuard() {
  const { isAuthenticated, accessToken } = useAuthStore();
  const tokenRole = getRoleFromToken(accessToken);
  const isAdmin = tokenRole === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}