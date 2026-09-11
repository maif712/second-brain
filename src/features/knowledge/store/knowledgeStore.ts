// src/features/knowledge/store/knowledgeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { EntityType, KnowledgeLink, KnowledgeNode, QuestionStatus, ResourceKind } from '../types';
import { seedLinks, seedNodes } from '../lib/seed';

const STORAGE_KEY = 'second-brain:v1';
const now = () => new Date().toISOString();

/** Edge case: quota errors, privacy mode, corrupted JSON — never crash the app. */
const safeLocalStorage = {
    getItem: (name: string) => {
        try {
            const raw = localStorage.getItem(name);
            if (raw) JSON.parse(raw); // validate — drop corrupted state instead of crashing
            return raw;
        } catch {
            localStorage.removeItem(name);
            return null;
        }
    },
    setItem: (name: string, value: string) => {
        try { localStorage.setItem(name, value); } catch { /* storage full/blocked: keep app running in-memory */ }
    },
    removeItem: (name: string) => {
        try { localStorage.removeItem(name); } catch { /* noop */ }
    },
};

export interface NewNodeInput {
    type: EntityType;
    title: string;
    content?: string;
    tags?: string[];
    status?: QuestionStatus;
    url?: string;
    resourceKind?: ResourceKind;
}

interface KnowledgeStore {
    nodes: KnowledgeNode[];
    links: KnowledgeLink[];
    addNode: (input: NewNodeInput) => string;
    updateNode: (id: string, patch: Partial<Omit<KnowledgeNode, 'id' | 'createdAt'>>) => void;
    deleteNode: (id: string) => void;
    addLink: (sourceId: string, targetId: string, label?: string) => void;
    removeLink: (id: string) => void;
    markReviewed: (id: string) => void;
    resetToSeed: () => void;
    clearAll: () => void;
}

export const useKnowledge = create<KnowledgeStore>()(
    persist(
        (set, get) => ({
            nodes: seedNodes,
            links: seedLinks,

            addNode: (input) => {
                const id = nanoid(10);
                const t = now();
                const node: KnowledgeNode = {
                    id,
                    type: input.type,
                    title: input.title.trim(),
                    content: input.content ?? '',
                    tags: input.tags ?? [],
                    status: input.status,
                    url: input.url,
                    resourceKind: input.resourceKind,
                    createdAt: t,
                    updatedAt: t,
                    lastReviewedAt: null,
                };
                set((s) => ({ nodes: [node, ...s.nodes] }));
                return id;
            },

            updateNode: (id, patch) =>
                set((s) => ({
                    nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: now() } : n)),
                })),

            // Edge case: cascade-delete any link touching this node — no dangling edges.
            deleteNode: (id) =>
                set((s) => ({
                    nodes: s.nodes.filter((n) => n.id !== id),
                    links: s.links.filter((l) => l.sourceId !== id && l.targetId !== id),
                })),

            // Edge cases: no self-links, no duplicates (in either direction).
            addLink: (sourceId, targetId, label = 'related to') => {
                if (!sourceId || !targetId || sourceId === targetId) return;
                const dup = get().links.some(
                    (l) =>
                        (l.sourceId === sourceId && l.targetId === targetId) ||
                        (l.sourceId === targetId && l.targetId === sourceId),
                );
                if (dup) return;
                set((s) => ({
                    links: [...s.links, { id: nanoid(10), sourceId, targetId, label, createdAt: now() }],
                }));
            },

            removeLink: (id) => set((s) => ({ links: s.links.filter((l) => l.id !== id) })),

            markReviewed: (id) =>
                set((s) => ({
                    nodes: s.nodes.map((n) => (n.id === id ? { ...n, lastReviewedAt: now(), updatedAt: now() } : n)),
                })),

            resetToSeed: () => set({ nodes: seedNodes, links: seedLinks }),
            clearAll: () => set({ nodes: [], links: [] }),
        }),
        {
            name: STORAGE_KEY,
            version: 1,
            storage: createJSONStorage(() => safeLocalStorage),
            partialize: (s) => ({ nodes: s.nodes, links: s.links }), // only persist data, not functions
        },
    ),
);