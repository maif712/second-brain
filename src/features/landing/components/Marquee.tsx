// src/features/landing/components/Marquee.tsx
const WORDS = ['Concepts', 'Notes', 'Questions', 'Resources', 'Knowledge Graph', 'Spaced Review', 'Smart Search', 'Local-first'];

export function Marquee() {
  const row = [...WORDS, ...WORDS]; // duplicated for a seamless loop
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-white/2 py-5 mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-sm uppercase tracking-[0.3em] text-slate-500">
            {w} <span className="text-violet-400">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}