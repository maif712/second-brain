import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/** Magnetic hover: element is attracted to the cursor, springs back on leave. */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || strength === 0) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.35)' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.35)' });

        const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * strength);
            yTo((e.clientY - r.top - r.height / 2) * strength);
        };
        const leave = () => { xTo(0); yTo(0); };

        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        return () => {
            el.removeEventListener('pointermove', move);
            el.removeEventListener('pointerleave', leave);
        };
    }, [strength]);

    return ref;
}