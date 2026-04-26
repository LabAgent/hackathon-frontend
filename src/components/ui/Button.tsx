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
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-[var(--font-display)]';

    const variants = {
      primary: 'bg-ocean-500 text-white hover:bg-ocean-600 focus:ring-ocean-400 shadow-lg shadow-ocean-500/20',
      secondary: 'bg-white/90 text-ocean-700 border-2 border-ocean-200 hover:bg-ocean-50 focus:ring-ocean-400',
      danger: 'bg-krabs-400 text-white hover:bg-krabs-500 focus:ring-krabs-400 shadow-lg shadow-krabs-400/20',
      ghost: 'text-ocean-300 hover:bg-white/10 focus:ring-ocean-400',
      sponge: 'bg-gradient-to-r from-sponge-400 to-sponge-500 text-ocean-900 hover:from-sponge-300 hover:to-sponge-400 focus:ring-sponge-400 shadow-lg shadow-sponge-400/30',
      ocean: 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white hover:from-ocean-400 hover:to-ocean-500 focus:ring-ocean-400 shadow-lg shadow-ocean-500/25',
      patrick: 'bg-gradient-to-r from-patrick-400 to-patrick-500 text-white hover:from-patrick-300 hover:to-patrick-400 focus:ring-patrick-400 shadow-lg shadow-patrick-400/25',
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-sm rounded-lg',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base rounded-2xl',
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
