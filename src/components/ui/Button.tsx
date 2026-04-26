import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'sponge' | 'ocean' | 'patrick';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'sponge', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-[var(--font-display)] tracking-wide';

    const variants = {
      primary: 'bg-bb-ocean text-white border-2 border-bb-ocean-dark hover:bg-bb-ocean-light focus:ring-bb-porthole shadow-warm hover:scale-[1.03] active:scale-[0.98]',
      secondary: 'bg-bb-sand-light/90 text-bb-brown border-2 border-bb-sand-dark hover:bg-bb-sand focus:ring-bb-porthole shadow-warm hover:scale-[1.03] active:scale-[0.98]',
      danger: 'bg-bb-coral text-white border-2 border-bb-danger hover:bg-bb-coral-light focus:ring-bb-coral shadow-warm hover:scale-[1.03] active:scale-[0.98]',
      ghost: 'text-bb-porthole hover:bg-bb-sand/20 focus:ring-bb-porthole hover:scale-[1.03] active:scale-[0.98]',
      sponge: 'bg-gradient-to-r from-bb-pineapple to-bb-pineapple-light text-white border-2 border-bb-pineapple-dark hover:from-bb-pineapple-light hover:to-bb-yellow focus:ring-bb-pineapple shadow-warm hover:scale-[1.03] active:scale-[0.98] hover:shadow-warm-lg',
      ocean: 'bg-gradient-to-r from-bb-ocean to-bb-ocean-light text-white border-2 border-bb-ocean-dark hover:from-bb-ocean-light hover:to-bb-porthole focus:ring-bb-ocean shadow-warm hover:scale-[1.03] active:scale-[0.98] hover:shadow-warm-lg',
      patrick: 'bg-gradient-to-r from-bb-coral to-bb-coral-light text-white border-2 border-bb-danger hover:from-bb-coral-light hover:to-bb-pineapple focus:ring-bb-coral shadow-warm hover:scale-[1.03] active:scale-[0.98] hover:shadow-warm-lg',
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-sm rounded-xl',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base rounded-3xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
