// src/features/landing/components/Hero.tsx
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import type { EntityType } from '@/features/knowledge/types';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CHIPS: { label: string; type: EntityType; pos: string }[] = [
    { label: 'React', type: 'concept', pos: 'left-[5%] top-[26%]' },
    { label: 'useEffect', type: 'concept', pos: 'right-[6%] top-[24%]' },
    { label: 'Why two renders?', type: 'question', pos: 'left-[9%] bottom-[24%]' },
    { label: 'react.dev', type: 'resource', pos: 'right-[10%] bottom-[22%]' },
    { label: 'State = snapshot', type: 'note', pos: 'left-[41%] top-[13%]' },
];

export function Hero() {
    const scope = useRef(null);

    useGSAP(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Intro timeline
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('[data-hero="badge"]', { y: 20, autoAlpha: 0, duration: 0.7 })
            .from('[data-hero="line"]', { yPercent: 120, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, '-=0.4')
            .from('[data-hero="sub"]', { y: 24, autoAlpha: 0, duration: 0.8 }, '-=0.6')
            .from('[data-hero="cta"] > *', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, '-=0.5')
            .from('[data-hero="stats"] > *', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, '-=0.4')
            .from('[data-hero="chip"]', { scale: 0, autoAlpha: 0, stagger: 0.07, duration: 0.6, ease: 'back.out(2.2)' }, '-=0.8');

        // Floating chips
        gsap.utils.toArray<HTMLElement>('[data-hero="chip"]').forEach((chip, i) => {
            gsap.to(chip, {
                y: i % 2 ? 14 : -14,
                duration: 2.4 + (i % 3) * 0.6,
                yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.15,
            });
        });

        // Drifting glow orbs
        gsap.to('[data-hero="orb-a"]', { x: 60, y: -40, duration: 9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        gsap.to('[data-hero="orb-b"]', { x: -50, y: 30, duration: 11, yoyo: true, repeat: -1, ease: 'sine.inOut' });

        // Parallax fade-out while scrolling away
        gsap.to('[data-hero="content"]', {
            yPercent: 18, autoAlpha: 0.15, ease: 'none',
            scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
        });
    }, { scope });

    return (
        <section ref={scope} className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
            {/* Backdrop layers */}
            <div className="bg-grid absolute inset-0 mask-[radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" aria-hidden />
            <div data-hero="orb-a" className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-500/25 blur-[120px]" aria-hidden />
            <div data-hero="orb-b" className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-cyan-400/20 blur-[110px]" aria-hidden />

            {/* Floating knowledge chips (desktop only) */}
            {CHIPS.map((c) => (
                <div key={c.label} data-hero="chip" className={`glass absolute z-20 hidden items-center gap-2 rounded-full px-4 py-2 text-xs text-slate-300 xl:flex ${c.pos}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${TYPE_META[c.type].dot}`} />
                    {c.label}
                </div>
            ))}

            <div data-hero="content" className="relative z-10 max-w-4xl text-center">
                <div data-hero="badge" className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-400 backdrop-blur">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Local-first · No account · Your data never leaves the browser
                </div>

                <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-7xl lg:text-8xl">
                    <span className="block overflow-hidden pb-1">
                        <span data-hero="line" className="block">Stop saving notes.</span>
                    </span>
                    <span className="block overflow-hidden pb-2">
                        <span data-hero="line" className="block">Start growing <span className="text-gradient">a second brain.</span></span>
                    </span>
                </h1>

                <p data-hero="sub" className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
                    Capture <span className="text-slate-200">concepts, notes, questions and resources</span>, link them together,
                    and watch your understanding take shape as a living knowledge graph.
                </p>

                <div data-hero="cta" className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button to="/dashboard" size="lg" magnetic>
                        Enter your Second Brain <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                    <Button href="#features" variant="ghost" size="lg">Explore features</Button>
                </div>

                <div data-hero="stats" className="mt-16 flex items-center justify-center gap-10 sm:gap-14">
                    {[['4', 'knowledge types'], ['∞', 'connections'], ['0', 'servers involved']].map(([v, l]) => (
                        <div key={l} className="text-center">
                            <div className="font-display text-3xl font-bold text-white">{v}</div>
                            <div className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">{l}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}