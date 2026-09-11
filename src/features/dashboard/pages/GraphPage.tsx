// src/features/dashboard/pages/GraphPage.tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Orbit } from 'lucide-react';
import { useKnowledgeState } from '@/features/knowledge/context/KnowledgeContext';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import { Button } from '@/components/ui/Button';
import { GraphCanvas } from '../components/graph/GraphCanvas';

export default function GraphPage() {
    const { nodes, links } = useKnowledgeState();
    const navigate = useNavigate();

    const orphanCount = useMemo(() => {
        const linked = new Set(links.flatMap((l) => [l.sourceId, l.targetId]));
        return nodes.filter((n) => !linked.has(n.id)).length;
    }, [nodes, links]);

    if (nodes.length === 0) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <div className="text-center">
                    <Orbit size={36} className="mx-auto text-violet-400" />
                    <h2 className="mt-4 font-display text-xl font-semibold text-white">No graph yet</h2>
                    <p className="mt-2 text-sm text-slate-400">Add knowledge items and connect them — your map appears here.</p>
                    <Button to="/dashboard/library" className="mt-6">Go to Library</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-2xl font-bold text-white">Knowledge Graph</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        {nodes.length} nodes · {links.length} edges
                        {orphanCount > 0 && (
                            <span className="text-amber-300"> · {orphanCount} isolated — go link them!</span>
                        )}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {Object.values(TYPE_META).map((m) => (
                        <span key={m.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300">
                            <span className={`h-2 w-2 rounded-full ${m.dot}`} /> {m.plural}
                        </span>
                    ))}
                </div>
            </div>

            <div className="relative h-[calc(100vh-14rem)] min-h-115 overflow-hidden rounded-2xl border border-white/5 bg-ink/70">
                <GraphCanvas nodes={nodes} links={links} onSelect={(id) => navigate(`/dashboard/nodes/${id}`)} />
            </div>

            <p className="text-center text-xs text-slate-600">
                drag nodes to rearrange · drag the background to pan · scroll to zoom · click a node to open it
            </p>
        </div>
    );
}