// src/components/ui/toast/ToastContext.tsx
import {
    createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastKind = 'success' | 'info';

interface Toast { id: number; message: string; kind: ToastKind; }
interface ToastContextValue { toast: (message: string, kind?: ToastKind) => void; }

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idRef = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts((t) => t.filter((x) => x.id !== id));
    }, []);

    const toast = useCallback((message: string, kind: ToastKind = 'success') => {
        const id = ++idRef.current;
        setToasts((t) => [...t.slice(-3), { id, message, kind }]); // cap at 4 visible
        window.setTimeout(() => dismiss(id), 3200);
    }, [dismiss]);

    const value = useMemo(() => ({ toast }), [toast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed bottom-5 right-5 z-80 flex w-72 flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            'animate-pop pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl',
                            t.kind === 'success'
                                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                                : 'border-white/10 bg-white/10 text-slate-200',
                        )}
                    >
                        {t.kind === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <Info size={16} className="shrink-0" />}
                        <span className="flex-1">{t.message}</span>
                        <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="opacity-60 transition hover:opacity-100">
                            <X size={13} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}