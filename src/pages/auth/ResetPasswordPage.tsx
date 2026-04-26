import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router';
import { Button, Input, ErrorBanner } from '@/components/ui';
import { useResetPassword } from '@/hooks/useAuth';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character');

const schema = z
  .object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Code must be 6 digits'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || '';
  const { mutate: resetPassword, isPending, error, isSuccess } = useResetPassword();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register: reg,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: emailFromState,
    },
  });

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setValue('code', newCode.join(''));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 0) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    setValue('code', newCode.join(''));

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const onSubmit = (data: FormData) => {
    resetPassword({ email: data.email, code: data.code, password: data.password });
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-ocean-800 mb-2 font-[var(--font-display)]">Password Reset!</h2>
        <p className="text-kelp-600 mb-6 font-medium">Your secret formula has been reset successfully!</p>
        <Link to="/login">
          <Button variant="sponge">🌊 Dive back in!</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">🔐</span>
        <h2 className="text-2xl font-bold text-ocean-800 font-[var(--font-display)]">Reset Password</h2>
        <p className="text-sm text-ocean-500 mt-1">
          Enter the 6-digit code from your email
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

        <div>
          <label className="block text-sm font-semibold text-ocean-700 mb-2">Reset Code</label>
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-ocean-200 rounded-xl focus:outline-none focus:border-sponge-400 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.15)] transition-all"
              />
            ))}
          </div>
          {errors.code?.message && (
            <p className="mt-1 text-sm text-krabs-400 font-medium">{errors.code.message}</p>
          )}
        </div>

        <Input
          label="New Password"
          id="password"
          type="password"
          placeholder="New secret formula"
          error={errors.password?.message}
          {...reg('password')}
        />
        <Input
          label="Confirm New Password"
          id="confirmPassword"
          type="password"
          placeholder="Confirm secret formula"
          error={errors.confirmPassword?.message}
          {...reg('confirmPassword')}
        />
        <Button type="submit" loading={isPending} variant="sponge" className="w-full">
          🔐 Reset Password
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
