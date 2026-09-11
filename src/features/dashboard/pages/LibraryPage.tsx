// src/features/dashboard/pages/LibraryPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, SearchX } from 'lucide-react';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { searchNodes } from '@/features/knowledge/lib/search';
import type { EntityType, KnowledgeNode } from '@/features/knowledge/types';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LibraryToolbar, type SortKey } from '../components/library/LibraryToolbar';
import { NodeCard } from '../components/library/NodeCard';
import { NodeFormModal } from '../components/library/NodeFormModal';
import { useSearchParams } from 'react-router';
import { useToast } from '@/components/ui/toast/ToastContext';

export default function LibraryPage() {
    const { nodes, links } = useKnowledgeState();
    const { deleteNode, resetToSeed } = useKnowledgeActions();
    const [searchParams, setSearchParams] = useSearchParams();

    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');
    const [tagFilter, setTagFilter] = useState('all');
    const [sort, setSort] = useState<SortKey>('updated');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<KnowledgeNode | null>(null);
    const [deleting, setDeleting] = useState<KnowledgeNode | null>(null);

    const isSearching = query.trim().length > 0;
    const { toast } = useToast();


    useEffect(() => {
        if (searchParams.get('new') === '1') {
            setCreating(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const allTags = useMemo(
        () => Array.from(new Set(nodes.flatMap((n) => n.tags))).sort((a, b) => a.localeCompare(b)),
        [nodes],
    );

    const counts = useMemo(() => {
        const c: Record<'all' | EntityType, number> = { all: nodes.length, concept: 0, note: 0, question: 0, resource: 0 };
        nodes.forEach((n) => { c[n.type] += 1; });
        return c;
    }, [nodes]);

    const linkCounts = useMemo(() => {
        const m = new Map<string, number>();
        links.forEach((l) => {
            m.set(l.sourceId, (m.get(l.sourceId) ?? 0) + 1);
            m.set(l.targetId, (m.get(l.targetId) ?? 0) + 1);
        });
        return m;
    }, [links]);

    // Pipeline: search → type filter → tag filter → sort (search wins over manual sort).
    const visible = useMemo(() => {
        let list = searchNodes(nodes, query);
        if (typeFilter !== 'all') list = list.filter((n) => n.type === typeFilter);
        if (tagFilter !== 'all') list = list.filter((n) => n.tags.includes(tagFilter));
        if (!isSearching) {
            list = [...list];
            if (sort === 'updated') list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
            else if (sort === 'created') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            else list.sort((a, b) => a.title.localeCompare(b.title));
        }
        return list;
    }, [nodes, query, typeFilter, tagFilter, sort, isSearching]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-white">Library</h2>
                <p className="mt-1 text-sm text-slate-400">
                    {isSearching
                        ? `${visible.length} result${visible.length === 1 ? '' : 's'} for “${query.trim()}”`
                        : `${nodes.length} item${nodes.length === 1 ? '' : 's'} in your second brain`}
                </p>
            </div>

            <LibraryToolbar
                query={query} onQuery={setQuery}
                typeFilter={typeFilter} onTypeFilter={setTypeFilter}
                tagFilter={tagFilter} onTagFilter={setTagFilter}
                sort={sort} onSort={setSort}
                tags={allTags} counts={counts}
                onNew={() => setCreating(true)}
            />

            {nodes.length === 0 ? (
                /* Edge case: empty brain */
                <div className="grid min-h-[40vh] place-items-center rounded-2xl border border-dashed border-white/15 bg-white/2 p-10 text-center">
                    <div>
                        <BrainCircuit size={32} className="mx-auto text-violet-400" />
                        <h3 className="mt-4 font-display text-lg font-semibold text-white">Your brain is empty</h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">Capture your first idea, or restore the demo dataset to explore the app.</p>
                        <div className="mt-6 flex justify-center gap-3">
                            <Button onClick={() => setCreating(true)}>New item</Button>
                            <Button variant="ghost" onClick={resetToSeed}>Restore demo</Button>
                        </div>
                    </div>
                </div>
            ) : visible.length === 0 ? (
                /* Edge case: filters/search found nothing */
                <div className="grid min-h-[40vh] place-items-center rounded-2xl border border-dashed border-white/15 bg-white/2 p-10 text-center">
                    <div>
                        <SearchX size={32} className="mx-auto text-slate-500" />
                        <h3 className="mt-4 font-display text-lg font-semibold text-white">No matches</h3>
                        <p className="mt-2 text-sm text-slate-400">Nothing fits that combination of search and filters.</p>
                        <button
                            onClick={() => { setQuery(''); setTypeFilter('all'); setTagFilter('all'); }}
                            className="mt-5 text-sm text-violet-300 transition hover:text-violet-200"
                        >
                            Clear search & filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((n) => (
                        <NodeCard key={n.id} node={n} linkCount={linkCounts.get(n.id) ?? 0} onEdit={setEditing} onDelete={setDeleting} />
                    ))}
                </div>
            )}

            {/* Modals */}
            <NodeFormModal open={creating} onClose={() => setCreating(false)} defaultType={typeFilter !== 'all' ? typeFilter : 'concept'} />
            <NodeFormModal open={editing !== null} onClose={() => setEditing(null)} initial={editing} />
            <ConfirmDialog
                open={deleting !== null}
                onClose={() => setDeleting(null)}
                title="Delete this item?"
                message={deleting ? `“${deleting.title}” and all of its connections will be permanently removed from your brain.` : ''}
                onConfirm={() => {
                    if (deleting) {
                        deleteNode(deleting.id);
                        toast(`Removed “${deleting.title}”`, 'info');
                    }
                }}
            />
        </div>
    );
}