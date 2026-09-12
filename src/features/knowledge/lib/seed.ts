// src/features/knowledge/lib/seed.ts
import type { KnowledgeLink, KnowledgeNode, Project } from '../types';

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

/* ---------------- projects ---------------- */

export const seedProjects: Project[] = [
    {
        id: 'p-react',
        name: 'React Deep Dive',
        description: 'Mastering the React mental model — state, effects and data flow.',
        color: 'violet',
        createdAt: daysAgo(40),
        updatedAt: daysAgo(2),
    },
    {
        id: 'p-portfolio',
        name: 'Portfolio Website',
        description: 'Planning and building my personal site.',
        color: 'emerald',
        createdAt: daysAgo(10),
        updatedAt: daysAgo(1),
    },
];

/* ---------------- nodes ----------------
   projectId assignments:
   · p-react     → React Deep Dive
   · p-portfolio → Portfolio Website
   · (no field)  → general library / Inbox
---------------------------------------- */

export const seedNodes: KnowledgeNode[] = [
    {
        id: 'c-react',
        type: 'concept',
        title: 'React',
        content: 'A library for building UIs out of components that re-render when data changes. Mental model: UI = f(state).',
        tags: ['frontend', 'library'],
        projectId: 'p-react',
        createdAt: daysAgo(40),
        updatedAt: daysAgo(2),
        lastReviewedAt: daysAgo(2),
    },
    {
        id: 'c-state',
        type: 'concept',
        title: 'State',
        content: "A component's memory. A snapshot of data at render time — changing it schedules a re-render.",
        tags: ['react', 'core'],
        projectId: 'p-react',
        createdAt: daysAgo(38),
        updatedAt: daysAgo(5),
        lastReviewedAt: daysAgo(5),
    },
    {
        id: 'c-context',
        type: 'concept',
        title: 'Context API',
        content: 'Built-in dependency injection: pass data through the tree without prop-drilling. Re-renders consumers when the value changes.',
        tags: ['react', 'data-flow'],
        projectId: 'p-react',
        createdAt: daysAgo(35),
        updatedAt: daysAgo(21),
        lastReviewedAt: daysAgo(21),
    },
    {
        id: 'c-useeffect',
        type: 'concept',
        title: 'useEffect',
        content: 'Synchronizes a component with an external system (network, DOM, subscriptions). An escape hatch, not a lifecycle hook.',
        tags: ['react', 'hooks'],
        projectId: 'p-react',
        createdAt: daysAgo(35),
        updatedAt: daysAgo(35),
        lastReviewedAt: daysAgo(35),
    },
    {
        id: 'c-hooks',
        type: 'concept',
        title: 'Hooks',
        content: 'Functions that let function components hold state and side effects. Rules: top level only, same order every render.',
        tags: ['react'],
        projectId: 'p-react',
        createdAt: daysAgo(30),
        updatedAt: daysAgo(10),
        lastReviewedAt: daysAgo(10),
    },
    {
        id: 'n-snapshot',
        type: 'note',
        title: 'State is a snapshot, not a variable',
        content: 'Setting state requests a new render — it never mutates the current one. Thinking in snapshots explains almost every "stale value" bug.',
        tags: ['mental-model'],
        projectId: 'p-portfolio',
        createdAt: daysAgo(12),
        updatedAt: daysAgo(3),
        lastReviewedAt: daysAgo(3),
    },
    {
        id: 'n-plan',
        type: 'note',
        title: 'Learning plan: data flow first',
        content: 'Master props → state → context before reaching for state-management libraries. Complexity should be earned.',
        tags: ['learning'],
        projectId: 'p-portfolio',
        createdAt: daysAgo(8),
        updatedAt: daysAgo(1),
        lastReviewedAt: null,
    },
    {
        id: 'q-strict',
        type: 'question',
        title: 'Why does useEffect run twice in development?',
        content: 'Strict Mode mounts, unmounts and remounts components to surface missing cleanups.',
        tags: ['react', 'strict-mode'],
        status: 'open',
        projectId: 'p-react',
        createdAt: daysAgo(9),
        updatedAt: daysAgo(6),
        lastReviewedAt: daysAgo(6),
    },
    {
        id: 'q-context-perf',
        type: 'question',
        title: 'When exactly does Context trigger re-renders?',
        content: 'Every consumer re-renders when the value identity changes — but does memo() on children still protect them?',
        tags: ['react', 'performance'],
        status: 'open',
        projectId: 'p-react',
        createdAt: daysAgo(25),
        updatedAt: daysAgo(20),
        lastReviewedAt: daysAgo(20),
    },
    {
        id: 'q-keys',
        type: 'question',
        title: 'Why do list keys matter for reconciliation?',
        content: 'Keys let the diff match elements between renders; index keys break state when order changes.',
        tags: ['react'],
        status: 'answered',
        createdAt: daysAgo(20),
        updatedAt: daysAgo(12),
        lastReviewedAt: daysAgo(12),
    },
    {
        id: 'r-reactdev',
        type: 'resource',
        title: 'react.dev — Thinking in React',
        content: 'The official walkthrough for breaking a UI into components and choosing state ownership.',
        tags: ['docs'],
        url: 'https://react.dev/learn/thinking-in-react',
        resourceKind: 'article',
        createdAt: daysAgo(15),
        updatedAt: daysAgo(4),
        lastReviewedAt: daysAgo(4),
    },
    {
        id: 'r-effect-guide',
        type: 'resource',
        title: 'A Complete Guide to useEffect',
        content: "Dan Abramov's deep dive on effects, closures and deps arrays. Long but foundational.",
        tags: ['hooks', 'deep-dive'],
        url: 'https://overreacted.io/a-complete-guide-to-useeffect/',
        resourceKind: 'article',
        projectId: 'p-react',
        createdAt: daysAgo(33),
        updatedAt: daysAgo(30),
        lastReviewedAt: daysAgo(30),
    },
];

/* ---------------- links ---------------- */

export const seedLinks: KnowledgeLink[] = [
    { id: 'l-1', sourceId: 'c-react', targetId: 'c-state', label: 'core idea', createdAt: daysAgo(30) },
    { id: 'l-2', sourceId: 'c-react', targetId: 'c-hooks', label: 'core idea', createdAt: daysAgo(30) },
    { id: 'l-3', sourceId: 'c-react', targetId: 'c-context', label: 'core idea', createdAt: daysAgo(28) },
    { id: 'l-4', sourceId: 'c-hooks', targetId: 'c-useeffect', label: 'includes', createdAt: daysAgo(28) },
    { id: 'l-5', sourceId: 'c-hooks', targetId: 'c-state', label: 'includes', createdAt: daysAgo(28) },
    { id: 'l-6', sourceId: 'q-strict', targetId: 'c-useeffect', label: 'asks about', createdAt: daysAgo(9) },
    { id: 'l-7', sourceId: 'q-context-perf', targetId: 'c-context', label: 'asks about', createdAt: daysAgo(25) },
    { id: 'l-8', sourceId: 'q-keys', targetId: 'c-react', label: 'asks about', createdAt: daysAgo(20) },
    { id: 'l-9', sourceId: 'n-snapshot', targetId: 'c-state', label: 'explains', createdAt: daysAgo(12) },
    { id: 'l-10', sourceId: 'r-reactdev', targetId: 'c-react', label: 'teaches', createdAt: daysAgo(15) },
    { id: 'l-11', sourceId: 'r-effect-guide', targetId: 'c-useeffect', label: 'deep dive into', createdAt: daysAgo(33) },
    { id: 'l-12', sourceId: 'n-plan', targetId: 'c-react', label: 'roadmap for', createdAt: daysAgo(8) },
];