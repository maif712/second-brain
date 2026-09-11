// src/features/dashboard/components/PlaceholderPage.tsx
import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';

export function PlaceholderPage({ title, step, description, icon: Icon }: { title: string; step: string; description: string; icon: LucideIcon }) {
    return (
        <div className="grid min-h-[60vh] place-items-center">
            <div className="max-w-md rounded-2xl border border-dashed border-white/15 bg-white/2 p-10 text-center">
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/30">
                    <Icon size={24} />
                </div>
                <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-400">{description}</p>
                <p className="mt-4 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">Ships in {step}</p>
                <div className="mt-6">
                    <Link to="/dashboard" className="text-sm text-violet-300 hover:text-violet-200">← Back to overview</Link>
                </div>
            </div>
        </div>
    );
}