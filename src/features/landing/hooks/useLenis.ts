// src/features/landing/hooks/useLenis.ts  (rewritten)
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useLenis() {
    useEffect(() => {
        // Edge case: users who prefer reduced motion get plain native scrolling
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({
            duration: 1.15,
            // Lenis-recommended easing — silky, no overshoot, no rubber-band
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.6,
            anchors: true, // smooth-scroll our #features / #graph anchor links
        });

        // Keep ScrollTrigger perfectly in sync with Lenis
        lenis.on('scroll', () => ScrollTrigger.update());

        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(raf);
            lenis.destroy();
        };
    }, []);
}