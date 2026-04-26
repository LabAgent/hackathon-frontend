import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  error: 'bg-bb-danger-light text-bb-danger border-bb-coral/30',
  success: 'bg-bb-success-light text-bb-success border-bb-tropical/30',
  warning: 'bg-bb-warning-light text-bb-warning border-bb-pineapple/30',
  info: 'bg-bb-info-light text-bb-info border-bb-ocean/30',
};

export function Alert({ variant = 'info', children, className }: AlertProps) {
  return (
    <div className={cn('rounded-2xl border-2 px-4 py-3 text-sm shadow-warm', variantStyles[variant], className)}>
      {children}
    </div>
  );
}
