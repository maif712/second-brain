// src/features/knowledge/lib/storage.ts
import type { KnowledgeState } from '../context/knowledgeReducer';
import { seedLinks, seedNodes } from './seed';

const STORAGE_KEY = 'second-brain:v1';

function isValidState(value: unknown): value is KnowledgeState {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return Array.isArray(v.nodes) && Array.isArray(v.links);
}

export function loadState(): KnowledgeState {
    const seeded = { nodes: seedNodes, links: seedLinks };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return seeded; // first run → demo data
        const parsed: unknown = JSON.parse(raw);
        if (!isValidState(parsed)) throw new Error('Invalid shape');
        // Edge case: drop links pointing at nodes that no longer exist (legacy/corrupt data)
        const ids = new Set(parsed.nodes.map((n) => n.id));
        return {
            nodes: parsed.nodes,
            links: parsed.links.filter((l) => ids.has(l.sourceId) && ids.has(l.targetId)),
        };
    } catch {
        return seeded; // corrupted JSON → fresh start instead of a crash
    }
}

export function saveState(state: KnowledgeState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // quota exceeded / private mode — app keeps working in memory
    }
}