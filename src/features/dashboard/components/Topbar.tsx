// src/features/dashboard/components/Topbar.tsx
import { useLocation } from 'react-router';
import { Menu } from 'lucide-react';

const TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/library': 'Library',
  '/dashboard/graph': 'Knowledge Graph',
  '/dashboard/review': 'Review',
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Item';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-void/80 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} aria-label="Open menu" className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5 lg:hidden">
          <Menu size={18} />
        </button>
        <h1 className="font-display text-lg font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        Local-first · saved to this browser
      </div>
    </header>
  );
}