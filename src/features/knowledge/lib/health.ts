import type { KnowledgeLink, KnowledgeNode } from '../types';
import { daysSince } from './format';

export const REVIEW_WINDOW_DAYS = 14;

/** Nodes not reviewed inside the window (never-reviewed = most stale). */
export function getStale(nodes: KnowledgeNode[], windowDays = REVIEW_WINDOW_DAYS): KnowledgeNode[] {
    return nodes
        .filter((n) => daysSince(n.lastReviewedAt) > windowDays)
        .sort((a, b) => new Date(a.lastReviewedAt ?? 0).getTime() - new Date(b.lastReviewedAt ?? 0).getTime());
}

export function getUnanswered(nodes: KnowledgeNode[]): KnowledgeNode[] {
    return nodes.filter((n) => n.type === 'question' && n.status !== 'answered');
}

export interface HealthPart { key: string; label: string; value: number; weight: number; }

/** Knowledge Health: 0–100 score from freshness, connectivity, questions, tagging. */
export function computeHealth(nodes: KnowledgeNode[], links: KnowledgeLink[]) {
    if (nodes.length === 0) return { score: 0, parts: [] as HealthPart[] };

    const fresh = nodes.filter((n) => daysSince(n.lastReviewedAt) <= REVIEW_WINDOW_DAYS).length;
    const linkedIds = new Set(links.flatMap((l) => [l.sourceId, l.targetId]));
    const connected = nodes.filter((n) => linkedIds.has(n.id)).length;
    const questions = nodes.filter((n) => n.type === 'question');
    const answered = questions.filter((q) => q.status === 'answered').length;
    const tagged = nodes.filter((n) => n.tags.length > 0).length;

    const parts: HealthPart[] = [
        { key: 'freshness', label: 'Freshness (reviewed < 14d)', value: fresh / nodes.length, weight: 0.4 },
        { key: 'connectivity', label: 'Connectivity (has links)', value: connected / nodes.length, weight: 0.3 },
        { key: 'questions', label: 'Questions answered', value: questions.length ? answered / questions.length : 1, weight: 0.15 },
        { key: 'tagging', label: 'Tagging', value: tagged / nodes.length, weight: 0.15 },
    ];
    const score = Math.round(parts.reduce((acc, p) => acc + p.value * p.weight, 0) * 100);
    return { score, parts };
}