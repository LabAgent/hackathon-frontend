import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-bb-sand-light/92 backdrop-blur-xl rounded-3xl border-2 border-bb-sand-dark/30 shadow-warm-lg transition-all duration-200 pineapply-panel sandy-texture',
        'hover:shadow-warm-xl',
        className,
      )}
      {...props}
    />
  ),
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4 border-b-2 border-bb-sand/40', className)} {...props} />
  ),
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-bold text-bb-brown font-[var(--font-display)]', className)} {...props} />
  ),
);

CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  ),
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
