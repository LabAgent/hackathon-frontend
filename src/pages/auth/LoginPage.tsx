import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button, Input, ErrorBanner } from '@/components/ui';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginResponse, MfaRequiredResponse } from '@/types';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    login(data, {
      onSuccess: (response) => {
        if ('mfaRequired' in response && response.mfaRequired) {
          useAuthStore.getState().setTempToken((response as MfaRequiredResponse).tempToken);
          navigate('/mfa/verify', { replace: true });
          return;
        }
        const loginResp = response as LoginResponse;
        useAuthStore.getState().login(loginResp.accessToken, loginResp.refreshToken, loginResp.user);
        navigate('/dashboard', { replace: true });
      },
    });
  };

  const state = location.state as { registered?: boolean } | null;

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">🧽</span>
        <h2 className="text-2xl font-bold text-ocean-800 font-[var(--font-display)]">
          Welcome back!
        </h2>
        <p className="text-sm text-ocean-500 mt-1">
          Enter Sandy's Treedome to continue researching
        </p>
      </div>

      {state?.registered && (
        <div className="mb-4 p-3 rounded-xl bg-kelp-50 text-kelp-600 text-sm font-medium border-2 border-kelp-200">
          🎉 Registration successful! Please check your email to verify your account, then sign in.
        </div>
      )}

      <ErrorBanner error={error} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="sandy@bikini-bottom.ocean"
          error={errors.email?.message}
          {...reg('email')}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="Enter your secret formula"
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
        <Button type="submit" loading={isPending} variant="sponge" className="w-full text-base py-3">
          🌊 Dive into the Lab!
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ocean-400">
        New to Bikini Bottom?{' '}
        <Link to="/register" className="text-sponge-500 hover:text-sponge-600 font-bold">
          Join Sandy's Team
        </Link>
      </p>
    </div>
  );
}
