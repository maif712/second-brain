// src/features/knowledge/components/NodeListItem.tsx
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { KnowledgeNode } from '../types';
import { TYPE_META } from '../lib/typeMeta';
import { cn } from '@/lib/cn';

export function NodeListItem({ node, meta }: { node: KnowledgeNode; meta?: ReactNode }) {
    const m = TYPE_META[node.type];
    const Icon = m.icon;
    return (
        <Link
            to={`/dashboard/nodes/${node.id}`}
            className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3 transition hover:border-violet-400/30 hover:bg-white/6"
        >
            <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1', m.bg, m.text, m.ring)}>
                <Icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-100 group-hover:text-white">{node.title}</span>
                <span className="block text-xs text-slate-500">
                    {m.label}{node.tags.length > 0 && ` · ${node.tags.slice(0, 2).join(', ')}`}
                </span>
            </span>
            {meta}
        </Link>
    );
}