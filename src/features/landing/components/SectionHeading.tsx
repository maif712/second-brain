// src/features/landing/components/SectionHeading.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function SectionHeading({ eyebrow, title, sub, className }: { eyebrow: string; title: ReactNode; sub?: string; className?: string }) {
    return (
        <div data-reveal className={cn('mx-auto mb-14 max-w-2xl text-center', className)}>
            <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                {eyebrow}
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">{title}</h2>
            {sub && <p className="mt-4 text-base text-slate-400 sm:text-lg">{sub}</p>}
        </div>
    );
}