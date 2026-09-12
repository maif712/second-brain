// src/features/dashboard/pages/ProjectsPage.tsx
import { useMemo, useState } from 'react';
import { FolderKanban } from 'lucide-react';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { useToast } from '@/components/ui/toast/ToastContext';
import { Button } from '@/components/ui/Button';
import type { Project } from '@/features/knowledge/types';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { DeleteProjectDialog } from '../components/projects/DeleteProjectDialog';

export default function ProjectsPage() {
    const { projects, nodes } = useKnowledgeState();
    const { deleteProject } = useKnowledgeActions();
    const { toast } = useToast();

    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [deleting, setDeleting] = useState<Project | null>(null);

    const stats = useMemo(() => {
        const m = new Map<string, { items: number; open: number }>();
        projects.forEach((p) => m.set(p.id, { items: 0, open: 0 }));
        nodes.forEach((n) => {
            if (!n.projectId) return;
            const s = m.get(n.projectId);
            if (!s) return; // orphan projectId — ignore gracefully
            s.items += 1;
            if (n.type === 'question' && n.status !== 'answered') s.open += 1;
        });
        return m;
    }, [projects, nodes]);

    const deletingCount = deleting ? stats.get(deleting.id)?.items ?? 0 : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="font-display text-2xl font-bold text-white">Projects</h2>
                    <p className="mt-1 text-sm text-slate-400">Focused spaces for everything you're learning and building.</p>
                </div>
                <Button onClick={() => setCreating(true)}>New project</Button>
            </div>

            {projects.length === 0 ? (
                <div className="grid min-h-[40vh] place-items-center rounded-2xl border border-dashed border-white/15 bg-white/2 p-10 text-center">
                    <div>
                        <FolderKanban size={32} className="mx-auto text-violet-400" />
                        <h3 className="mt-4 font-display text-lg font-semibold text-white">No projects yet</h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">Create a project to group related concepts, notes, questions and resources.</p>
                        <div className="mt-6"><Button onClick={() => setCreating(true)}>Create your first project</Button></div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {projects.map((p) => (
                        <ProjectCard
                            key={p.id}
                            project={p}
                            itemCount={stats.get(p.id)?.items ?? 0}
                            openQuestions={stats.get(p.id)?.open ?? 0}
                            onEdit={setEditing}
                            onDelete={setDeleting}
                        />
                    ))}
                </div>
            )}

            <ProjectFormModal open={creating} onClose={() => setCreating(false)} />
            <ProjectFormModal open={editing !== null} onClose={() => setEditing(null)} initial={editing} />
            <DeleteProjectDialog
                open={deleting !== null}
                onClose={() => setDeleting(null)}
                project={deleting}
                itemCount={deletingCount}
                onConfirm={(mode) => {
                    if (deleting) {
                        deleteProject(deleting.id, mode);
                        toast(mode === 'delete-items' ? `Deleted “${deleting.name}” and its items` : `Deleted “${deleting.name}” — items moved to library`, 'info');
                    }
                }}
            />
        </div>
    );
}