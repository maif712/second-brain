// src/features/dashboard/pages/ProjectWorkspacePage.tsx
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { CircleHelp, Layers, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { useToast } from '@/components/ui/toast/ToastContext';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { searchNodes } from '@/features/knowledge/lib/search';
import { getProjectColor } from '@/features/knowledge/lib/projectColors';
import { timeAgo } from '@/features/knowledge/lib/format';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import type { EntityType, KnowledgeNode } from '@/features/knowledge/types';
import { NodeCard } from '../components/library/NodeCard';
import { NodeFormModal } from '../components/library/NodeFormModal';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { DeleteProjectDialog } from '../components/projects/DeleteProjectDialog';
import { cn } from '@/lib/cn';

export default function ProjectWorkspacePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { projects, nodes, links } = useKnowledgeState();
    const { deleteNode, deleteProject } = useKnowledgeActions();
    const { toast } = useToast();

    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<KnowledgeNode | null>(null);
    const [deletingNode, setDeletingNode] = useState<KnowledgeNode | null>(null);
    const [editingProject, setEditingProject] = useState(false);
    const [deletingProject, setDeletingProject] = useState(false);

    const project = projects.find((p) => p.id === id);

    const items = useMemo(() => nodes.filter((n) => n.projectId === id), [nodes, id]);

    const visible = useMemo(() => {
        let list = searchNodes(items, query);
        if (typeFilter !== 'all') list = list.filter((n) => n.type === typeFilter);
        return list;
    }, [items, query, typeFilter]);

    const linkCounts = useMemo(() => {
        const m = new Map<string, number>();
        links.forEach((l) => {
            m.set(l.sourceId, (m.get(l.sourceId) ?? 0) + 1);
            m.set(l.targetId, (m.get(l.targetId) ?? 0) + 1);
        });
        return m;
    }, [links]);

    // Edge case: invalid project id in the URL
    if (!project) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <div className="text-center">
                    <p className="font-display text-3xl font-bold text-white">Project not found</p>
                    <p className="mt-2 text-sm text-slate-400">It may have been deleted.</p>
                    <Link to="/dashboard/projects" className="mt-6 inline-block text-sm text-violet-300 hover:text-violet-200">← All projects</Link>
                </div>
            </div>
        );
    }

    const color = getProjectColor(project.color);
    const openQuestions = items.filter((n) => n.type === 'question' && n.status !== 'answered').length;
    const typeCounts = (t: EntityType | 'all') =>
        t === 'all' ? items.length : items.filter((n) => n.type === t).length;

    return (
        <div className="space-y-6">
            <Link to="/dashboard/projects" className="inline-block text-sm text-slate-400 transition hover:text-white">← All projects</Link>

            {/* Header */}
            <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent', color.gradient)} />
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className={cn('mt-1.5 h-4 w-4 shrink-0 rounded-full', color.dot)} />
                        <div>
                            <h2 className="font-display text-2xl font-bold text-white">{project.name}</h2>
                            <p className={cn('mt-1 text-sm', project.description ? 'text-slate-400' : 'italic text-slate-600')}>
                                {project.description || 'No description yet.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setEditingProject(true)}><Pencil size={15} /> Edit</Button>
                        <Button variant="danger" onClick={() => setDeletingProject(true)}><Trash2 size={15} /> Delete</Button>
                    </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><Layers size={13} /> {items.length} item{items.length === 1 ? '' : 's'}</span>
                    <span className="inline-flex items-center gap-1.5"><CircleHelp size={13} /> {openQuestions} open question{openQuestions === 1 ? '' : 's'}</span>
                    <span>created {timeAgo(project.createdAt)}</span>
                </div>
            </section>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative flex-1">
                    <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search this project…"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 pl-10 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                    />
                </label>
                <Button onClick={() => setCreating(true)} className="shrink-0"><Plus size={16} /> New item</Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {(['all', 'concept', 'note', 'question', 'resource'] as const).map((t) => {
                    const active = typeFilter === t;
                    return (
                        <button
                            key={t} onClick={() => setTypeFilter(t)}
                            className={cn(
                                'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                                active ? 'border-violet-400/40 bg-violet-400/15 text-violet-200' : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white',
                            )}
                        >
                            {t === 'all' ? 'All' : TYPE_META[t].plural} <span className={active ? 'text-violet-300/70' : 'text-slate-600'}>{typeCounts(t)}</span>
                        </button>
                    );
                })}
            </div>

            {/* Items */}
            {items.length === 0 ? (
                <div className="grid min-h-[36vh] place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
                    <div>
                        <h3 className="font-display text-lg font-semibold text-white">This project is empty</h3>
                        <p className="mt-2 text-sm text-slate-400">Add your first item, or move existing items here from their detail page.</p>
                        <div className="mt-6"><Button onClick={() => setCreating(true)}>Add an item</Button></div>
                    </div>
                </div>
            ) : visible.length === 0 ? (
                <div className="grid min-h-[30vh] place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
                    <div>
                        <h3 className="font-display text-lg font-semibold text-white">No matches in this project</h3>
                        <button onClick={() => { setQuery(''); setTypeFilter('all'); }} className="mt-4 text-sm text-violet-300 hover:text-violet-200">
                            Clear search & filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((n) => (
                        <NodeCard key={n.id} node={n} linkCount={linkCounts.get(n.id) ?? 0} onEdit={setEditing} onDelete={setDeletingNode} showProject={false} />
                    ))}
                </div>
            )}

            {/* Modals */}
            <NodeFormModal open={creating} onClose={() => setCreating(false)} defaultProjectId={project.id} defaultType={typeFilter !== 'all' ? typeFilter : 'concept'} />
            <NodeFormModal open={editing !== null} onClose={() => setEditing(null)} initial={editing} />
            <ProjectFormModal open={editingProject} onClose={() => setEditingProject(false)} initial={project} />
            <ConfirmDialog
                open={deletingNode !== null}
                onClose={() => setDeletingNode(null)}
                title="Delete this item?"
                message={deletingNode ? `“${deletingNode.title}” and all of its connections will be permanently removed.` : ''}
                onConfirm={() => {
                    if (deletingNode) {
                        deleteNode(deletingNode.id);
                        toast(`Removed “${deletingNode.title}”`, 'info');
                    }
                }}
            />
            <DeleteProjectDialog
                open={deletingProject}
                onClose={() => setDeletingProject(false)}
                project={project}
                itemCount={items.length}
                onConfirm={(mode) => {
                    deleteProject(project.id, mode);
                    toast(`Deleted “${project.name}”`, 'info');
                    navigate('/dashboard/projects');
                }}
            />
        </div>
    );
}