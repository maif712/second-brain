// src/features/landing/components/SpotlightCard.tsx
import { useRef, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);

    const onMove = (e: MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--x', `${e.clientX - r.left}px`);
        el.style.setProperty('--y', `${e.clientY - r.top}px`);
    };

    return (
        <div
            ref={ref}
            data-reveal
            onMouseMove={onMove}
            className={cn(
                'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/5 hover:shadow-2xl hover:shadow-violet-500/10',
                className,
            )}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: 'radial-gradient(480px circle at var(--x, 50%) var(--y, 50%), rgba(139,92,246,0.14), transparent 65%)' }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
}