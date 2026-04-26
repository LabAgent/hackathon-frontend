import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { Button, Input, ErrorBanner } from '@/components/ui';
import { useForgotPassword } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    forgotPassword(data, {
      onSuccess: () => {
        navigate('/reset-password', { state: { email: data.email } });
      },
    });
  };

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">🔑</span>
        <h2 className="text-2xl font-bold text-ocean-800 font-[var(--font-display)]">Forgot Password?</h2>
        <p className="text-sm text-ocean-500 mt-1">
          Even Patrick forgets things sometimes! We'll send you a reset code.
        </p>
      </div>

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
          📧 Send Reset Code
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-ocean-400">
        <Link to="/login" className="text-sponge-500 hover:text-sponge-600 font-bold">
          ← Back to Login
        </Link>
      </p>
    </div>
  );
}
