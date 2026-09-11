// src/features/dashboard/components/graph/buildGraph.ts
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import type { EntityType, KnowledgeLink, KnowledgeNode } from '@/features/knowledge/types';

export interface GraphNodeDatum extends SimulationNodeDatum {
    id: string;
    title: string;
    type: EntityType;
    r: number;
    degree: number;
}

export interface GraphLinkDatum extends SimulationLinkDatum<GraphNodeDatum> {
    label: string;
}

export interface PreparedGraph {
    simNodes: GraphNodeDatum[];
    simLinks: GraphLinkDatum[];
    adjacency: Map<string, Set<string>>;
}

export function buildGraph(
    nodes: KnowledgeNode[],
    links: KnowledgeLink[],
    previous: Map<string, { x: number; y: number }>,
    width: number,
    height: number,
): PreparedGraph {
    const degree = new Map<string, number>();
    links.forEach((l) => {
        degree.set(l.sourceId, (degree.get(l.sourceId) ?? 0) + 1);
        degree.set(l.targetId, (degree.get(l.targetId) ?? 0) + 1);
    });

    const simNodes: GraphNodeDatum[] = nodes.map((n, i) => {
        const d = degree.get(n.id) ?? 0;
        const prev = previous.get(n.id);
        // New nodes spawn in a ring around the center so the layout "blooms" outward.
        const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
        return {
            id: n.id,
            title: n.title,
            type: n.type,
            degree: d,
            r: Math.min(10 + d * 2.2, 26), // hubs get bigger
            x: prev?.x ?? width / 2 + Math.cos(angle) * 120 + (Math.random() - 0.5) * 24,
            y: prev?.y ?? height / 2 + Math.sin(angle) * 120 + (Math.random() - 0.5) * 24,
        };
    });

    // Edge case: skip links whose nodes were deleted elsewhere
    const ids = new Set(nodes.map((n) => n.id));
    const simLinks: GraphLinkDatum[] = links
        .filter((l) => ids.has(l.sourceId) && ids.has(l.targetId))
        .map((l) => ({ source: l.sourceId, target: l.targetId, label: l.label }));

    const adjacency = new Map<string, Set<string>>();
    nodes.forEach((n) => adjacency.set(n.id, new Set()));
    simLinks.forEach((l) => {
        adjacency.get(l.source as string)?.add(l.target as string);
        adjacency.get(l.target as string)?.add(l.source as string);
    });

    return { simNodes, simLinks, adjacency };
}