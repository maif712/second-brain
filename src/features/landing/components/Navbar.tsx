// src/features/landing/components/Navbar.tsx  (rewritten)
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
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav
        className={cn(
          'relative flex w-full max-w-3xl items-center justify-between rounded-full py-2.5 pl-4 pr-2.5 transition-all duration-500',
          scrolled
            ? 'bg-void/85 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl'
            : 'bg-white/4 ring-1 ring-white/6 backdrop-blur-md',
        )}
      >
        <Link to="/" className="group flex items-center gap-2.5 pl-1">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <BrainCircuit size={16} />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-white">Second Brain</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="group hidden items-center gap-1.5 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_28px_-8px] shadow-violet-500/70 transition hover:brightness-110 sm:inline-flex"
          >
            Open app
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <button
            className="grid h-9 w-9 place-items-center rounded-full text-slate-300 transition hover:bg-white/5 hover:text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown — floats under the pill, also edge-free */}
        {open && (
          <div className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-3xl bg-void/95 p-3 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl md:hidden">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
                {l.label}
              </a>
            ))}
            <Link to="/dashboard" onClick={() => setOpen(false)} className="mt-1 block rounded-2xl bg-violet-500/20 px-4 py-3 text-center text-sm font-semibold text-violet-200">
              Open app
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}