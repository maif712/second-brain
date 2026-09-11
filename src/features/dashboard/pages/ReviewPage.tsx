// src/features/dashboard/pages/ReviewPage.tsx
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CalendarClock, CheckCheck, Eye, Hourglass, PartyPopper } from 'lucide-react';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { getStale } from '@/features/knowledge/lib/health';
import { daysSince, timeAgo } from '@/features/knowledge/lib/format';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import type { KnowledgeNode } from '@/features/knowledge/types';
import { useToast } from '@/components/ui/toast/ToastContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface ReviewCardProps {
    node: KnowledgeNode;
    revealed: boolean;
    onReveal: () => void;
    onReviewed: () => void;
}

function ReviewCard({ node, revealed, onReveal, onReviewed }: ReviewCardProps) {
    const m = TYPE_META[node.type];
    const Icon = m.icon;
    const d = daysSince(node.lastReviewedAt);
    const severe = d === Infinity || d > 30;

    return (
        <div className="rounded-2xl border border-white/5 bg-white/2 p-5 transition hover:border-violet-400/20">
            <div className="flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1', m.bg, m.text, m.ring)}>
                    <Icon size={11} /> {m.label}
                </span>
                <span className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1',
                    severe ? 'bg-rose-400/10 text-rose-300 ring-rose-400/30' : 'bg-amber-400/10 text-amber-300 ring-amber-400/30',
                )}>
                    {d === Infinity ? 'never reviewed' : `${d}d since review`}
                </span>
            </div>

            <h3 className="mt-3 font-display text-lg font-semibold text-white">{node.title}</h3>

            {/* Active recall: blurred until the user chooses to reveal */}
            <div className="relative mt-3 min-h-14">
                <p className={cn('text-sm leading-relaxed text-slate-400 transition-all duration-300', !revealed && 'select-none blur-md')}>
                    {node.content || 'No content — open the item to add some.'}
                </p>
                {!revealed && (
                    <button onClick={onReveal} className="absolute inset-0 grid place-items-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink/80 px-4 py-1.5 text-xs font-medium text-slate-200 backdrop-blur transition hover:border-violet-400/40 hover:text-white">
                            <Eye size={13} /> Recall first… then reveal
                        </span>
                    </button>
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-600">last reviewed {node.lastReviewedAt ? timeAgo(node.lastReviewedAt) : 'never'}</span>
                <div className="flex gap-2">
                    <Link
                        to={`/dashboard/nodes/${node.id}`}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        Open
                    </Link>
                    <button
                        onClick={onReviewed}
                        className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                    >
                        <CheckCheck size={13} /> Reviewed
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ReviewPage() {
    const { nodes } = useKnowledgeState();
    const { markReviewed } = useKnowledgeActions();
    const { toast } = useToast();
    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const [done, setDone] = useState(0);

    const due = useMemo(() => getStale(nodes), [nodes]); // most faded first
    const worst = due.length > 0 ? daysSince(due[0].lastReviewedAt) : 0;
    const total = done + due.length;
    const progress = total === 0 ? 1 : done / total;

    const handleReviewed = (n: KnowledgeNode) => {
        markReviewed(n.id);
        setDone((c) => c + 1);
        toast(`Reviewed “${n.title}”`);
    };

    const stats = [
        { label: 'Due now', value: String(due.length), cls: 'text-amber-300', icon: CalendarClock },
        { label: 'Reviewed this session', value: String(done), cls: 'text-emerald-300', icon: CheckCheck },
        { label: 'Longest gap', value: due.length === 0 ? '—' : worst === Infinity ? 'never' : `${worst}d`, cls: 'text-rose-300', icon: Hourglass },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-white">Review</h2>
                <p className="mt-1 text-sm text-slate-400">Beat the forgetting curve — recall, reveal, refresh.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="rounded-2xl border border-white/5 bg-white/3 p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400 sm:text-sm">{s.label}</span>
                                <Icon size={15} className={s.cls} />
                            </div>
                            <div className={cn('mt-3 font-display text-2xl font-bold sm:text-3xl', s.cls)}>{s.value}</div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                    <span>Session progress</span>
                    <span>{done}/{total}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full bg-linear-to-r from-violet-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
            </div>

            {due.length === 0 ? (
                <div className="grid min-h-[36vh] place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-10 text-center">
                    <div>
                        <PartyPopper size={32} className="mx-auto text-emerald-300" />
                        <h3 className="mt-4 font-display text-lg font-semibold text-white">All caught up 🎉</h3>
                        <p className="mt-2 text-sm text-slate-400">
                            {done > 0
                                ? `You reviewed ${done} item${done === 1 ? '' : 's'} this session. Your Knowledge Health thanks you.`
                                : 'Nothing is fading right now. Check back after you keep learning.'}
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <Button to="/dashboard" variant="ghost">Overview</Button>
                            <Button to="/dashboard/library">Library</Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {due.map((n) => (
                        <ReviewCard
                            key={n.id}
                            node={n}
                            revealed={revealed.has(n.id)}
                            onReveal={() => setRevealed((s) => new Set(s).add(n.id))}
                            onReviewed={() => handleReviewed(n)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}