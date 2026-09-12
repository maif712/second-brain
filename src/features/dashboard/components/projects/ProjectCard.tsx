// src/features/dashboard/components/projects/ProjectCard.tsx
import { Link } from 'react-router';
import { CircleHelp, Layers, Pencil, Trash2 } from 'lucide-react';
import type { Project } from '@/features/knowledge/types';
import { getProjectColor } from '@/features/knowledge/lib/projectColors';
import { timeAgo } from '@/features/knowledge/lib/format';
import { cn } from '@/lib/cn';

interface ProjectCardProps {
    project: Project;
    itemCount: number;
    openQuestions: number;
    onEdit: (p: Project) => void;
    onDelete: (p: Project) => void;
}

export function ProjectCard({ project, itemCount, openQuestions, onEdit, onDelete }: ProjectCardProps) {
    const c = getProjectColor(project.color);
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/3 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/5 hover:shadow-xl hover:shadow-black/30">
            <div className={cn('h-1.5 w-full bg-linear-to-r to-transparent', c.gradient)} />
            <Link to={`/dashboard/projects/${project.id}`} className="block p-5">
                <div className="flex items-center gap-2.5">
                    <span className={cn('h-3 w-3 rounded-full', c.dot)} />
                    <h3 className="font-display text-base font-semibold text-white">{project.name}</h3>
                </div>
                <p className={cn('mt-2 line-clamp-2 text-sm leading-relaxed', project.description ? 'text-slate-400' : 'italic text-slate-600')}>
                    {project.description || 'No description yet.'}
                </p>
                <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><Layers size={12} /> {itemCount} item{itemCount === 1 ? '' : 's'}</span>
                    <span className="inline-flex items-center gap-1.5"><CircleHelp size={12} /> {openQuestions} open</span>
                    <span className="ml-auto">updated {timeAgo(project.updatedAt)}</span>
                </div>
            </Link>
            <div className="absolute right-3 top-4 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => onEdit(project)} aria-label="Edit project" className="rounded-lg border border-white/10 bg-ink/90 p-1.5 text-slate-400 transition hover:text-white">
                    <Pencil size={13} />
                </button>
                <button onClick={() => onDelete(project)} aria-label="Delete project" className="rounded-lg border border-white/10 bg-ink/90 p-1.5 text-slate-400 transition hover:text-rose-400">
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}