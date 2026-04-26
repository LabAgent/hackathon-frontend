import { getErrorInfo } from '@/lib/utils';
import type { ErrorCategory } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  error: unknown;
  className?: string;
}

const categoryConfig: Record<
  ErrorCategory,
  { icon: string; containerClass: string; iconClass: string }
> = {
  server: {
    icon: '⚠',
    containerClass: 'bg-bb-danger-light border-bb-coral/30 text-bb-danger',
    iconClass: 'text-bb-coral',
  },
  client: {
    icon: 'ℹ',
    containerClass: 'bg-bb-warning-light border-bb-pineapple/30 text-bb-warning',
    iconClass: 'text-bb-pineapple',
  },
  unknown: {
    icon: '⚠',
    containerClass: 'bg-bb-danger-light border-bb-coral/30 text-bb-danger',
    iconClass: 'text-bb-coral',
  },
};

export function ErrorBanner({ error, className }: ErrorBannerProps) {
  if (!error) return null;

  const { category, message } = getErrorInfo(error);
  const config = categoryConfig[category];

  return (
    <div className={cn('mb-4 rounded-2xl border-2 px-4 py-3 text-sm shadow-warm', config.containerClass, className)}>
      <div className="flex items-start gap-2">
        <span className={cn('shrink-0 text-base leading-5', config.iconClass)}>{config.icon}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
