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
    containerClass: 'bg-red-50 border-red-200 text-red-800',
    iconClass: 'text-red-500',
  },
  client: {
    icon: 'ℹ',
    containerClass: 'bg-amber-50 border-amber-200 text-amber-800',
    iconClass: 'text-amber-500',
  },
  unknown: {
    icon: '⚠',
    containerClass: 'bg-red-50 border-red-200 text-red-800',
    iconClass: 'text-red-500',
  },
};

export function ErrorBanner({ error, className }: ErrorBannerProps) {
  if (!error) return null;

  const { category, message } = getErrorInfo(error);
  const config = categoryConfig[category];

  return (
    <div className={cn('mb-4 rounded-lg border px-4 py-3 text-sm', config.containerClass, className)}>
      <div className="flex items-start gap-2">
        <span className={cn('shrink-0 text-base leading-5', config.iconClass)}>{config.icon}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}