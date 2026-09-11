// src/features/dashboard/pages/NodeDetailPage.tsx
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowUpRight, CheckCheck, Pencil, Trash2 } from 'lucide-react';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import { daysSince, timeAgo } from '@/features/knowledge/lib/format';
import { REVIEW_WINDOW_DAYS } from '@/features/knowledge/lib/health';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ConnectionsPanel } from '../components/detail/ConnectionsPanel';
import { NodeFormModal } from '../components/library/NodeFormModal';
import { cn } from '@/lib/cn';
import { useToast } from '@/components/ui/toast/ToastContext';

export default function NodeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { nodes } = useKnowledgeState();
    const { updateNode, deleteNode, markReviewed } = useKnowledgeActions();
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const node = nodes.find((n) => n.id === id);
    const { toast } = useToast();

    // Edge case: bad URL id or a node that was deleted elsewhere.
    if (!node) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <div className="text-center">
                    <p className="font-display text-3xl font-bold text-white">Node not found</p>
                    <p className="mt-2 text-sm text-slate-400">It may have been deleted, or the link is stale.</p>
                    <Link to="/dashboard/library" className="mt-6 inline-block text-sm text-violet-300 hover:text-violet-200">← Back to library</Link>
                </div>
            </div>
        );
    }

    const m = TYPE_META[node.type];
    const Icon = m.icon;
    const reviewedDays = daysSince(node.lastReviewedAt);
    const isStale = reviewedDays > REVIEW_WINDOW_DAYS;

    const handleDelete = () => {
        deleteNode(node.id);
        navigate('/dashboard/library'); // never strand the user on a deleted node
    };

    return (
        <div>
            <Link to="/dashboard/library" className="text-sm text-slate-400 transition hover:text-white">← Library</Link>

            <div className="mt-4 grid gap-6 lg:grid-cols-3">
                {/* Main column */}
                <div className="space-y-6 lg:col-span-2">
                    <section className="rounded-2xl border border-white/5 bg-white/2 p-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1', m.bg, m.text, m.ring)}>
                                <Icon size={12} /> {m.label}
                            </span>
                            {node.type === 'question' && (
                                <span className={cn(
                                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1',
                                    node.status === 'answered'
                                        ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30'
                                        : 'bg-amber-400/10 text-amber-300 ring-amber-400/30',
                                )}>
                                    {node.status}
                                </span>
                            )}
                            {isStale && (
                                <span className="rounded-full bg-rose-400/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-300 ring-1 ring-rose-400/30">
                                    fading · {reviewedDays === Infinity ? 'never reviewed' : `${reviewedDays}d since review`}
                                </span>
                            )}
                        </div>

                        <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">{node.title}</h2>

                        {node.content ? (
                            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-300">{node.content}</p>
                        ) : (
                            <p className="mt-4 text-sm italic text-slate-600">No content yet — edit this item to add what you learned.</p>
                        )}

                        {node.tags.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {node.tags.map((t) => (
                                    <span key={t} className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-slate-400">#{t}</span>
                                ))}
                            </div>
                        )}

                        {node.type === 'resource' && node.url && (
                            <a
                                href={node.url} target="_blank" rel="noreferrer"
                                className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
                            >
                                Open resource <ArrowUpRight size={14} />
                            </a>
                        )}
                    </section>

                    <ConnectionsPanel node={node} />
                </div>

                {/* Side column */}
                <aside className="space-y-6">
                    <section className="rounded-2xl border border-white/5 bg-white/2 p-5">
                        <h3 className="mb-4 font-display text-sm font-semibold text-white">Details</h3>
                        <dl className="space-y-3 text-sm">
                            {[
                                ['Created', timeAgo(node.createdAt)],
                                ['Updated', timeAgo(node.updatedAt)],
                                ['Last reviewed', node.lastReviewedAt ? timeAgo(node.lastReviewedAt) : 'never'],
                            ].map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between">
                                    <dt className="text-slate-500">{k}</dt>
                                    <dd className="text-slate-200">{v}</dd>
                                </div>
                            ))}
                        </dl>
                        <Button variant="ghost" onClick={() => { markReviewed(node.id); toast('Marked as reviewed'); }}>
                            <CheckCheck size={15} /> Mark as reviewed
                        </Button>
                        {node.type === 'question' && (
                            <Button
                                variant="ghost"
                                onClick={() => updateNode(node.id, { status: node.status === 'open' ? 'answered' : 'open' })}
                                className="mt-2 w-full"
                            >
                                {node.status === 'open' ? 'Mark as answered' : 'Reopen question'}
                            </Button>
                        )}
                    </section>

                    <section className="rounded-2xl border border-white/5 bg-white/2 p-5">
                        <h3 className="mb-4 font-display text-sm font-semibold text-white">Actions</h3>
                        <div className="space-y-2">
                            <Button variant="ghost" onClick={() => setEditing(true)} className="w-full"><Pencil size={15} /> Edit item</Button>
                            <Button variant="danger" onClick={() => setConfirmDelete(true)} className="w-full"><Trash2 size={15} /> Delete</Button>
                        </div>
                    </section>
                </aside>
            </div>

            <NodeFormModal open={editing} onClose={() => setEditing(false)} initial={node} />
            <ConfirmDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Delete this item?"
                message={`“${node.title}” and all of its connections will be permanently removed.`}
                onConfirm={handleDelete}
            />
        </div>
    );
}