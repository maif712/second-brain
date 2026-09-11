# 🧠 Second Brain

> A **local-first personal knowledge OS**. Don't just save notes — capture **Concepts, Notes, Questions and Resources**, link them together, and watch your understanding take shape as a living knowledge graph.

![stack](https://img.shields.io/badge/React_19-TypeScript-blue) ![tailwind](https://img.shields.io/badge/Tailwind_v4-CSS_first-38bdf8) ![gsap](https://img.shields.io/badge/GSAP-ScrollTrigger-88ce02)

## ✨ Features

- **Four knowledge types** — Concept · Note · Question · Resource, each with type-specific fields
- **Linked thinking** — connect any two items with labeled edges ("core idea", "asks about"…)
- **Interactive Knowledge Graph** — custom canvas renderer on `d3-force`: drag nodes, pan, zoom, hover to highlight neighborhoods, click to open
- **Smart search** — ranked multi-token scoring (title ≫ tags > content) with AND semantics
- **Spaced review** — items you haven't revisited surface with an active-recall (blur → reveal) flow
- **Knowledge Health** — one 0–100 score from freshness, connectivity, answered questions and tagging
- **100% offline** — everything persists to `localStorage`. No account, no backend, no lock-in
- **Award-style landing page** — GSAP + ScrollTrigger + Lenis: masked line reveals, magnetic CTAs, spotlight bento cards, marquee, grain overlay

## 🧱 Knowledge model

| Type | Purpose | Extra fields |
|---|---|---|
| `concept` | A mental model you're building | — |
| `note` | Your own thinking in words | — |
| `question` | Open loops to close | `status: open \| answered` |
| `resource` | External material | `url`, `resourceKind` |

Links are first-class: `{ sourceId, targetId, label }`. Deleting a node cascades its links; self-links and duplicates are rejected in the reducer.

## 🚀 Getting started

```bash
npm install
npm run dev
```

Shortcuts inside the dashboard: `/` focus search · `N` new item.

## 🏛 Architecture (feature-based)

```
src/features/
├─ landing/     # marketing site (GSAP, Lenis)
├─ dashboard/   # shell, pages (overview/library/detail/review/graph)
└─ knowledge/   # domain: types, reducer, context, search, health, seed
```

- **State**: Context API split into *state* and *actions* contexts + `useReducer`.
  Actions are memoized and stable, so write-only components never re-render on state changes.
- **Reducer purity**: IDs (`nanoid`) and timestamps are generated in action creators —
  the reducer stays pure (StrictMode-safe). All invariants (duplicate/self-link rejection,
  cascade deletes, immutable `id`/`createdAt`) live in the reducer.
- **Persistence**: lazy load with shape validation + save-on-change effect. Corrupted storage degrades to seed data instead of crashing.

## 📈 Knowledge Health

`score = 40% freshness (reviewed < 14d) + 30% connectivity + 15% questions answered + 15% tagging`

## 🛣 Roadmap

Command palette (⌘K) · markdown content · AI link suggestions · cloud sync (Supabase) · PWA

---

Built with React, TypeScript, Tailwind CSS v4, GSAP and d3-force.