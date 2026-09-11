// src/features/dashboard/components/library/LibraryToolbar.tsx
import { Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import type { EntityType } from '@/features/knowledge/types';
import { cn } from '@/lib/cn';

export type SortKey = 'updated' | 'created' | 'alpha';

const fieldCls =
    'rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20';

interface LibraryToolbarProps {
    query: string; onQuery: (v: string) => void;
    typeFilter: EntityType | 'all'; onTypeFilter: (v: EntityType | 'all') => void;
    tagFilter: string; onTagFilter: (v: string) => void;
    sort: SortKey; onSort: (v: SortKey) => void;
    tags: string[];
    counts: Record<'all' | EntityType, number>;
    onNew: () => void;
}

export function LibraryToolbar({
    query, onQuery, typeFilter, onTypeFilter, tagFilter, onTagFilter, sort, onSort, tags, counts, onNew,
}: LibraryToolbarProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative flex-1">
                    <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        id="library-search"
                        value={query}
                        onChange={(e) => onQuery(e.target.value)}
                        placeholder='Search titles, tags and content… (try "context" or "why")'
                        className={cn(fieldCls, 'w-full pl-10 pr-9 placeholder:text-slate-600')}
                    />
                    {query && (
                        <button onClick={() => onQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white">
                            <X size={14} />
                        </button>
                    )}
                </label>

                <select value={sort} onChange={(e) => onSort(e.target.value as SortKey)} className={cn(fieldCls, 'bg-ink')} aria-label="Sort items">
                    <option value="updated">Sort: recently updated</option>
                    <option value="created">Sort: newest</option>
                    <option value="alpha">Sort: A → Z</option>
                </select>

                <select value={tagFilter} onChange={(e) => onTagFilter(e.target.value)} className={cn(fieldCls, 'bg-ink')} aria-label="Filter by tag">
                    <option value="all">All tags</option>
                    {tags.map((t) => <option key={t} value={t}>#{t}</option>)}
                </select>

                <Button onClick={onNew} className="shrink-0"><Plus size={16} /> New item</Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {(['all', 'concept', 'note', 'question', 'resource'] as const).map((t) => {
                    const active = typeFilter === t;
                    return (
                        <button
                            key={t}
                            onClick={() => onTypeFilter(t)}
                            className={cn(
                                'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                                active
                                    ? 'border-violet-400/40 bg-violet-400/15 text-violet-200'
                                    : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white',
                            )}
                        >
                            {t === 'all' ? 'All' : TYPE_META[t].plural}{' '}
                            <span className={active ? 'text-violet-300/70' : 'text-slate-600'}>{counts[t]}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}