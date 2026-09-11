// src/components/ui/Select.tsx
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
    value: string;
    label: string;
    meta?: string; // small secondary text (e.g. the node type)
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    ariaLabel: string;
    className?: string;
}

export function Select({ value, onChange, options, placeholder = 'Select…', ariaLabel, className }: SelectProps) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value) ?? null;

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', onDown);
        return () => document.removeEventListener('pointerdown', onDown);
    }, [open]);

    // Keep the highlighted row visible while keyboard-navigating
    useEffect(() => {
        if (!open) return;
        listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
    }, [open, active]);

    const openList = () => {
        setActive(Math.max(0, options.findIndex((o) => o.value === value)));
        setOpen(true);
    };

    const commit = (i: number) => {
        const opt = options[i];
        if (opt) onChange(opt.value);
        setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (open) commit(active);
                else openList();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!open) openList();
                else setActive((i) => Math.min(i + 1, options.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (open) setActive((i) => Math.max(i - 1, 0));
                break;
            case 'Home':
                if (open) { e.preventDefault(); setActive(0); }
                break;
            case 'End':
                if (open) { e.preventDefault(); setActive(options.length - 1); }
                break;
            case 'Escape':
            case 'Tab':
                setOpen(false);
                break;
        }
    };

    return (
        <div ref={rootRef} className={cn('relative', className)} onKeyDown={onKeyDown}>
            {/* Trigger */}
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel}
                onClick={() => (open ? setOpen(false) : openList())}
                className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-ink px-3.5 py-2.5 text-sm text-slate-200 outline-none transition',
                    'hover:border-white/25 focus-visible:border-violet-400/50 focus-visible:ring-2 focus-visible:ring-violet-400/20',
                    open && 'border-violet-400/50 ring-2 ring-violet-400/20',
                )}
            >
                <span className={cn('truncate', !selected && 'text-slate-500')}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown size={15} className={cn('shrink-0 text-slate-500 transition-transform duration-200', open && 'rotate-180')} />
            </button>

            {/* Popover — fully ours to style */}
            {open && (
                <div
                    ref={listRef}
                    role="listbox"
                    aria-label={ariaLabel}
                    className="animate-pop absolute z-40 mt-2 max-h-64 w-full min-w-48 overflow-auto rounded-xl border border-white/10 bg-ink p-1.5 shadow-2xl shadow-black/60"
                >
                    {options.map((o, i) => {
                        const isSelected = o.value === value;
                        const isActive = i === active;
                        return (
                            <button
                                key={o.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                data-active={isActive || undefined}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => commit(i)}
                                className={cn(
                                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                    isActive ? 'bg-violet-400/15 text-white' : 'text-slate-300',
                                )}
                            >
                                <span className="min-w-0">
                                    <span className="block truncate">{o.label}</span>
                                    {o.meta && <span className="block text-[11px] text-slate-500">{o.meta}</span>}
                                </span>
                                {isSelected && <Check size={14} className="shrink-0 text-violet-300" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}