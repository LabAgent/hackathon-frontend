import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-bb-sand/50 text-bb-stone border-bb-sand-dark/30',
      success: 'bg-bb-success-light text-bb-success border-bb-tropical/30',
      danger: 'bg-bb-danger-light text-bb-danger border-bb-coral/30',
      warning: 'bg-bb-warning-light text-bb-warning border-bb-pineapple/30',
      info: 'bg-bb-info-light text-bb-info border-bb-ocean/30',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
