// src/features/knowledge/lib/storage.ts — updated
import type { KnowledgeState } from '../context/knowledgeReducer';
import { seedLinks, seedNodes, seedProjects } from './seed';

const STORAGE_KEY = 'second-brain:v1';

function isValidState(value: unknown): value is KnowledgeState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.nodes) && Array.isArray(v.links);
}

export function loadState(): KnowledgeState {
  const seeded = { nodes: seedNodes, links: seedLinks, projects: seedProjects };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seeded;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidState(parsed)) throw new Error('Invalid shape');
    const ids = new Set(parsed.nodes.map((n) => n.id));
    return {
      nodes: parsed.nodes,
      links: parsed.links.filter((l) => ids.has(l.sourceId) && ids.has(l.targetId)),
      // Migration: saves from before the Projects feature get an empty list
      projects: Array.isArray((parsed as KnowledgeState).projects) ? (parsed as KnowledgeState).projects : [],
    };
  } catch {
    return seeded;
  }
}

export function saveState(state: KnowledgeState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota / private mode — keep running in memory */ }
}