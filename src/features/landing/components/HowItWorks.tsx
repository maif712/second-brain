// src/features/landing/components/HowItWorks.tsx
import { Inbox, RefreshCw, Waypoints, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const STEPS: { n: string; title: string; desc: string; icon: LucideIcon }[] = [
    { n: '01', title: 'Capture', desc: 'Log concepts, notes, questions and resources the moment you meet them — before they evaporate.', icon: Inbox },
    { n: '02', title: 'Connect', desc: 'Link ideas together — React → State → Context — until a real map of your understanding emerges.', icon: Waypoints },
    { n: '03', title: 'Review', desc: "Revisit what's fading. Knowledge Health and spaced review keep the forgetting curve away.", icon: RefreshCw },
];

export function HowItWorks() {
    return (
        <section id="how" className="relative px-6 py-24">
            <div className="mx-auto max-w-7xl">
                <SectionHeading eyebrow="The loop" title="Capture. Connect. Review." sub="A simple loop that turns scattered information into durable understanding." />
                <div className="grid gap-4 md:grid-cols-3">
                    {STEPS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.n} data-reveal className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20">
                                <span className="pointer-events-none absolute -right-2 -top-6 font-display text-8xl font-bold text-white/4 transition group-hover:text-violet-400/10">{s.n}</span>
                                <div className="mb-5 inline-grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br from-violet-500/20 to-cyan-500/20 text-violet-300 ring-1 ring-violet-400/30">
                                    <Icon size={19} />
                                </div>
                                <h3 className="font-display text-lg font-semibold text-white">{s.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}