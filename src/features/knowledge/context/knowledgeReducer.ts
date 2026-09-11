// src/features/knowledge/context/knowledgeReducer.ts
import type { KnowledgeLink, KnowledgeNode, NodePatch } from '../types';

export interface KnowledgeState {
    nodes: KnowledgeNode[];
    links: KnowledgeLink[];
}

export type KnowledgeAction =
    | { type: 'ADD_NODE'; node: KnowledgeNode }
    | { type: 'UPDATE_NODE'; id: string; patch: NodePatch; at: string }
    | { type: 'DELETE_NODE'; id: string }
    | { type: 'ADD_LINK'; link: KnowledgeLink }
    | { type: 'REMOVE_LINK'; id: string }
    | { type: 'MARK_REVIEWED'; id: string; at: string }
    | { type: 'RESET'; state: KnowledgeState }
    | { type: 'CLEAR' };

/**
 * PURE function — no Date.now(), no nanoid(), no I/O.
 * StrictMode double-invokes reducers, so anything impure here would misbehave.
 */
export function knowledgeReducer(state: KnowledgeState, action: KnowledgeAction): KnowledgeState {
    switch (action.type) {
        case 'ADD_NODE':
            return { ...state, nodes: [action.node, ...state.nodes] };

        case 'UPDATE_NODE':
            return {
                ...state,
                nodes: state.nodes.map((n) =>
                    n.id === action.id
                        ? { ...n, ...action.patch, id: n.id, createdAt: n.createdAt, updatedAt: action.at } // identity is protected
                        : n,
                ),
            };

        // Edge case: cascade-delete every link touching this node — no dangling edges.
        case 'DELETE_NODE':
            return {
                nodes: state.nodes.filter((n) => n.id !== action.id),
                links: state.links.filter((l) => l.sourceId !== action.id && l.targetId !== action.id),
            };

        case 'ADD_LINK': {
            const { sourceId, targetId } = action.link;
            if (sourceId === targetId) return state; // no self-links
            const exists =
                state.nodes.some((n) => n.id === sourceId) && state.nodes.some((n) => n.id === targetId);
            if (!exists) return state; // no links to deleted nodes
            const duplicate = state.links.some(
                (l) =>
                    (l.sourceId === sourceId && l.targetId === targetId) ||
                    (l.sourceId === targetId && l.targetId === sourceId),
            );
            if (duplicate) return state; // no duplicates in either direction
            return { ...state, links: [...state.links, action.link] };
        }

        case 'REMOVE_LINK':
            return { ...state, links: state.links.filter((l) => l.id !== action.id) };

        case 'MARK_REVIEWED':
            return {
                ...state,
                nodes: state.nodes.map((n) =>
                    n.id === action.id ? { ...n, lastReviewedAt: action.at, updatedAt: action.at } : n,
                ),
            };

        case 'RESET':
            return action.state;

        case 'CLEAR':
            return { nodes: [], links: [] };

        default:
            return state;
    }
}