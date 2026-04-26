import { type SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-semibold text-bb-brown-light">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'wooden-input block w-full px-3 py-2 text-sm',
            error
              ? 'border-bb-coral'
              : '',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-bb-coral font-medium">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps };
