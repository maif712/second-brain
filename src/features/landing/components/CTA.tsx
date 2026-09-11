// src/features/landing/components/CTA.tsx
import { Button } from '@/components/ui/Button';

export function CTA() {
  return (
    <section className="relative px-6 py-28">
      <div data-reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-violet-500/15 via-transparent to-cyan-500/10 px-6 py-20 text-center">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/25 blur-[100px]" aria-hidden />
        <h2 className="relative font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Ready to think in <span className="text-gradient">connections?</span>
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-slate-400">
          No account. No cloud. Open the dashboard and start linking ideas in under a minute.
        </p>
        <div className="relative mt-8">
          <Button to="/dashboard" size="lg" magnetic>Open the dashboard</Button>
        </div>
        <p className="relative mt-5 text-xs text-slate-500">Everything is stored locally in your browser.</p>
      </div>
    </section>
  );
}