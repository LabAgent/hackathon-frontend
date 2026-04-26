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
          <label htmlFor={id} className="block text-sm font-semibold text-bb-brown-light">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'wooden-input block w-full px-4 py-2.5 text-sm placeholder:text-bb-stone',
            error
              ? 'border-bb-coral focus:border-bb-coral focus:shadow-[inset_0_2px_4px_rgba(90,60,20,0.1),0_0_0_3px_rgba(212,64,64,0.15)]'
              : '',
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-bb-coral font-medium">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
