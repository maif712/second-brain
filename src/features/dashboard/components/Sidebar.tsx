// src/features/dashboard/components/Sidebar.tsx
import { Link, NavLink } from 'react-router';
import { BrainCircuit, CalendarClock, LayoutDashboard, Library, Waypoints } from 'lucide-react';
import { useKnowledgeState } from '@/features/knowledge/context/KnowledgeContext';
import { computeHealth, getStale } from '@/features/knowledge/lib/health';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/library', label: 'Library', icon: Library },
  { to: '/dashboard/graph', label: 'Graph', icon: Waypoints },
  { to: '/dashboard/review', label: 'Review', icon: CalendarClock },
];

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { nodes, links } = useKnowledgeState();
  const dueCount = getStale(nodes).length;
  const { score } = computeHealth(nodes, links);

  return (
    <aside className={cn('flex h-full flex-col border-r border-white/5 bg-ink/90 backdrop-blur-xl', className)}>
      <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-600 text-white">
          <BrainCircuit size={16} />
        </span>
        <Link to="/" className="font-display font-semibold text-white">Second Brain</Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end} onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-violet-400/10 text-white ring-1 ring-violet-400/30' : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <span className="flex items-center gap-3"><Icon size={16} /> {label}</span>
            {label === 'Review' && dueCount > 0 && (
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">{dueCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Knowledge Health</span>
          <span className="font-semibold text-white">{score}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-linear-to-r from-violet-400 to-cyan-400 transition-all duration-700" style={{ width: `${score}%` }} />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-600">Everything is stored in localStorage. No account, no server.</p>
      </div>
    </aside>
  );
}