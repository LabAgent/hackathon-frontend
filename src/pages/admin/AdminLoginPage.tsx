import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { Button, Input, ErrorBanner } from '@/components/ui';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginResponse, MfaRequiredResponse } from '@/types';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();
  const [adminError, setAdminError] = useState<string | null>(null);

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    setAdminError(null);
    login(data, {
      onSuccess: (response) => {
        if ('mfaRequired' in response && response.mfaRequired) {
          useAuthStore.getState().setTempToken((response as MfaRequiredResponse).tempToken);
          navigate('/mfa/verify', { replace: true });
          return;
        }
        const loginResp = response as LoginResponse;
        if (loginResp.user?.role !== 'admin') {
          useAuthStore.getState().logout();
          setAdminError('This account does not have admin privileges.');
          return;
        }
        useAuthStore.getState().login(loginResp.accessToken, loginResp.refreshToken, loginResp.user);
        navigate('/admin', { replace: true });
      },
      onError: () => {
        setAdminError('Invalid email or password.');
      },
    });
  };

  return (
    <>
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🦀</div>
        <h2 className="text-2xl font-bold text-ocean-800 font-[var(--font-display)]">Mr. Krabs' Office</h2>
        <p className="text-sm text-ocean-500 mt-1">Admin access only - authorized personnel beyond this point!</p>
      </div>

      <ErrorBanner error={adminError ? new Error(adminError) : error} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="mr-krabs@krusty-krab.ocean"
          error={errors.email?.message}
          {...reg('email')}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="The secret formula..."
          error={errors.password?.message}
          {...reg('password')}
        />
        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-ocean-500 hover:text-ocean-600 font-semibold"
          >
            Forgot password? 🤔
          </Link>
        </div>
        <Button type="submit" loading={isPending} variant="ocean" className="w-full text-base py-3">
          🦀 Enter the Office
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ocean-400">
        Regular researcher?{' '}
        <Link to="/login" className="text-sponge-500 hover:text-sponge-600 font-bold">
          🧽 Sign in here
        </Link>
      </p>
    </>
  );
}
