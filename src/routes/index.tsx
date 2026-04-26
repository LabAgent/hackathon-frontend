import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { UserLayout } from '@/components/layout/UserLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { GuestGuard } from '@/components/guards/GuestGuard';
import { AdminGuard } from '@/components/guards/AdminGuard';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const ResendVerificationPage = lazy(() => import('@/pages/auth/ResendVerificationPage'));
const MfaVerifyPage = lazy(() => import('@/pages/auth/MfaVerifyPage'));

const DashboardPage = lazy(() => import('@/pages/user/DashboardPage'));
const ResearchPage = lazy(() => import('@/pages/user/ResearchPage'));
const ResearchDetailPage = lazy(() => import('@/pages/user/ResearchDetailPage'));
const InventoryPage = lazy(() => import('@/pages/user/InventoryPage'));
const LabAssistantPage = lazy(() => import('@/pages/user/LabAssistantPage'));
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'));
const ChangePasswordPage = lazy(() => import('@/pages/user/ChangePasswordPage'));
const SecurityPage = lazy(() => import('@/pages/user/SecurityPage'));
const MfaSetupPage = lazy(() => import('@/pages/user/MfaSetupPage'));

const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminOverview = lazy(() => import('@/pages/admin/Overview'));
const UsersList = lazy(() => import('@/pages/admin/UsersList'));
const UserDetail = lazy(() => import('@/pages/admin/UserDetail'));
const UserEdit = lazy(() => import('@/pages/admin/UserEdit'));

function LazyPage({ Component }: { Component: LazyExoticComponent<ComponentType> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(180deg, #001e3d 0%, #003660 30%, #005f99 100%)' }}><div className="text-center"><div className="text-5xl mb-4" style={{ animation: 'jellyfish 2s ease-in-out infinite' }}>🪼</div><div className="h-6 w-6 animate-spin rounded-full border-4 border-sponge-400 border-t-transparent mx-auto" /></div></div>}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LazyPage Component={LoginPage} /> },
          { path: 'register', element: <LazyPage Component={RegisterPage} /> },
          { path: 'forgot-password', element: <LazyPage Component={ForgotPasswordPage} /> },
          { path: 'resend-verification', element: <LazyPage Component={ResendVerificationPage} /> },
          { path: 'admin/login', element: <LazyPage Component={AdminLoginPage} /> },
        ],
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [
      { path: 'verify-email', element: <LazyPage Component={VerifyEmailPage} /> },
      { path: 'reset-password', element: <LazyPage Component={ResetPasswordPage} /> },
      { path: 'mfa/verify', element: <LazyPage Component={MfaVerifyPage} /> },
    ],
  },

  {
    element: <AuthGuard />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: 'dashboard', element: <LazyPage Component={DashboardPage} /> },
          { path: 'research', element: <LazyPage Component={ResearchPage} /> },
          { path: 'research/:id', element: <LazyPage Component={ResearchDetailPage} /> },
          { path: 'inventory', element: <LazyPage Component={InventoryPage} /> },
          { path: 'assistant', element: <LazyPage Component={LabAssistantPage} /> },
          { path: 'profile', element: <LazyPage Component={ProfilePage} /> },
          { path: 'profile/password', element: <LazyPage Component={ChangePasswordPage} /> },
          { path: 'security', element: <LazyPage Component={SecurityPage} /> },
          { path: 'security/mfa/setup', element: <LazyPage Component={MfaSetupPage} /> },
        ],
      },
    ],
  },

  {
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin', element: <LazyPage Component={AdminOverview} /> },
          { path: 'admin/users', element: <LazyPage Component={UsersList} /> },
          { path: 'admin/users/:id', element: <LazyPage Component={UserDetail} /> },
          { path: 'admin/users/:id/edit', element: <LazyPage Component={UserEdit} /> },
        ],
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
