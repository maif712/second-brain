// src/features/knowledge/lib/projectColors.ts
import type { ProjectColorKey } from '../types';

export const PROJECT_COLORS: Record<ProjectColorKey, {
    label: string; hex: string; dot: string; text: string; bg: string; ring: string; gradient: string;
}> = {
    violet: { label: 'Violet', hex: '#a78bfa', dot: 'bg-violet-400', text: 'text-violet-300', bg: 'bg-violet-400/10', ring: 'ring-violet-400/30', gradient: 'from-violet-400/70' },
    sky: { label: 'Sky', hex: '#38bdf8', dot: 'bg-sky-400', text: 'text-sky-300', bg: 'bg-sky-400/10', ring: 'ring-sky-400/30', gradient: 'from-sky-400/70' },
    emerald: { label: 'Emerald', hex: '#34d399', dot: 'bg-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-400/10', ring: 'ring-emerald-400/30', gradient: 'from-emerald-400/70' },
    amber: { label: 'Amber', hex: '#fbbf24', dot: 'bg-amber-400', text: 'text-amber-300', bg: 'bg-amber-400/10', ring: 'ring-amber-400/30', gradient: 'from-amber-400/70' },
    rose: { label: 'Rose', hex: '#fb7185', dot: 'bg-rose-400', text: 'text-rose-300', bg: 'bg-rose-400/10', ring: 'ring-rose-400/30', gradient: 'from-rose-400/70' },
    cyan: { label: 'Cyan', hex: '#22d3ee', dot: 'bg-cyan-400', text: 'text-cyan-300', bg: 'bg-cyan-400/10', ring: 'ring-cyan-400/30', gradient: 'from-cyan-400/70' },
    fuchsia: { label: 'Fuchsia', hex: '#e879f9', dot: 'bg-fuchsia-400', text: 'text-fuchsia-300', bg: 'bg-fuchsia-400/10', ring: 'ring-fuchsia-400/30', gradient: 'from-fuchsia-400/70' },
    lime: { label: 'Lime', hex: '#a3e635', dot: 'bg-lime-400', text: 'text-lime-300', bg: 'bg-lime-400/10', ring: 'ring-lime-400/30', gradient: 'from-lime-400/70' },
};

export const PROJECT_COLOR_KEYS = Object.keys(PROJECT_COLORS) as ProjectColorKey[];

/** Fallback keeps corrupted/legacy data from ever crashing the UI. */
export function getProjectColor(key: string | undefined) {
    return PROJECT_COLORS[key as ProjectColorKey] ?? PROJECT_COLORS.violet;
}