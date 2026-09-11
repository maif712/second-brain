// src/features/landing/components/GraphTeaser.tsx
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const NODES = [
    { id: 'react', label: 'React', x: 240, y: 200, r: 34, color: '#a78bfa' },
    { id: 'state', label: 'State', x: 105, y: 110, r: 22, color: '#a78bfa' },
    { id: 'context', label: 'Context', x: 385, y: 95, r: 22, color: '#a78bfa' },
    { id: 'effect', label: 'useEffect', x: 120, y: 320, r: 22, color: '#a78bfa' },
    { id: 'hooks', label: 'Hooks', x: 350, y: 315, r: 24, color: '#a78bfa' },
    { id: 'q', label: 'Why 2 renders?', x: 58, y: 215, r: 18, color: '#fbbf24' },
    { id: 'r', label: 'react.dev', x: 425, y: 210, r: 18, color: '#34d399' },
];
const EDGES: [string, string][] = [
    ['react', 'state'], ['react', 'context'], ['react', 'effect'], ['react', 'hooks'],
    ['hooks', 'effect'], ['q', 'effect'], ['r', 'react'], ['state', 'hooks'],
];
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

export function GraphTeaser() {
    const scope = useRef(null);

    useGSAP(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const st = { trigger: scope.current, start: 'top 70%', once: true };
        gsap.from('.teaser-node', { opacity: 0, scale: 0, transformOrigin: 'center', stagger: 0.08, duration: 0.7, ease: 'back.out(2)', scrollTrigger: st });
        gsap.from('.teaser-edge', { opacity: 0, duration: 1, stagger: 0.06, ease: 'power2.out', scrollTrigger: st });
        gsap.to('[data-teaser="visual"]', {
            yPercent: -6, ease: 'none',
            scrollTrigger: { trigger: scope.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
    }, { scope });

    return (
        <section id="graph" ref={scope} className="relative px-6 py-28">
            <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
                <div>
                    <span data-reveal className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                        Knowledge Graph
                    </span>
                    <h2 data-reveal className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Watch your knowledge <span className="text-gradient">take shape</span>
                    </h2>
                    <p data-reveal className="mt-5 text-slate-400">
                        Your graph grows every time you link two ideas. Isolated nodes, orphaned questions and fading topics become visible — so you know exactly what to study next.
                    </p>
                    <ul data-reveal className="mt-6 space-y-3 text-sm text-slate-300">
                        {['Auto-suggested connections between related items', 'Spot orphan nodes that need linking', 'Color-coded by type: concept, note, question, resource'].map((t) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/30"><Check size={11} /></span>
                                {t}
                            </li>
                        ))}
                    </ul>
                    <div data-reveal className="mt-8">
                        <Button to="/dashboard" magnetic>Open the graph <span aria-hidden>→</span></Button>
                    </div>
                </div>

                <div data-teaser="visual" className="flex justify-center">
                    <svg viewBox="0 0 480 420" className="w-full max-w-xl">
                        {EDGES.map(([a, b], i) => (
                            <line key={i} className="teaser-edge" x1={byId[a].x} y1={byId[a].y} x2={byId[b].x} y2={byId[b].y} stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                        ))}
                        {NODES.map((n) => (
                            <g key={n.id} className="teaser-node">
                                <circle cx={n.x} cy={n.y} r={n.r + 10} fill={n.color} opacity="0.12" />
                                <circle cx={n.x} cy={n.y} r={n.r} fill="#0b0e17" stroke={n.color} strokeWidth="1.5" />
                                <text x={n.x} y={n.y + n.r + 16} textAnchor="middle" fontSize="11" className="fill-slate-400">{n.label}</text>
                            </g>
                        ))}
                        <circle cx={byId.react.x} cy={byId.react.y} r={byId.react.r} fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.6"
                            className="animate-ping origin-center transform-fill" />
                    </svg>
                </div>
            </div>
        </section>
    );
}