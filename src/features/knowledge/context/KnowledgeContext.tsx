// src/features/knowledge/context/KnowledgeContext.tsx
import {
    createContext, useContext, useEffect, useMemo, useReducer, type ReactNode,
} from 'react';
import { nanoid } from 'nanoid';
import { knowledgeReducer, type KnowledgeState } from './knowledgeReducer';
import { loadState, saveState } from '../lib/storage';
import { seedLinks, seedNodes, seedProjects } from '../lib/seed';
import type { NewNodeInput, NewProjectInput, NodePatch, Project } from '../types';

export interface KnowledgeActions {
    // nodes
    addNode: (input: NewNodeInput) => string;
    updateNode: (id: string, patch: NodePatch) => void;
    deleteNode: (id: string) => void;
    // links
    addLink: (sourceId: string, targetId: string, label?: string) => void;
    removeLink: (id: string) => void;
    // review
    markReviewed: (id: string) => void;
    // projects
    addProject: (input: NewProjectInput) => string;
    updateProject: (id: string, patch: Partial<Pick<Project, 'name' | 'description' | 'color'>>) => void;
    deleteProject: (id: string, mode: 'unassign' | 'delete-items') => void;
    // global
    resetToSeed: () => void;
    clearAll: () => void;
}

// Two contexts: state changes often, actions never change.
// Consumers of actions alone (e.g. pure forms) never re-render on state updates.
const KnowledgeStateContext = createContext<KnowledgeState | null>(null);
const KnowledgeActionsContext = createContext<KnowledgeActions | null>(null);

export function KnowledgeProvider({ children }: { children: ReactNode }) {
    // Lazy initializer → localStorage is read exactly once, with validation.
    const [state, dispatch] = useReducer(knowledgeReducer, undefined, loadState);

    // Persistence: after every committed change, mirror to localStorage.
    useEffect(() => {
        saveState(state);
    }, [state]);

    // dispatch is guaranteed stable by React → actions are created once.
    const actions = useMemo<KnowledgeActions>(() => {
        const now = () => new Date().toISOString();
        return {
            /* ---------------- nodes ----------------
               Impure work (ids, timestamps) happens HERE — never inside the reducer. */
            addNode: (input) => {
                const id = nanoid(10);
                const t = now();
                dispatch({
                    type: 'ADD_NODE',
                    node: {
                        id,
                        type: input.type,
                        title: input.title.trim(),
                        content: input.content?.trim() ?? '',
                        tags: input.tags ?? [],
                        status: input.type === 'question' ? input.status ?? 'open' : undefined,
                        url: input.type === 'resource' ? input.url : undefined,
                        resourceKind: input.type === 'resource' ? input.resourceKind ?? 'article' : undefined,
                        projectId: input.projectId ?? null,
                        createdAt: t,
                        updatedAt: t,
                        lastReviewedAt: null,
                    },
                });
                return id;
            },

            updateNode: (id, patch) => dispatch({ type: 'UPDATE_NODE', id, patch, at: now() }),

            deleteNode: (id) => dispatch({ type: 'DELETE_NODE', id }),

            /* ---------------- links ----------------
               Invalid links (self, duplicate, missing nodes) are rejected by the reducer. */
            addLink: (sourceId, targetId, label = 'related to') =>
                dispatch({
                    type: 'ADD_LINK',
                    link: { id: nanoid(10), sourceId, targetId, label: label.trim() || 'related to', createdAt: now() },
                }),

            removeLink: (id) => dispatch({ type: 'REMOVE_LINK', id }),

            /* ---------------- review ---------------- */
            markReviewed: (id) => dispatch({ type: 'MARK_REVIEWED', id, at: now() }),

            /* ---------------- projects ---------------- */
            addProject: (input) => {
                const id = nanoid(10);
                const t = now();
                dispatch({
                    type: 'ADD_PROJECT',
                    project: {
                        id,
                        name: input.name.trim(),
                        description: input.description?.trim() ?? '',
                        color: input.color,
                        createdAt: t,
                        updatedAt: t,
                    },
                });
                return id;
            },

            updateProject: (id, patch) => dispatch({ type: 'UPDATE_PROJECT', id, patch, at: now() }),

            // mode: 'unassign' → items return to the general library
            //       'delete-items' → items AND their links are removed (reducer cascades)
            deleteProject: (id, mode) => dispatch({ type: 'DELETE_PROJECT', id, mode }),

            /* ---------------- global ---------------- */
            resetToSeed: () =>
                dispatch({
                    type: 'RESET',
                    state: { nodes: seedNodes, links: seedLinks, projects: seedProjects },
                }),

            clearAll: () => dispatch({ type: 'CLEAR' }),
        };
    }, []);

    return (
        <KnowledgeStateContext.Provider value={state}>
            <KnowledgeActionsContext.Provider value={actions}>
                {children}
            </KnowledgeActionsContext.Provider>
        </KnowledgeStateContext.Provider>
    );
}

export function useKnowledgeState(): KnowledgeState {
    const ctx = useContext(KnowledgeStateContext);
    if (!ctx) throw new Error('useKnowledgeState must be used inside <KnowledgeProvider>');
    return ctx;
}

export function useKnowledgeActions(): KnowledgeActions {
    const ctx = useContext(KnowledgeActionsContext);
    if (!ctx) throw new Error('useKnowledgeActions must be used inside <KnowledgeProvider>');
    return ctx;
}

/** Convenience hook when a component needs both. */
export function useKnowledge() {
    return { ...useKnowledgeState(), ...useKnowledgeActions() };
}