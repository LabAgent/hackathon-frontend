import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Button, Input, ErrorBanner } from '@/components/ui';
import { useResendVerification } from '@/hooks/useAuth';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ResendVerificationPage() {
  const [sent, setSent] = useState(false);
  const { mutate: resend, isPending, error } = useResendVerification();

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    resend(data, {
      onSuccess: () => setSent(true),
    });
  };

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">📧</span>
        <h2 className="text-2xl font-bold text-ocean-800 font-[var(--font-display)]">Resend Verification</h2>
        <p className="text-sm text-ocean-500 mt-1">
          We'll send you a fresh verification code
        </p>
      </div>

      {sent ? (
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-bb-success mb-4 font-medium">Verification code sent! Check your inbox.</p>
          <div className="space-y-2">
            <Link to="/verify-email">
              <Button variant="ocean" className="w-full">Enter Code</Button>
            </Link>
            <Link to="/login" className="block">
              <Button variant="secondary" className="w-full">← Back to Login</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
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
            <Button type="submit" loading={isPending} variant="sponge" className="w-full">
              📧 Resend Code
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-ocean-400">
            <Link to="/login" className="text-bb-pineapple hover:text-bb-pineapple-dark font-bold">
              ← Back to Login
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
