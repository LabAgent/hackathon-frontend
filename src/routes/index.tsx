import { createBrowserRouter, Navigate } from 'react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { UserLayout } from '@/components/layout/UserLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { GuestGuard } from '@/components/guards/GuestGuard';
import { AdminGuard } from '@/components/guards/AdminGuard';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ResendVerificationPage from '@/pages/auth/ResendVerificationPage';
import MfaVerifyPage from '@/pages/auth/MfaVerifyPage';

import DashboardPage from '@/pages/user/DashboardPage';
import ProfilePage from '@/pages/user/ProfilePage';
import ChangePasswordPage from '@/pages/user/ChangePasswordPage';
import SecurityPage from '@/pages/user/SecurityPage';
import MfaSetupPage from '@/pages/user/MfaSetupPage';

import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminOverview from '@/pages/admin/Overview';
import UsersList from '@/pages/admin/UsersList';
import UserDetail from '@/pages/admin/UserDetail';
import UserEdit from '@/pages/admin/UserEdit';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // Auth routes (guest only)
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'resend-verification', element: <ResendVerificationPage /> },
          { path: 'admin/login', element: <AdminLoginPage /> },
        ],
      },
    ],
  },

  // Auth routes (no guard - accessible anytime)
  {
    element: <AuthLayout />,
    children: [
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'mfa/verify', element: <MfaVerifyPage /> },
    ],
  },

  // Authenticated user routes
  {
    element: <AuthGuard />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/password', element: <ChangePasswordPage /> },
          { path: 'security', element: <SecurityPage /> },
          { path: 'security/mfa/setup', element: <MfaSetupPage /> },
        ],
      },
    ],
  },

  // Admin routes (admin only, WordPress-like layout)
  {
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin', element: <AdminOverview /> },
          { path: 'admin/users', element: <UsersList /> },
          { path: 'admin/users/:id', element: <UserDetail /> },
          { path: 'admin/users/:id/edit', element: <UserEdit /> },
        ],
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);