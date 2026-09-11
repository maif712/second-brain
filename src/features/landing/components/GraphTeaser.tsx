// src/features/landing/components/GraphTeaser.tsx  (rewritten — cinematic build)
import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type NodeType = 'concept' | 'question' | 'resource';

const NODES: { id: string; label: string; type: NodeType; x: number; y: number; r: number; color: string }[] = [
    { id: 'react', label: 'React', type: 'concept', x: 240, y: 200, r: 30, color: '#a78bfa' },
    { id: 'state', label: 'State', type: 'concept', x: 105, y: 110, r: 20, color: '#a78bfa' },
    { id: 'context', label: 'Context', type: 'concept', x: 385, y: 95, r: 20, color: '#a78bfa' },
    { id: 'effect', label: 'useEffect', type: 'concept', x: 120, y: 320, r: 20, color: '#a78bfa' },
    { id: 'hooks', label: 'Hooks', type: 'concept', x: 350, y: 315, r: 22, color: '#a78bfa' },
    { id: 'q', label: 'Why 2 renders?', type: 'question', x: 55, y: 215, r: 16, color: '#fbbf24' },
    { id: 'r', label: 'react.dev', type: 'resource', x: 428, y: 210, r: 16, color: '#34d399' },
];

const EDGES: [string, string][] = [
    ['react', 'state'], ['react', 'context'], ['react', 'effect'], ['react', 'hooks'],
    ['hooks', 'effect'], ['q', 'effect'], ['r', 'react'], ['state', 'hooks'],
];

/** The build order — the graph grows outward from the React core. */
const BUILD: [string, string][] = [
    ['react', 'state'],
    ['react', 'context'],
    ['react', 'hooks'],
    ['hooks', 'effect'],
    ['react', 'effect'],
    ['q', 'effect'],
    ['r', 'react'],
    ['state', 'hooks'],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
const TOUR = ['react', 'state', 'effect', 'q', 'hooks', 'context', 'react'];

/* ---- pacing knobs (tune the feel here) ---- */
const DRAW = (len: number) => 0.28 + len / 650; // longer lines draw longer
const NEW_HOLD = 0.42;                           // beat to admire a new node
const PULSE_HOLD = 0.14;                         // beat between existing-node links
const OVERLAP = 0.1;                             // next line starts slightly early
const GROW_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function GraphTeaser() {
    const scope = useRef(null);
    const cursorRef = useRef<SVGGElement>(null);
    const ringRef = useRef<SVGCircleElement>(null);
    const sparkRef = useRef<SVGCircleElement>(null);
    const rippleRef = useRef<SVGCircleElement>(null);
    const tourRef = useRef<gsap.core.Timeline | null>(null);
    const buildDoneRef = useRef(false);
    const [hovered, setHovered] = useState<string | null>(null);
    const [live, setLive] = useState(true);

    useGSAP(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const spark = sparkRef.current;
        const ripple = rippleRef.current;
        const cursor = cursorRef.current;
        const ring = ringRef.current;
        if (!spark || !ripple || !cursor || !ring) return;

        /* ---------- initial state: empty space ---------- */
        gsap.set('[data-node]', { scale: 0, transformOrigin: 'center' });
        gsap.set('[data-edge]', { opacity: 0 });
        gsap.set(spark, { opacity: 0 });
        gsap.set(ripple, { opacity: 0 });

        /* ---------- ambient motion ---------- */
        gsap.to('[data-teaser="svg"]', { y: 8, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        gsap.to('[data-teaser="visual"]', {
            yPercent: -6, ease: 'none',
            scrollTrigger: { trigger: scope.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });

        /* ---------- the cursor tour (plays AFTER the build) ---------- */
        gsap.set(cursor, { x: byId.react.x + 110, y: byId.react.y + 150 });
        const tour = gsap.timeline({ repeat: -1, repeatDelay: 1.8, paused: true });
        TOUR.forEach((id) => {
            const n = byId[id];
            tour
                .call(() => setHovered(null), undefined, '+=0.2')
                .to(cursor, { x: n.x + 5, y: n.y + 7, duration: 1.15, ease: 'power3.inOut' })
                .call(() => setHovered(id))
                .fromTo(ring, { attr: { r: 8 }, opacity: 0.7 }, { attr: { r: 32 }, opacity: 0, duration: 0.8, ease: 'power2.out' }, '<0.05')
                .to({}, { duration: 1.2 });
        });
        tourRef.current = tour;

        /* ---------- synapse pulses (life after the build) ---------- */
        const startAmbient = () => {
            const pulse = () => {
                const [a, b] = EDGES[gsap.utils.random(0, EDGES.length - 1, 1)];
                const A = byId[a];
                const B = byId[b];
                gsap
                    .timeline({ delay: gsap.utils.random(1.6, 3.4), onComplete: pulse })
                    .set(spark, { attr: { cx: A.x, cy: A.y }, opacity: 0.8 })
                    .to(spark, { attr: { cx: B.x, cy: B.y }, duration: 1.1, ease: 'power1.inOut' })
                    .to(spark, { opacity: 0, duration: 0.25 });
            };
            pulse();
        };

        /* ================= THE CINEMATIC BUILD ================= */
        const tl = gsap.timeline({
            scrollTrigger: { trigger: scope.current, start: 'top 65%', once: true },
        });

        const burst = (x: number, y: number, rMax: number, at: number) => {
            tl.fromTo(
                ripple,
                { attr: { cx: x, cy: y, r: 4 }, opacity: 0.85 },
                { attr: { r: rMax }, opacity: 0, duration: 0.7, ease: 'power2.out' },
                at,
            );
        };

        // Act 1 — the seed ignites
        burst(byId.react.x, byId.react.y, 54, 0.15);
        tl.to('[data-node="react"]', { scale: 1, duration: 0.9, ease: 'back.out(2.2)' }, 0.15);

        // Act 2 — lines grow outward, nodes are born on arrival
        const seen = new Set<string>(['react']);
        let t = 0.95;

        for (const [aId, bId] of BUILD) {
            const A = byId[aId];
            const B = byId[bId];
            const el = `[data-edge="${aId}~${bId}"]`;
            const len = Math.hypot(B.x - A.x, B.y - A.y);
            const drawDur = DRAW(len);

            // FIX: if the SOURCE hasn't appeared yet, birth it FIRST —
            // the line then grows OUT of the new node (question → useEffect, resource → react)
            if (!seen.has(aId)) {
                seen.add(aId);
                burst(A.x, A.y, 38, t);
                tl.to(`[data-node="${aId}"]`, { scale: 1, duration: 0.8, ease: 'back.out(2.4)' }, t + 0.03);
                t += 0.5; // a beat to register the new node before its line grows
            }

            const isNewTarget = !seen.has(bId);

            // line draws itself…
            tl.set(el, { strokeDasharray: len + 2, strokeDashoffset: len + 2, opacity: 1 }, t);
            // …with a comet riding the leading edge
            tl.set(spark, { attr: { cx: A.x, cy: A.y }, opacity: 0.95 }, t);
            tl.to(el, { strokeDashoffset: 0, duration: drawDur, ease: 'power2.inOut' }, t);
            tl.to(spark, { attr: { cx: B.x, cy: B.y }, duration: drawDur, ease: 'power2.inOut' }, t);
            tl.set(spark, { opacity: 0 }, t + drawDur);

            if (isNewTarget) {
                // the arrival births the node
                seen.add(bId);
                burst(B.x, B.y, 38, t + drawDur);
                tl.to(`[data-node="${bId}"]`, { scale: 1, duration: 0.8, ease: 'back.out(2.4)' }, t + drawDur + 0.03);
                t += drawDur + NEW_HOLD - OVERLAP;
            } else {
                // linking two existing nodes — small arrival pulse
                burst(B.x, B.y, 16, t + drawDur);
                t += drawDur + PULSE_HOLD - OVERLAP;
            }
        
        }

        // Defensive net: no node may remain unborn, whatever the BUILD order says
        tl.to('[data-node]', { scale: 1, duration: 0.4 }, t + 0.2);
    

        // Act 3 — hand the edges back to React (so hover styles work again)
        tl.set('[data-edge]', { clearProps: 'strokeDasharray,strokeDashoffset,opacity' }, t + 0.3);

    // The camera: one slow zoom-out across the entire build
    tl.fromTo(
        '[data-teaser="camera"]',
        { scale: 1.32, svgOrigin: '240 200' },
        { scale: 1, duration: t + 0.6, ease: 'power1.inOut' },
        0,
    );

    // …and then the scene comes alive
    tl.call(
        () => {
            buildDoneRef.current = true;
            startAmbient();
            tour.play();
        },
        undefined,
        t + 0.8,
    );
}, { scope });

/* ---------- real pointer takes over ---------- */
const enterNode = (id: string) => {
    tourRef.current?.pause();
    setLive(false);
    setHovered(id);
};
const leaveGraph = () => {
    setHovered(null);
    setLive(true);
    if (buildDoneRef.current) tourRef.current?.resume(); // never start the tour mid-build
};

return (
    <section id="graph" ref={scope} className="relative px-6 py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
            {/* Copy column */}
            <div>
                <span data-reveal className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                    Knowledge Graph
                </span>
                <h2 data-reveal className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
                    Watch your knowledge <span className="text-gradient">take shape</span>
                </h2>
                <p data-reveal className="mt-5 text-slate-400">
                    Every idea is a node, every insight an edge. Watch the network build itself — line by line,
                    thought by thought — then move your cursor in and take the controls.
                </p>
                <ul data-reveal className="mt-6 space-y-3 text-sm text-slate-300">
                    {[
                        'Connections draw themselves; nodes bloom on arrival',
                        'Hovering lights up a node\u2019s whole neighborhood',
                        'Isolated nodes stand out, so you know what to link next',
                    ].map((t) => (
                        <li key={t} className="flex items-start gap-2.5">
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/30">
                                <Check size={11} />
                            </span>
                            {t}
                        </li>
                    ))}
                </ul>
                <div data-reveal className="mt-8">
                    <Button to="/dashboard" magnetic>Open the graph <span aria-hidden>→</span></Button>
                </div>
            </div>

            {/* Interactive poster */}
            <div data-teaser="visual" className="relative flex justify-center">
                {/* Narration chip */}
                <div
                    className={cn(
                        'pointer-events-none absolute left-2 top-0 z-10 rounded-full border border-white/10 bg-ink/85 px-4 py-2 text-xs backdrop-blur transition-all duration-300 sm:left-6',
                        hovered ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                    )}
                >
                    {hovered && (
                        <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: byId[hovered].color }} />
                            <span className="font-medium text-slate-100">{byId[hovered].label}</span>
                            <span className="text-slate-500">· {byId[hovered].type}</span>
                        </span>
                    )}
                </div>

                <svg viewBox="0 0 480 420" data-teaser="svg" className="w-full max-w-xl" onPointerLeave={leaveGraph}>
                    {/* Camera layer — the slow documentary zoom-out lives here */}
                    <g data-teaser="camera">
                        {/* Edges */}
                        {EDGES.map(([a, b]) => {
                            const A = byId[a];
                            const B = byId[b];
                            const active = hovered === a || hovered === b;
                            const dim = hovered !== null && !active;
                            return (
                                <line
                                    key={`${a}~${b}`}
                                    data-edge={`${a}~${b}`}
                                    className="tg-edge"
                                    pointerEvents="none"
                                    x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                                    stroke={active ? '#a78bfa' : 'rgba(148,163,184,0.22)'}
                                    strokeWidth={active ? 1.6 : 1}
                                    opacity={dim ? 0.25 : 1}
                                    style={{ transition: 'stroke 350ms, stroke-width 350ms, opacity 350ms' }}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {NODES.map((n) => {
                            const isH = hovered === n.id;
                            const near =
                                hovered !== null && !isH &&
                                EDGES.some(([a, b]) => (a === hovered && b === n.id) || (b === hovered && a === n.id));
                            return (
                                <g key={n.id} data-node={n.id} className="cursor-pointer" onPointerEnter={() => enterNode(n.id)}>
                                    <g
                                        style={{
                                            transform: isH ? 'scale(1.24)' : near ? 'scale(1.08)' : 'scale(1)',
                                            transformBox: 'fill-box',
                                            transformOrigin: 'center',
                                            transition: `transform 600ms ${GROW_EASE}`,
                                        }}
                                    >
                                        <circle
                                            cx={n.x} cy={n.y} r={n.r + 12} fill={n.color}
                                            opacity={isH ? 0.3 : near ? 0.2 : 0.12}
                                            style={{ transition: 'opacity 400ms' }}
                                        />
                                        <circle cx={n.x} cy={n.y} r={n.r} fill="#0b0e17" stroke={n.color} strokeWidth={isH ? 2.4 : 1.5} style={{ transition: 'stroke-width 350ms' }} />
                                        <text
                                            x={n.x} y={n.y + n.r + 16} textAnchor="middle" fontSize="11"
                                            fill={isH ? '#ffffff' : 'rgba(148,163,184,0.85)'}
                                            style={{ transition: 'fill 350ms' }}
                                        >
                                            {n.label}
                                        </text>
                                    </g>
                                </g>
                            );
                        })}

                        {/* FX: arrival ripple + comet spark */}
                        <circle ref={rippleRef} cx={0} cy={0} r={4} fill="none" stroke="#c4b5fd" strokeWidth={1.5} opacity={0} pointerEvents="none" />
                        <circle ref={sparkRef} cx={0} cy={0} r={3.5} fill="#e9d5ff" opacity={0} pointerEvents="none" style={{ filter: 'drop-shadow(0 0 6px rgba(196,181,253,0.9))' }} />

                        {/* Simulated cursor */}
                        <g className="pointer-events-none" style={{ opacity: live ? 1 : 0, transition: 'opacity 300ms' }}>
                            <g ref={cursorRef}>
                                <circle ref={ringRef} cx={0} cy={0} r={8} fill="none" stroke="#a78bfa" strokeWidth={1.5} opacity={0} />
                                <circle cx={0} cy={0} r={11} fill="#a78bfa" opacity={0.16} />
                                <path d="M0 0 L0 15 L4.2 11.8 L7.4 18 L10 16.7 L6.8 10.6 L11.5 10 Z" fill="#ffffff" stroke="#0b0e17" strokeWidth={1} />
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
        </div>
    </section>
);
}