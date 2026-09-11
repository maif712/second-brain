// src/features/landing/LandingPage.tsx
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLenis } from './hooks/useLenis';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { GraphTeaser } from './components/GraphTeaser';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function LandingPage() {
    const scope = useRef(null);
    useLenis();

    // Generic scroll-reveal for every [data-reveal] element on the page.
    useGSAP(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
            gsap.from(el, {
                y: 44,
                autoAlpha: 0,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            });
        });
    }, { scope });

    return (
        <div ref={scope} className="relative min-h-screen overflow-x-clip bg-void text-slate-200">
            <div className="noise" aria-hidden />
            <Navbar />
            <main>
                <Hero />
                <Marquee />
                <HowItWorks />
                <Features />
                <GraphTeaser />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}