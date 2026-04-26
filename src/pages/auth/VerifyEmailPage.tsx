import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router';
import { Button, Input, ErrorBanner } from '@/components/ui';
import { useVerifyEmail, useResendVerification } from '@/hooks/useAuth';

export default function VerifyEmailPage() {
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { mutate: verifyEmail, isPending, error } = useVerifyEmail();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

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

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codeStr = code.join('');
    if (codeStr.length !== 6 || !email) return;

    verifyEmail({ email, code: codeStr }, {
      onSuccess: () => setSuccess(true),
    });
  };

  const handleResend = () => {
    if (!email) return;
    resendVerification({ email }, {
      onSuccess: () => {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      },
    });
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-ocean-800 mb-2 font-[var(--font-display)]">Email Verified!</h2>
        <p className="text-kelp-600 mb-6 font-medium">Welcome to Bikini Bottom! 🌊</p>
        <Link to="/login">
          <Button variant="sponge">🧽 Dive into the Lab!</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">📧</span>
        <h2 className="text-2xl font-bold text-ocean-800 font-[var(--font-display)]">Verify Your Email</h2>
        <p className="text-sm text-ocean-500 mt-1">
          Enter the 6-digit code we sent to your email
        </p>
      </div>

      <ErrorBanner error={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="sandy@bikini-bottom.ocean"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <label className="block text-sm font-semibold text-ocean-700 mb-2">Verification Code</label>
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
        </div>

        <Button type="submit" loading={isPending} variant="sponge" className="w-full" disabled={code.join('').length !== 6 || !email}>
          ✅ Verify Email
        </Button>
      </form>

      <div className="mt-4 text-center">
        {resendSuccess ? (
          <p className="text-kelp-600 text-sm font-medium">📧 A new code has been sent to your email!</p>
        ) : (
          <p className="text-sm text-ocean-400">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={isResending || !email}
              className="text-sponge-500 hover:text-sponge-600 font-bold disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </p>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-ocean-400">
        <Link to="/login" className="text-sponge-500 hover:text-sponge-600 font-bold">
          ← Back to Login
        </Link>
      </p>
    </div>
  );
}
