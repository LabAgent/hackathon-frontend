import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bb-brown/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className={cn(
        'bg-bb-sand-light/95 backdrop-blur-xl rounded-3xl border-2 border-bb-sand-dark/30 shadow-warm-xl w-full max-w-md mx-auto pineapply-panel',
        className,
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-bb-sand/40">
            <h2 className="text-lg font-bold text-bb-brown font-[var(--font-display)]">{title}</h2>
            <button onClick={onClose} className="text-bb-stone hover:text-bb-brown transition-colors rounded-full p-1 hover:bg-bb-sand/30">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
