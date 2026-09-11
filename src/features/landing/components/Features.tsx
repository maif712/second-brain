// src/features/landing/components/Features.tsx
import { CalendarClock, HeartPulse, Lock, Search } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { SpotlightCard } from './SpotlightCard';
import { HealthRing } from '@/components/ui/HealthRing';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';

function CardShell({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children?: React.ReactNode }) {
    return (
        <div className="flex h-full flex-col justify-between gap-6 p-7">
            <div>
                <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/30">{icon}</div>
                <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
            </div>
            {children}
        </div>
    );
}

export function Features() {
    return (
        <section id="features" className="relative px-6 py-28">
            <div className="mx-auto max-w-7xl">
                <SectionHeading
                    eyebrow="Capabilities"
                    title={<>Everything a brain does, <span className="text-gradient">minus the forgetting</span></>}
                    sub="Six systems working together so ideas never die in a folder."
                />

                <div className="grid gap-4 md:grid-cols-6">
                    {/* 1 — Knowledge graph (large) */}
                    <SpotlightCard className="min-h-85 md:col-span-4 md:row-span-2">
                        <CardShell
                            icon={<span className="text-lg">🕸️</span>}
                            title="Interactive Knowledge Graph"
                            desc="Every idea is a node, every insight an edge. Watch React connect to State, Context and useEffect — then zoom through your own constellation of thought."
                        >
                            <svg viewBox="0 0 400 150" className="w-full opacity-90 transition-transform duration-500 group-hover:scale-[1.04]">
                                {[
                                    [80, 75, 200, 40], [80, 75, 200, 110], [200, 40, 320, 75],
                                    [200, 110, 320, 75], [200, 40, 200, 110],
                                ].map(([x1, y1, x2, y2], i) => (
                                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                                ))}
                                {[
                                    { x: 80, y: 75, c: '#a78bfa', label: 'React' },
                                    { x: 200, y: 40, c: '#a78bfa', label: 'State' },
                                    { x: 200, y: 110, c: '#a78bfa', label: 'Context' },
                                    { x: 320, y: 75, c: '#fbbf24', label: 'Why?' },
                                ].map((n) => (
                                    <g key={n.label}>
                                        <circle cx={n.x} cy={n.y} r={16} fill={n.c} opacity={0.12} />
                                        <circle cx={n.x} cy={n.y} r={9} fill="#0b0e17" stroke={n.c} strokeWidth="1.5" />
                                        <text x={n.x} y={n.y + 30} textAnchor="middle" fontSize="10" className="fill-slate-500">{n.label}</text>
                                    </g>
                                ))}
                            </svg>
                        </CardShell>
                    </SpotlightCard>

                    {/* 2 — Smart search */}
                    <SpotlightCard className="md:col-span-2">
                        <CardShell icon={<Search size={18} />} title="Smart Search" desc="Find that half-remembered idea in milliseconds — titles, tags and content, ranked.">
                            <div className="rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs">
                                <p className="text-slate-400"><span className="text-violet-300">❯</span> <span className="text-white">"context re-render"</span></p>
                                <div className="mt-2 space-y-1">
                                    <div className="rounded-md bg-white/5 px-2 py-1 text-slate-300">Context API · concept</div>
                                    <div className="px-2 py-1 text-slate-500">When does Context re-render? · question</div>
                                </div>
                            </div>
                        </CardShell>
                    </SpotlightCard>

                    {/* 3 — Spaced review */}
                    <SpotlightCard className="md:col-span-2">
                        <CardShell icon={<CalendarClock size={18} />} title="Spaced Review" desc="Items you haven't revisited surface automatically — beat the forgetting curve.">
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/3 px-3 py-2">
                                    <span className="text-slate-300">useEffect</span>
                                    <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-amber-300 ring-1 ring-amber-400/30">35d ago</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/3 px-3 py-2">
                                    <span className="text-slate-300">Context API</span>
                                    <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-amber-300 ring-1 ring-amber-400/30">21d ago</span>
                                </div>
                            </div>
                        </CardShell>
                    </SpotlightCard>

                    {/* 4 — Knowledge health */}
                    <SpotlightCard className="md:col-span-2">
                        <CardShell icon={<HeartPulse size={18} />} title="Knowledge Health" desc="One honest score: freshness, connectivity, answered questions, tagging.">
                            <div className="flex justify-center"><HealthRing score={73} size={104} /></div>
                        </CardShell>
                    </SpotlightCard>

                    {/* 5 — Four building blocks */}
                    <SpotlightCard className="md:col-span-2">
                        <CardShell icon={<span className="text-lg">🧩</span>} title="Four building blocks" desc="Not just notes — model knowledge the way your brain actually stores it.">
                            <div className="flex flex-wrap gap-2">
                                {Object.values(TYPE_META).map((m) => (
                                    <span key={m.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 ${m.bg} ${m.text} ${m.ring}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} /> {m.plural}
                                    </span>
                                ))}
                            </div>
                        </CardShell>
                    </SpotlightCard>

                    {/* 6 — Local-first */}
                    <SpotlightCard className="md:col-span-2">
                        <CardShell icon={<Lock size={18} />} title="Local-first & private" desc="Everything lives in your browser's localStorage. No account. No cloud. No lock-in.">
                            <code className="block rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-emerald-300">
                                localStorage["second-brain:v1"] ✓
                            </code>
                        </CardShell>
                    </SpotlightCard>
                </div>
            </div>
        </section>
    );
}