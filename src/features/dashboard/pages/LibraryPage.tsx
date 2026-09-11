// src/features/dashboard/pages/LibraryPage.tsx  (full file — browse & narrow edition)
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { BrainCircuit, FilterX } from 'lucide-react';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { useToast } from '@/components/ui/toast/ToastContext';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { searchNodes } from '@/features/knowledge/lib/search';
import type { EntityType, KnowledgeNode } from '@/features/knowledge/types';
import { LibraryToolbar, type SortKey } from '../components/library/LibraryToolbar';
import { NodeCard } from '../components/library/NodeCard';
import { NodeFormModal } from '../components/library/NodeFormModal';
import { Pagination, PAGE_SIZES, DEFAULT_PAGE_SIZE } from '../components/library/Pagination';

const TYPE_VALUES = new Set(['all', 'concept', 'note', 'question', 'resource']);
const SORT_VALUES: SortKey[] = ['updated', 'created', 'alpha'];

export default function LibraryPage() {
    const { nodes, links } = useKnowledgeState();
    const { deleteNode, resetToSeed } = useKnowledgeActions();
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<KnowledgeNode | null>(null);
    const [deleting, setDeleting] = useState<KnowledgeNode | null>(null);

    /* ---------- URL → state (validated) ---------- */
    const query = searchParams.get('q') ?? '';
    const typeRaw = searchParams.get('type') ?? 'all';
    const typeFilter = (TYPE_VALUES.has(typeRaw) ? typeRaw : 'all') as EntityType | 'all';
    const tagFilter = searchParams.get('tag') ?? 'all';
    const sortRaw = searchParams.get('sort') ?? 'updated';
    const sort = (SORT_VALUES.includes(sortRaw as SortKey) ? sortRaw : 'updated') as SortKey;
    const sizeRaw = Number(searchParams.get('size'));
    const pageSize = PAGE_SIZES.includes(sizeRaw) ? sizeRaw : DEFAULT_PAGE_SIZE;
    const pageRaw = Number(searchParams.get('page'));
    const page = Number.isInteger(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

    /* ---------- state → URL (never touches `page`) ---------- */
    const updateParams = (patch: Record<string, string | null>) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                for (const [key, value] of Object.entries(patch)) {
                    if (value === null || value === '') next.delete(key);
                    else next.set(key, value);
                }
                return next;
            },
            { replace: true },
        );
    };

    const setQuery = (v: string) => updateParams({ q: v || null });
    const setTypeFilter = (v: EntityType | 'all') => updateParams({ type: v === 'all' ? null : v });
    const setTagFilter = (v: string) => updateParams({ tag: v === 'all' ? null : v });
    const setSort = (v: SortKey) => updateParams({ sort: v === 'updated' ? null : v });
    const setPageSize = (s: number) => updateParams({ size: s === DEFAULT_PAGE_SIZE ? null : String(s) });
    const setPage = (p: number) => {
        updateParams({ page: p <= 1 ? null : String(p) });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const clearFilters = () => updateParams({ q: null, type: null, tag: null });

    // Deep-link ?new=1 (the "n" shortcut) — removes only itself
    useEffect(() => {
        if (searchParams.get('new') === '1') {
            setCreating(true);
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete('new');
                return next;
            }, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    /* ---------- pipeline: sort → paginate → narrow the current page ----------
       Filters only ever narrow the page you're on, so choosing a tag/type
       or typing a search can never move you to another page. */
    const sorted = useMemo(() => {
        const list = [...nodes];
        if (sort === 'updated') list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        else if (sort === 'created') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        else list.sort((a, b) => a.title.localeCompare(b.title));
        return list;
    }, [nodes, sort]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(page, totalPages);

    // Only dataset shrinkage (deletes, page-size change) can out-range the page now.
    useEffect(() => {
        if (page > totalPages) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (totalPages <= 1) next.delete('page');
                else next.set('page', String(totalPages));
                return next;
            }, { replace: true });
        }
    }, [page, totalPages, setSearchParams]);

    const pageItems = useMemo(
        () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
        [sorted, safePage, pageSize],
    );

    const isSearching = query.trim().length > 0;
    const isFiltering = isSearching || typeFilter !== 'all' || tagFilter !== 'all';

    const visible = useMemo(() => {
        let list = searchNodes(pageItems, query); // ranked scoring, within this page
        if (typeFilter !== 'all') list = list.filter((n) => n.type === typeFilter);
        if (tagFilter !== 'all') list = list.filter((n) => n.tags.includes(tagFilter));
        return list;
    }, [pageItems, query, typeFilter, tagFilter]);

    // Pill counts describe what THIS page can show under the current query+tag
    const counts = useMemo(() => {
        let list = searchNodes(pageItems, query);
        if (tagFilter !== 'all') list = list.filter((n) => n.tags.includes(tagFilter));
        const c: Record<'all' | EntityType, number> = { all: list.length, concept: 0, note: 0, question: 0, resource: 0 };
        list.forEach((n) => { c[n.type] += 1; });
        return c;
    }, [pageItems, query, tagFilter]);

    const allTags = useMemo(
        () => Array.from(new Set(nodes.flatMap((n) => n.tags))).sort((a, b) => a.localeCompare(b)),
        [nodes],
    );

    const linkCounts = useMemo(() => {
        const m = new Map<string, number>();
        links.forEach((l) => {
            m.set(l.sourceId, (m.get(l.sourceId) ?? 0) + 1);
            m.set(l.targetId, (m.get(l.targetId) ?? 0) + 1);
        });
        return m;
    }, [links]);

    /* ---------- render ---------- */
    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-white">Library</h2>
                <p className="mt-1 text-sm text-slate-400">
                    {isFiltering
                        ? `${visible.length} match${visible.length === 1 ? '' : 'es'} on this page`
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
                <div className="grid min-h-[36vh] place-items-center rounded-2xl border border-dashed border-white/15 bg-white/2 p-10 text-center">
                    <div>
                        <FilterX size={32} className="mx-auto text-slate-500" />
                        <h3 className="mt-4 font-display text-lg font-semibold text-white">Nothing matches on this page</h3>
                        <p className="mt-2 text-sm text-slate-400">
                            {totalPages > 1 ? 'Try another page, or clear the filters.' : 'Try clearing the filters.'}
                        </p>
                        <button onClick={clearFilters} className="mt-5 text-sm text-violet-300 transition hover:text-violet-200">
                            Clear search & filters
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visible.map((n) => (
                            <NodeCard key={n.id} node={n} linkCount={linkCounts.get(n.id) ?? 0} onEdit={setEditing} onDelete={setDeleting} />
                        ))}
                    </div>

                    <Pagination
                        page={safePage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={sorted.length}
                        onPage={setPage}
                        onPageSize={setPageSize}
                    />
                </>
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