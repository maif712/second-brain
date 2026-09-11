// src/features/landing/components/Footer.tsx
import { BrainCircuit } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-violet-400" />
          Second Brain — built with React, GSAP & Tailwind v4
        </div>
        <div>100% local. Your knowledge never leaves this browser.</div>
      </div>
    </footer>
  );
}