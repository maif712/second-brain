// src/features/landing/components/Navbar.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, BrainCircuit, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const LINKS = [
    { href: '#how', label: 'How it works' },
    { href: '#features', label: 'Features' },
    { href: '#graph', label: 'Graph' },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-300', scrolled ? 'border-b border-white/5 bg-void/75 backdrop-blur-xl' : 'bg-transparent')}>
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link to="/" className="group flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                        <BrainCircuit size={18} />
                    </span>
                    <span className="font-display text-lg font-semibold tracking-tight text-white">Second Brain</span>
                </Link>

                <div className="hidden items-center gap-1 md:flex">
                    {LINKS.map((l) => (
                        <a key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                            {l.label}
                        </a>
                    ))}
                </div>

                <div className="hidden md:block">
                    <Link to="/dashboard" className="group inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-400/10 px-5 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/20 hover:text-white">
                        Open app
                        <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <button className="rounded-lg border border-white/10 p-2 text-slate-300 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
                    {open ? <X size={18} /> : <Menu size={18} />}
                </button>
            </nav>

            {/* Mobile menu */}
            {open && (
                <div className="border-t border-white/5 bg-void/95 px-6 py-4 backdrop-blur-xl md:hidden">
                    {LINKS.map((l) => (
                        <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                            {l.label}
                        </a>
                    ))}
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="mt-2 block rounded-lg bg-violet-500/20 px-3 py-2.5 text-center text-sm font-semibold text-violet-200">
                        Open app
                    </Link>
                </div>
            )}
        </header>
    );
}