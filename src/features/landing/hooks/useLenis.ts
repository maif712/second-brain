import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useLenis() {
    useEffect(() => {
        const lenis = new Lenis({ lerp: 0.09 });
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