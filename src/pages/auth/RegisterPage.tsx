import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { Button, Input, ErrorBanner } from '@/components/ui';
import { useRegister } from '@/hooks/useAuth';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register, isPending, error } = useRegister();

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    register(
      { fullName: data.fullName, email: data.email, password: data.password },
      {
        onSuccess: () => {
          navigate('/verify-email', { state: { email: data.email } });
        },
      },
    );
  };

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">🐿️</span>
        <h2 className="text-2xl font-bold text-ocean-800 font-[var(--font-display)]">
          Join the Treedome!
        </h2>
        <p className="text-sm text-ocean-500 mt-1">
          Create your Bikini Bottom research account
        </p>
      </div>

      <ErrorBanner error={error} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          id="fullName"
          placeholder="Sandy Cheeks"
          error={errors.fullName?.message}
          {...reg('fullName')}
        />
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
          placeholder="KrabbyPatty123!"
          error={errors.password?.message}
          {...reg('password')}
        />
        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          placeholder="Repeat your secret formula"
          error={errors.confirmPassword?.message}
          {...reg('confirmPassword')}
        />
        <Button type="submit" loading={isPending} variant="sponge" className="w-full text-base py-3">
          🧪 Create Research Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ocean-400">
        Already a researcher?{' '}
        <Link to="/login" className="text-sponge-500 hover:text-sponge-600 font-bold">
          Dive back in!
        </Link>
      </p>
    </div>
  );
}
