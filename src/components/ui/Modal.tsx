// src/components/ui/Modal.tsx
import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  // ESC to close + body scroll-lock while open (edge cases handled in one place)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close dialog" className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('animate-pop relative w-full overflow-y-auto rounded-2xl border border-white/10 bg-ink p-6 shadow-2xl shadow-black/50 max-h-[90vh]', wide ? 'max-w-2xl' : 'max-w-md')}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}