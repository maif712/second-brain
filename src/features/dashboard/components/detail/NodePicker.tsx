// src/features/dashboard/components/detail/NodePicker.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useKnowledgeState } from '@/features/knowledge/context/KnowledgeContext';
import { searchNodes } from '@/features/knowledge/lib/search';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import { getProjectColor } from '@/features/knowledge/lib/projectColors';
import { timeAgo } from '@/features/knowledge/lib/format';
import type { KnowledgeNode } from '@/features/knowledge/types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/cn';

const MAX_RESULTS = 8;

/** The seam: return matching nodes for a query. Local now; a fetch() later. */
export type NodeSearchFn = (query: string) => Promise<KnowledgeNode[]>;

interface NodePickerProps {
    onPick: (node: KnowledgeNode) => void;
    /** ids to exclude (the node itself + already-linked items) */
    excludeIds?: Set<string>;
    /** inject a server search later — the UI doesn't change */
    search?: NodeSearchFn;
    placeholder?: string;
}

export function NodePicker({ onPick, excludeIds, search, placeholder = 'Search an item to link…' }: NodePickerProps) {
    const { nodes, projects } = useKnowledgeState();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<KnowledgeNode[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef(0); // guards against out-of-order responses

    const debouncedQuery = useDebouncedValue(query, 200);

    // Default local search. Empty query → most recently updated (good suggestions).
    const localSearch = useCallback<NodeSearchFn>(async (q) => {
        const base = q.trim()
            ? searchNodes(nodes, q)
            : [...nodes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        return base.slice(0, MAX_RESULTS * 3); // fetch extra; exclude-filter may drop some
    }, [nodes]);

    const runSearch = search ?? localSearch;

    useEffect(() => {
        if (!open) return;
        const requestId = ++requestRef.current;
        setLoading(true);
        runSearch(debouncedQuery)
            .then((found) => {
                if (requestRef.current !== requestId) return; // stale response → discard
                const filtered = excludeIds ? found.filter((n) => !excludeIds.has(n.id)) : found;
                setResults(filtered.slice(0, MAX_RESULTS));
                setActiveIndex(0);
            })
            .finally(() => {
                if (requestRef.current === requestId) setLoading(false);
            });
    }, [debouncedQuery, open, excludeIds, runSearch]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', onDown);
        return () => document.removeEventListener('pointerdown', onDown);
    }, [open]);

    // Keep the highlighted row visible
    useEffect(() => {
        if (!open) return;
        rootRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, open]);

    const pick = (node: KnowledgeNode) => {
        onPick(node);
        setQuery('');
        setResults([]);
        setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!open) setOpen(true);
                else setActiveIndex((i) => Math.min(i + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (open && results[activeIndex]) pick(results[activeIndex]);
                break;
            case 'Escape':
                setOpen(false);
                break;
        }
    };

    return (
        <div ref={rootRef} className="relative">
            <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    className="w-full rounded-xl border border-white/10 bg-white/4 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                />
            </div>

            {open && (
                <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-ink shadow-2xl shadow-black/60">
                    {loading ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                            <Loader2 size={14} className="animate-spin" /> Searching…
                        </div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">
                            {query.trim() ? 'No matching items.' : 'No items available to link.'}
                        </div>
                    ) : (
                        <div className="max-h-72 overflow-auto p-1.5">
                            {results.map((n, i) => {
                                const m = TYPE_META[n.type];
                                const Icon = m.icon;
                                const project = n.projectId ? projects.find((p) => p.id === n.projectId) : undefined;
                                const pc = project ? getProjectColor(project.color) : null;
                                const active = i === activeIndex;
                                return (
                                    <button
                                        key={n.id}
                                        type="button"
                                        data-active={active || undefined}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        onClick={() => pick(n)}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                                            active ? 'bg-violet-400/15' : 'hover:bg-white/5',
                                        )}
                                    >
                                        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1', m.bg, m.text, m.ring)}>
                                            <Icon size={14} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium text-slate-100">{n.title}</span>
                                            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                                                {m.label}
                                                {project && pc && (
                                                    <>
                                                        <span className="text-slate-700">·</span>
                                                        <span className={cn('inline-flex items-center gap-1', pc.text)}>
                                                            <span className={cn('h-1.5 w-1.5 rounded-full', pc.dot)} />
                                                            {project.name}
                                                        </span>
                                                    </>
                                                )}
                                                <span className="text-slate-700">·</span>
                                                {timeAgo(n.updatedAt)}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}