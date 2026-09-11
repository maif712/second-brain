// src/features/dashboard/components/library/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';

export const PAGE_SIZES = [10, 25, 50];
export const DEFAULT_PAGE_SIZE = 10;

interface PaginationProps {
    page: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPage: (page: number) => void;
    onPageSize: (size: number) => void;
}

// src/features/dashboard/components/library/Pagination.tsx — replace getPageItems with this

/** Windowed page numbers — never renders all pages.
    Slides the window near the edges so the bar keeps a constant width:
    page 1   →  1 2 3 4 5 … 100
    page 6   →  1 … 4 5 6 7 8 … 100
    page 50  →  1 … 48 49 50 51 52 … 100
    page 100 →  1 … 96 97 98 99 100 */
function getPageItems(page: number, totalPages: number): (number | 'ellipsis-l' | 'ellipsis-r')[] {
    // Small counts: just render everything
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    // Up to 5 consecutive pages around the current one…
    let start = Math.max(2, page - 2);
    let end = Math.min(totalPages - 1, page + 2);
    // …sliding the window near the edges so it never shrinks
    if (page <= 3) end = Math.min(totalPages - 1, 5);
    if (page >= totalPages - 2) start = Math.max(2, totalPages - 4);

    const items: (number | 'ellipsis-l' | 'ellipsis-r')[] = [1];
    if (start > 2) items.push('ellipsis-l');
    for (let i = start; i <= end; i += 1) items.push(i);
    if (end < totalPages - 1) items.push('ellipsis-r');
    items.push(totalPages);
    return items;
}

export function Pagination({ page, totalPages, pageSize, totalItems, onPage, onPageSize }: PaginationProps) {
    const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);

    const navBtn =
        'grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-35';

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-5 sm:flex-row">
            {/* Range summary + page size */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <span className="text-xs text-slate-500">
                    Showing <span className="text-slate-300">{from}–{to}</span> of <span className="text-slate-300">{totalItems}</span>
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">per page</span>
                    <Select
                        ariaLabel="Items per page"
                        value={String(pageSize)}
                        onChange={(v) => onPageSize(Number(v))}
                        options={PAGE_SIZES.map((s) => ({ value: String(s), label: String(s) }))}
                        className="w-20"
                    />
                </div>
            </div>

            {/* Page numbers */}
            {totalPages > 1 && (
                <nav className="flex items-center gap-1.5" aria-label="Pagination">
                    <button className={navBtn} onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
                        <ChevronLeft size={16} />
                    </button>

                    {getPageItems(page, totalPages).map((item) =>
                        typeof item === 'number' ? (
                            <button
                                key={item}
                                onClick={() => onPage(item)}
                                aria-current={item === page ? 'page' : undefined}
                                className={cn(
                                    'h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition',
                                    item === page
                                        ? 'bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                                )}
                            >
                                {item}
                            </button>
                        ) : (
                            <span key={item} className="px-1 text-slate-600">…</span>
                        ),
                    )}

                    <button className={navBtn} onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
                        <ChevronRight size={16} />
                    </button>
                </nav>
            )}
        </div>
    );
}