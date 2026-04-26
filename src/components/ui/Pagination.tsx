import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const delta = 2;

  for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
    pages.push(i);
  }

  if (page - delta > 2) pages.unshift('...');
  if (page + delta < totalPages - 1) pages.push('...');

  pages.unshift(1);
  if (totalPages > 1) pages.push(totalPages);

  const uniquePages = [...new Set(pages)];

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded-xl border-2 border-bb-sand-dark/30 bg-bb-sand-light/80 text-bb-brown disabled:opacity-50 disabled:pointer-events-none hover:bg-bb-sand hover:scale-[1.03] transition-all font-bold font-[var(--font-display)]"
      >
        Prev
      </button>
      {uniquePages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`dots-${i}`} className="px-2 text-bb-stone">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-xl transition-all font-bold font-[var(--font-display)]',
              p === page
                ? 'bg-bb-pineapple text-white border-2 border-bb-pineapple-dark shadow-warm'
                : 'border-2 border-bb-sand-dark/30 bg-bb-sand-light/80 text-bb-brown hover:bg-bb-sand hover:scale-[1.03]',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-xl border-2 border-bb-sand-dark/30 bg-bb-sand-light/80 text-bb-brown disabled:opacity-50 disabled:pointer-events-none hover:bg-bb-sand hover:scale-[1.03] transition-all font-bold font-[var(--font-display)]"
      >
        Next
      </button>
    </div>
  );
}
