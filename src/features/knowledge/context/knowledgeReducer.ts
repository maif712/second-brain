// src/features/knowledge/context/knowledgeReducer.ts
import type {
  KnowledgeLink,
  KnowledgeNode,
  NodePatch,
  Project,
} from '../types';

export interface KnowledgeState {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
  projects: Project[];
}

export type KnowledgeAction =
  | { type: 'ADD_NODE'; node: KnowledgeNode }
  | { type: 'UPDATE_NODE'; id: string; patch: NodePatch; at: string }
  | { type: 'DELETE_NODE'; id: string }
  | { type: 'ADD_LINK'; link: KnowledgeLink }
  | { type: 'REMOVE_LINK'; id: string }
  | { type: 'MARK_REVIEWED'; id: string; at: string }
  | { type: 'ADD_PROJECT'; project: Project }
  | { type: 'UPDATE_PROJECT'; id: string; patch: Partial<Pick<Project, 'name' | 'description' | 'color'>>; at: string }
  | { type: 'DELETE_PROJECT'; id: string; mode: 'unassign' | 'delete-items' }
  | { type: 'RESET'; state: KnowledgeState }
  | { type: 'CLEAR' };

/**
 * PURE function — no Date.now(), no nanoid(), no I/O.
 * StrictMode double-invokes reducers, so anything impure here would misbehave.
 * All invariants (no self/duplicate/dangling links, cascade deletes,
 * immutable identity fields, project deletion modes) live here.
 */
export function knowledgeReducer(state: KnowledgeState, action: KnowledgeAction): KnowledgeState {
  switch (action.type) {
    /* ---------------- nodes ---------------- */

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
        projects: state.projects,
      };

    /* ---------------- links ---------------- */

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

    /* ---------------- review ---------------- */

    case 'MARK_REVIEWED':
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.id ? { ...n, lastReviewedAt: action.at, updatedAt: action.at } : n,
        ),
      };

    /* ---------------- projects ---------------- */

    case 'ADD_PROJECT':
      return { ...state, projects: [action.project, ...state.projects] };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.id
            ? { ...p, ...action.patch, id: p.id, createdAt: p.createdAt, updatedAt: action.at } // identity is protected
            : p,
        ),
      };

    case 'DELETE_PROJECT': {
      const projects = state.projects.filter((p) => p.id !== action.id);

      if (action.mode === 'delete-items') {
        // Remove the project's items AND cascade their links
        const removed = new Set(
          state.nodes.filter((n) => n.projectId === action.id).map((n) => n.id),
        );
        return {
          projects,
          nodes: state.nodes.filter((n) => n.projectId !== action.id),
          links: state.links.filter((l) => !removed.has(l.sourceId) && !removed.has(l.targetId)),
        };
      }

      // Keep items → release them back to the general library
      return {
        ...state,
        projects,
        nodes: state.nodes.map((n) =>
          n.projectId === action.id ? { ...n, projectId: null } : n,
        ),
      };
    }

    /* ---------------- global ---------------- */

    case 'RESET':
      return action.state;

    case 'CLEAR':
      return { nodes: [], links: [], projects: [] };

    default:
      return state;
  }
}