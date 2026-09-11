import { Atom, BookMarked, CircleHelp, StickyNote, type LucideIcon } from 'lucide-react';
import type { EntityType } from '../types';

export const TYPE_META: Record<EntityType, {
    label: string; plural: string; icon: LucideIcon;
    text: string; bg: string; ring: string; dot: string; hex: string;
}> = {
    concept: { label: 'Concept', plural: 'Concepts', icon: Atom, text: 'text-violet-300', bg: 'bg-violet-400/10', ring: 'ring-violet-400/30', dot: 'bg-violet-400', hex: '#a78bfa' },
    note: { label: 'Note', plural: 'Notes', icon: StickyNote, text: 'text-sky-300', bg: 'bg-sky-400/10', ring: 'ring-sky-400/30', dot: 'bg-sky-400', hex: '#38bdf8' },
    question: { label: 'Question', plural: 'Questions', icon: CircleHelp, text: 'text-amber-300', bg: 'bg-amber-400/10', ring: 'ring-amber-400/30', dot: 'bg-amber-400', hex: '#fbbf24' },
    resource: { label: 'Resource', plural: 'Resources', icon: BookMarked, text: 'text-emerald-300', bg: 'bg-emerald-400/10', ring: 'ring-emerald-400/30', dot: 'bg-emerald-400', hex: '#34d399' },
};