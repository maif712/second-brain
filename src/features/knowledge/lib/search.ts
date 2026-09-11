// src/features/knowledge/lib/search.ts
import type { KnowledgeNode } from '../types';

const WEIGHTS = { title: 6, prefixBonus: 2, tag: 4, content: 2, type: 1 };

function scoreNode(node: KnowledgeNode, tokens: string[]): number {
  const title = node.title.toLowerCase();
  const content = node.content.toLowerCase();
  const tags = node.tags.map((t) => t.toLowerCase());
  let total = 0;

  for (const token of tokens) {
    let hit = 0;
    if (title.includes(token)) hit += WEIGHTS.title;
    if (title.startsWith(token)) hit += WEIGHTS.prefixBonus;
    if (tags.some((t) => t.includes(token))) hit += WEIGHTS.tag;
    if (content.includes(token)) hit += WEIGHTS.content;
    if (node.type.includes(token)) hit += WEIGHTS.type;

    if (hit === 0) return 0; // AND semantics: every token must match somewhere
    total += hit;
  }
  return total;
}

export function searchNodes(nodes: KnowledgeNode[], query: string): KnowledgeNode[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return nodes; // empty query → no filtering

  return nodes
    .map((n) => ({ n, score: scoreNode(n, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.n.updatedAt.localeCompare(a.n.updatedAt))
    .map((x) => x.n);
}