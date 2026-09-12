// src/features/dashboard/components/detail/ConnectionsPanel.tsx
import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Link2, Plus, X } from 'lucide-react';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import { useToast } from '@/components/ui/toast/ToastContext';
import type { KnowledgeNode } from '@/features/knowledge/types';
import { NodePicker } from './NodePicker';
import { cn } from '@/lib/cn';

const fieldCls =
    'rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20';

export function ConnectionsPanel({ node }: { node: KnowledgeNode }) {
    const { nodes, links } = useKnowledgeState();
    const { addLink, removeLink } = useKnowledgeActions();
    const { toast } = useToast();
    const [targetId, setTargetId] = useState('');
    const [label, setLabel] = useState('');

    const connections = useMemo(
        () =>
            links
                .filter((l) => l.sourceId === node.id || l.targetId === node.id)
                .flatMap((l) => {
                    const otherId = l.sourceId === node.id ? l.targetId : l.sourceId;
                    const other = nodes.find((n) => n.id === otherId);
                    return other ? [{ link: l, outgoing: l.sourceId === node.id, other }] : [];
                }),
        [links, nodes, node.id],
    );

    // Memoized → stable reference, so the picker's effect doesn't refire every render
    const excludeIds = useMemo(() => {
        const s = new Set<string>([node.id]);
        connections.forEach((c) => s.add(c.other.id));
        return s;
    }, [connections, node.id]);

    const availableCount = useMemo(
        () => nodes.reduce((acc, n) => (excludeIds.has(n.id) ? acc : acc + 1), 0),
        [nodes, excludeIds],
    );

    const selectedTarget = targetId ? nodes.find((n) => n.id === targetId) : undefined;

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        if (!targetId) return;
        const target = nodes.find((x) => x.id === targetId);
        addLink(node.id, targetId, label.trim() || 'related to');
        toast(target ? `Linked with “${target.title}”` : 'Connected');
        setTargetId('');
        setLabel('');
    };

    return (
        <section className="rounded-2xl border border-white/5 bg-white/2 p-6">
            <header className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                    <Link2 size={15} className="text-violet-300" /> Connections
                </h3>
                <span className="text-xs text-slate-500">{connections.length} link{connections.length === 1 ? '' : 's'}</span>
            </header>

            {connections.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
                    This idea is isolated. Link it to something below — isolated knowledge fades fastest.
                </p>
            ) : (
                <div className="space-y-2">
                    {connections.map((c) => {
                        const om = TYPE_META[c.other.type];
                        return (
                            <div key={c.link.id} className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3 transition hover:border-violet-400/25">
                                <span
                                    title={c.outgoing ? 'Outgoing link' : 'Incoming link'}
                                    className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1', om.bg, om.text, om.ring)}
                                >
                                    {c.outgoing ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
                                </span>
                                <Link to={`/dashboard/nodes/${c.other.id}`} className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-slate-200 transition group-hover:text-white">{c.other.title}</span>
                                    <span className="block text-[11px] text-slate-500">{om.label} · “{c.link.label}”</span>
                                </Link>
                                <button
                                    onClick={() => removeLink(c.link.id)}
                                    aria-label={`Remove link to ${c.other.title}`}
                                    className="rounded-lg p-1.5 text-slate-600 opacity-0 transition hover:bg-rose-400/10 hover:text-rose-400 group-hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Link editor */}
            <form onSubmit={handleAdd} className="mt-5 space-y-3 border-t border-white/5 pt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Add connection</p>

                {availableCount === 0 ? (
                    <p className="text-xs text-slate-600">Nothing left to link — add more items to your library first.</p>
                ) : (
                    <>
                        <NodePicker onPick={(n) => setTargetId(n.id)} excludeIds={excludeIds} />

                        {selectedTarget && (
                            <div className="flex items-center justify-between rounded-xl border border-violet-400/30 bg-violet-400/10 px-3 py-2">
                                <span className="truncate text-sm text-violet-200">Linking to: {selectedTarget.title}</span>
                                <button type="button" onClick={() => setTargetId('')} aria-label="Clear selection" className="text-violet-300 transition hover:text-white">
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder='Label (e.g. “part of”)'
                                className={cn(fieldCls, 'sm:flex-1 placeholder:text-slate-600')}
                            />
                            <button
                                type="submit"
                                disabled={!targetId}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
                            >
                                <Plus size={15} /> Link
                            </button>
                        </div>
                    </>
                )}
            </form>
        </section>
    );
}