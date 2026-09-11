// src/features/dashboard/pages/OverviewPage.tsx
import { useMemo } from 'react';
import { BrainCircuit, CalendarClock, CircleHelp, Database, HeartPulse, type LucideIcon } from 'lucide-react';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { computeHealth, getStale, getUnanswered } from '@/features/knowledge/lib/health';
import { daysSince, timeAgo } from '@/features/knowledge/lib/format';
import { HealthRing } from '@/components/ui/HealthRing';
import { NodeListItem } from '@/features/knowledge/components/NodeListItem';

function Panel({ title, icon: Icon, hint, children }: { title: string; icon: LucideIcon; hint?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-white/5 bg-white/2 p-5">
            <header className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                    <Icon size={15} className="text-violet-300" /> {title}
                </h2>
                {hint && <span className="text-xs text-slate-500">{hint}</span>}
            </header>
            <div className="space-y-2">{children}</div>
        </section>
    );
}

export default function OverviewPage() {
    const { nodes, links } = useKnowledgeState();
    const { resetToSeed } = useKnowledgeActions();

    const health = useMemo(() => computeHealth(nodes, links), [nodes, links]);
    const stale = useMemo(() => getStale(nodes), [nodes]);
    const openQuestions = useMemo(() => getUnanswered(nodes), [nodes]);
    const recent = useMemo(
        () => [...nodes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
        [nodes],
    );

    // Edge case: user cleared everything — offer a one-click demo restore.
    if (nodes.length === 0) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <div className="max-w-md rounded-2xl border border-dashed border-white/15 bg-white/2 p-10 text-center">
                    <BrainCircuit size={32} className="mx-auto text-violet-400" />
                    <h2 className="mt-4 font-display text-xl font-semibold text-white">Your brain is empty</h2>
                    <p className="mt-2 text-sm text-slate-400">Start capturing knowledge in the Library, or restore the demo dataset to explore.</p>
                    <button onClick={resetToSeed} className="mt-6 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110">
                        Restore demo data
                    </button>
                </div>
            </div>
        );
    }

    const stats: { label: string; value: number; icon: LucideIcon; accent: string }[] = [
        { label: 'Knowledge items', value: nodes.length, icon: Database, accent: 'text-violet-300' },
        { label: 'Connections', value: links.length, icon: HeartPulse, accent: 'text-cyan-300' },
        { label: 'Open questions', value: openQuestions.length, icon: CircleHelp, accent: 'text-amber-300' },
        { label: 'Needs review', value: stale.length, icon: CalendarClock, accent: 'text-rose-300' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-white">Overview</h2>
                <p className="mt-1 text-sm text-slate-400">Here's the current state of your second brain.</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="rounded-2xl border border-white/5 bg-white/3 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">{s.label}</span>
                                <Icon size={16} className={s.accent} />
                            </div>
                            <div className="mt-3 font-display text-3xl font-bold text-white">{s.value}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Panel title="Needs review" icon={CalendarClock} hint={`${stale.length} item${stale.length === 1 ? '' : 's'} fading`}>
                        {stale.length === 0 ? (
                            <p className="py-4 text-center text-sm text-slate-500">Nothing is fading. Nice work. 🎉</p>
                        ) : (
                            stale.slice(0, 5).map((n) => (
                                <NodeListItem
                                    key={n.id}
                                    node={n}
                                    meta={
                                        <span className="shrink-0 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300 ring-1 ring-amber-400/30">
                                            {daysSince(n.lastReviewedAt) === Infinity ? 'never' : `${daysSince(n.lastReviewedAt)}d`}
                                        </span>
                                    }
                                />
                            ))
                        )}
                    </Panel>

                    <Panel title="Unanswered questions" icon={CircleHelp} hint={`${openQuestions.length} open`}>
                        {openQuestions.length === 0 ? (
                            <p className="py-4 text-center text-sm text-slate-500">Every question answered. Impressive.</p>
                        ) : (
                            openQuestions.slice(0, 4).map((n) => (
                                <NodeListItem key={n.id} node={n} meta={<span className="shrink-0 text-xs text-slate-500">asked {timeAgo(n.createdAt)}</span>} />
                            ))
                        )}
                    </Panel>
                </div>

                <div className="space-y-6">
                    <Panel title="Knowledge Health" icon={HeartPulse}>
                        <div className="flex flex-col items-center gap-6 pb-2">
                            <HealthRing score={health.score} />
                            <div className="w-full space-y-3">
                                {health.parts.map((p) => (
                                    <div key={p.key}>
                                        <div className="mb-1 flex justify-between text-xs">
                                            <span className="text-slate-400">{p.label}</span>
                                            <span className="text-slate-300">{Math.round(p.value * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/10">
                                            <div className="h-full rounded-full bg-linear-to-r from-violet-400 to-cyan-400 transition-all duration-700" style={{ width: `${p.value * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Recently updated" icon={Database}>
                        {recent.map((n) => (
                            <NodeListItem key={n.id} node={n} meta={<span className="shrink-0 text-xs text-slate-500">{timeAgo(n.updatedAt)}</span>} />
                        ))}
                    </Panel>
                </div>
            </div>
        </div>
    );
}