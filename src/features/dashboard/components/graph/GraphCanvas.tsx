// src/features/dashboard/components/graph/GraphCanvas.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY,
    type Simulation,
} from 'd3-force';
import { Maximize2, Minus, Plus } from 'lucide-react';
import type { KnowledgeLink, KnowledgeNode } from '@/features/knowledge/types';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import { buildGraph, type GraphLinkDatum, type GraphNodeDatum, type PreparedGraph } from './buildGraph';

interface GraphCanvasProps {
    nodes: KnowledgeNode[];
    links: KnowledgeLink[];
    onSelect: (id: string) => void;
}

interface ViewTransform { x: number; y: number; k: number; }

type Gesture =
    | { kind: 'node'; id: string; moved: number }
    | { kind: 'pan'; startX: number; startY: number; origin: ViewTransform; moved: number };

function hexToRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${alpha})`;
}

const truncate = (s: string, n = 22) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const clampK = (k: number) => Math.min(3, Math.max(0.25, k));

export function GraphCanvas({ nodes, links, onSelect }: GraphCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const simRef = useRef<Simulation<GraphNodeDatum, undefined> | null>(null);
    const graphRef = useRef<PreparedGraph>({ simNodes: [], simLinks: [], adjacency: new Map() });
    const transformRef = useRef<ViewTransform>({ x: 0, y: 0, k: 1 });
    const sizeRef = useRef({ w: 0, h: 0 });
    const hoverRef = useRef<string | null>(null);
    const gestureRef = useRef<Gesture | null>(null);
    const didFitRef = useRef(false);

    const [hoverInfo, setHoverInfo] = useState<Pick<GraphNodeDatum, 'title' | 'type' | 'degree'> | null>(null);

    /* ---------- rendering ---------- */

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const { w, h } = sizeRef.current;
        if (w === 0 || h === 0) return;

        const dpr = window.devicePixelRatio || 1;
        const t = transformRef.current;
        const { simNodes, simLinks, adjacency } = graphRef.current;
        const hover = hoverRef.current;
        const neighbors = hover ? adjacency.get(hover) : undefined;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.translate(t.x, t.y);
        ctx.scale(t.k, t.k);

        // Edges
        for (const l of simLinks) {
            const s = l.source as GraphNodeDatum;
            const tg = l.target as GraphNodeDatum;
            if (typeof s.x !== 'number' || typeof tg.x !== 'number') continue;
            const active = hover !== null && (s.id === hover || tg.id === hover);
            ctx.beginPath();
            ctx.moveTo(s.x, s.y ?? 0);
            ctx.lineTo(tg.x, tg.y ?? 0);
            ctx.strokeStyle = active ? 'rgba(167,139,250,0.85)' : hover ? 'rgba(148,163,184,0.05)' : 'rgba(148,163,184,0.2)';
            ctx.lineWidth = (active ? 1.8 : 1) / t.k;
            ctx.stroke();
        }

        // Nodes + labels
        ctx.textAlign = 'center';
        for (const n of simNodes) {
            const x = n.x ?? 0;
            const y = n.y ?? 0;
            const color = TYPE_META[n.type].hex;
            const isHover = hover === n.id;
            const isNeighbor = neighbors?.has(n.id) ?? false;
            const dim = hover !== null && !isHover && !isNeighbor;
            ctx.globalAlpha = dim ? 0.15 : 1;

            // glow
            ctx.beginPath();
            ctx.arc(x, y, n.r + (isHover ? 10 : 6), 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(color, isHover ? 0.25 : 0.1);
            ctx.fill();

            // body
            ctx.beginPath();
            ctx.arc(x, y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = '#0b0e17';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = (isHover ? 2.4 : 1.5) / t.k;
            ctx.stroke();

            // label — hidden when zoomed far out, unless it's part of the hovered neighborhood
            if (t.k > 0.45 || isHover || isNeighbor) {
                const fontSize = 11 / Math.max(t.k, 0.8); // roughly constant on screen
                ctx.font = `${isHover ? '600 ' : ''}${fontSize}px Inter, sans-serif`;
                ctx.fillStyle = isHover ? '#ffffff' : 'rgba(203,213,225,0.8)';
                ctx.fillText(truncate(n.title), x, y + n.r + fontSize + 3);
            }
            ctx.globalAlpha = 1;
        }
    }, []);

    const fitView = useCallback(() => {
        const { w, h } = sizeRef.current;
        const ns = graphRef.current.simNodes;
        if (ns.length === 0 || w === 0) return;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        ns.forEach((n) => {
            minX = Math.min(minX, (n.x ?? 0) - n.r);
            minY = Math.min(minY, (n.y ?? 0) - n.r);
            maxX = Math.max(maxX, (n.x ?? 0) + n.r);
            maxY = Math.max(maxY, (n.y ?? 0) + n.r);
        });
        const pad = 70;
        const k = clampK(Math.min(w / (maxX - minX + pad * 2), h / (maxY - minY + pad * 2)));
        transformRef.current = {
            k,
            x: w / 2 - ((minX + maxX) / 2) * k,
            y: h / 2 - ((minY + maxY) / 2) * k,
        };
        draw();
    }, [draw]);

    const zoomBy = useCallback((factor: number) => {
        const { w, h } = sizeRef.current;
        const t = transformRef.current;
        const k = clampK(t.k * factor);
        t.x = w / 2 - ((w / 2 - t.x) * k) / t.k;
        t.y = h / 2 - ((h / 2 - t.y) * k) / t.k;
        t.k = k;
        draw();
    }, [draw]);

    /* ---------- simulation lifecycle ---------- */

    useEffect(() => {
        const { w, h } = sizeRef.current;
        // Reuse positions of surviving nodes → the graph evolves instead of exploding.
        const prevPositions = new Map(
            graphRef.current.simNodes.map((n) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]),
        );
        const graph = buildGraph(nodes, links, prevPositions, w || 800, h || 600);
        graphRef.current = graph;

        simRef.current?.stop();
        const sim = forceSimulation(graph.simNodes)
            .force('link', forceLink<GraphNodeDatum, GraphLinkDatum>(graph.simLinks).id((d) => d.id).distance(100).strength(0.5))
            .force('charge', forceManyBody().strength(-260))
            .force('collide', forceCollide<GraphNodeDatum>().radius((d) => d.r + 12))
            .force('x', forceX<GraphNodeDatum>((w || 800) / 2).strength(0.05))
            .force('y', forceY<GraphNodeDatum>((h || 600) / 2).strength(0.05))
            .on('tick', draw);
        simRef.current = sim;

        // First visit: let the layout settle a moment, then frame it nicely.
        if (!didFitRef.current && nodes.length > 0) {
            const timer = window.setTimeout(() => {
                fitView();
                didFitRef.current = true;
            }, 900);
            return () => { window.clearTimeout(timer); sim.stop(); };
        }
        return () => sim.stop();
    }, [nodes, links, draw, fitView]);

    /* ---------- responsive + HiDPI canvas ---------- */

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;
        const ro = new ResizeObserver(() => {
            const dpr = window.devicePixelRatio || 1;
            const { clientWidth, clientHeight } = container;
            sizeRef.current = { w: clientWidth, h: clientHeight };
            canvas.width = clientWidth * dpr;
            canvas.height = clientHeight * dpr;
            canvas.style.width = `${clientWidth}px`;
            canvas.style.height = `${clientHeight}px`;
            simRef.current?.force('x', forceX(clientWidth / 2).strength(0.05));
            simRef.current?.force('y', forceY(clientHeight / 2).strength(0.05));
            simRef.current?.alpha(0.3).restart();
            draw();
        });
        ro.observe(container);
        return () => ro.disconnect();
    }, [draw]);

    /* ---------- wheel zoom (non-passive so we can preventDefault) ---------- */

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const t = transformRef.current;
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const k = clampK(t.k * Math.exp(-e.deltaY * 0.0016));
            t.x = mx - ((mx - t.x) * k) / t.k;
            t.y = my - ((my - t.y) * k) / t.k;
            t.k = k;
            draw();
        };
        canvas.addEventListener('wheel', onWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', onWheel);
    }, [draw]);

    /* ---------- pointer interactions ---------- */

    const toWorld = (clientX: number, clientY: number) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const t = transformRef.current;
        return { x: (clientX - rect.left - t.x) / t.k, y: (clientY - rect.top - t.y) / t.k };
    };

    const nodeAt = (wx: number, wy: number): GraphNodeDatum | null => {
        const ns = graphRef.current.simNodes;
        for (let i = ns.length - 1; i >= 0; i--) {
            const n = ns[i];
            const dx = wx - (n.x ?? 0);
            const dy = wy - (n.y ?? 0);
            if (dx * dx + dy * dy <= (n.r + 5) ** 2) return n;
        }
        return null;
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.setPointerCapture(e.pointerId);
        const { x, y } = toWorld(e.clientX, e.clientY);
        const hit = nodeAt(x, y);
        if (hit) {
            gestureRef.current = { kind: 'node', id: hit.id, moved: 0 };
            hit.fx = hit.x;
            hit.fy = hit.y;
            simRef.current?.alphaTarget(0.25).restart();
        } else {
            gestureRef.current = { kind: 'pan', startX: e.clientX, startY: e.clientY, origin: { ...transformRef.current }, moved: 0 };
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const g = gestureRef.current;

        if (!g) {
            const { x, y } = toWorld(e.clientX, e.clientY);
            const hit = nodeAt(x, y);
            const id = hit?.id ?? null;
            if (hoverRef.current !== id) {
                hoverRef.current = id;
                setHoverInfo(hit ? { title: hit.title, type: hit.type, degree: hit.degree } : null);
                draw();
            }
            canvas.style.cursor = hit ? 'pointer' : 'grab';
            return;
        }

        g.moved += Math.abs(e.movementX) + Math.abs(e.movementY);
        if (g.kind === 'node') {
            const { x, y } = toWorld(e.clientX, e.clientY);
            const n = graphRef.current.simNodes.find((nn) => nn.id === g.id);
            if (n) { n.fx = x; n.fy = y; }
        } else {
            transformRef.current = {
                ...g.origin,
                x: g.origin.x + (e.clientX - g.startX),
                y: g.origin.y + (e.clientY - g.startY),
            };
            draw();
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const g = gestureRef.current;
        gestureRef.current = null;
        canvasRef.current?.releasePointerCapture(e.pointerId);
        if (!g) return;

        if (g.kind === 'node') {
            const n = graphRef.current.simNodes.find((nn) => nn.id === g.id);
            if (n) { n.fx = null; n.fy = null; }
            simRef.current?.alphaTarget(0);
            // Click, not drag → open the node
            if (g.moved < 6 && n) onSelect(n.id);
        }
    };

    const handlePointerLeave = () => {
        if (hoverRef.current !== null) {
            hoverRef.current = null;
            setHoverInfo(null);
            draw();
        }
    };

    /* ---------- markup ---------- */

    return (
        <div ref={containerRef} className="relative h-full w-full">
            <canvas
                ref={canvasRef}
                className="block h-full w-full cursor-grab touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
            />

            {/* Zoom / fit controls */}
            <div className="absolute right-3 top-3 flex flex-col gap-1.5">
                {[
                    { label: 'Zoom in', icon: <Plus size={15} />, act: () => zoomBy(1.35) },
                    { label: 'Zoom out', icon: <Minus size={15} />, act: () => zoomBy(1 / 1.35) },
                    { label: 'Fit to view', icon: <Maximize2 size={15} />, act: fitView },
                ].map((b) => (
                    <button
                        key={b.label}
                        onClick={b.act}
                        aria-label={b.label}
                        title={b.label}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-ink/80 text-slate-300 backdrop-blur transition hover:border-violet-400/40 hover:text-white"
                    >
                        {b.icon}
                    </button>
                ))}
            </div>

            {/* Hover info card */}
            {hoverInfo && (
                <div className="pointer-events-none absolute left-3 top-3 rounded-xl border border-white/10 bg-ink/90 px-4 py-3 backdrop-blur">
                    <p className="max-w-56 truncate text-sm font-semibold text-white">{hoverInfo.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                        {TYPE_META[hoverInfo.type].label} · {hoverInfo.degree} connection{hoverInfo.degree === 1 ? '' : 's'}
                    </p>
                </div>
            )}
        </div>
    );
}