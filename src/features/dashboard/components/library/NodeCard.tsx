// src/features/dashboard/components/library/NodeCard.tsx
import { Link } from 'react-router';
import { Pencil, Trash2 } from 'lucide-react';
import { useKnowledgeState } from '@/features/knowledge/context/KnowledgeContext';
import type { KnowledgeNode } from '@/features/knowledge/types';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import { getProjectColor } from '@/features/knowledge/lib/projectColors';
import { timeAgo } from '@/features/knowledge/lib/format';
import { cn } from '@/lib/cn';

interface NodeCardProps {
    node: KnowledgeNode;
    linkCount: number;
    onEdit: (node: KnowledgeNode) => void;
    onDelete: (node: KnowledgeNode) => void;
    /** Hide the project chip when the card is already inside a project workspace. */
    showProject?: boolean;
}

export function NodeCard({ node, linkCount, onEdit, onDelete, showProject = true }: NodeCardProps) {
    const { projects } = useKnowledgeState();
    const m = TYPE_META[node.type];
    const Icon = m.icon;

    // Edge cases covered: showProject off, no projectId, or an orphan projectId
    // (deleted project) → simply renders no chip.
    const project = showProject && node.projectId
        ? projects.find((p) => p.id === node.projectId)
        : undefined;
    const pc = project ? getProjectColor(project.color) : null;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-violet-500/5">
            <Link to={`/dashboard/nodes/${node.id}`} className="block p-5">
                {/* Badges: type · question status · project */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1', m.bg, m.text, m.ring)}>
                        <Icon size={11} /> {m.label}
                    </span>

                    {node.type === 'question' && (
                        <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1',
                            node.status === 'answered'
                                ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30'
                                : 'bg-amber-400/10 text-amber-300 ring-amber-400/30',
                        )}>
                            {node.status}
                        </span>
                    )}

                    {project && pc && (
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1', pc.bg, pc.text, pc.ring)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', pc.dot)} />
                            {project.name}
                        </span>
                    )}
                </div>

                {/* Title + snippet */}
                <h3 className="font-display text-base font-semibold text-white">{node.title}</h3>
                {node.content && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{node.content}</p>
                )}

                {/* Tags */}
                {node.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {node.tags.slice(0, 3).map((t) => (
                            <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">#{t}</span>
                        ))}
                        {node.tags.length > 3 && <span className="text-[11px] text-slate-600">+{node.tags.length - 3}</span>}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-600">
                    <span>updated {timeAgo(node.updatedAt)}</span>
                    <span>{linkCount} link{linkCount === 1 ? '' : 's'}</span>
                </div>
            </Link>

            {/* Quick actions — revealed on hover */}
            <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => onEdit(node)} aria-label="Edit item" className="rounded-lg border border-white/10 bg-ink/90 p-1.5 text-slate-400 transition hover:text-white">
                    <Pencil size={13} />
                </button>
                <button onClick={() => onDelete(node)} aria-label="Delete item" className="rounded-lg border border-white/10 bg-ink/90 p-1.5 text-slate-400 transition hover:text-rose-400">
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}