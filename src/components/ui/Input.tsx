import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-semibold text-ocean-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'block w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all duration-200',
            'placeholder:text-ocean-300 bg-white/90',
            'focus:outline-none focus:ring-0 focus:border-sponge-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,215,0,0.15)]',
            error
              ? 'border-krabs-400 focus:border-krabs-400 focus:shadow-[0_0_0_3px_rgba(229,57,53,0.15)]'
              : 'border-ocean-200',
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-krabs-400 font-medium">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
