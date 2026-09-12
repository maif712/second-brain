// src/features/dashboard/components/projects/DeleteProjectDialog.tsx
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Project } from '@/features/knowledge/types';
import { cn } from '@/lib/cn';

interface DeleteProjectDialogProps {
    open: boolean;
    onClose: () => void;
    project: Project | null;
    itemCount: number;
    onConfirm: (mode: 'unassign' | 'delete-items') => void;
}

export function DeleteProjectDialog({ open, onClose, project, itemCount, onConfirm }: DeleteProjectDialogProps) {
    const [mode, setMode] = useState<'unassign' | 'delete-items'>('unassign');
    useEffect(() => { if (open) setMode('unassign'); }, [open]);

    if (!project) return null;
    const plural = itemCount === 1 ? '' : 's';

    return (
        <Modal open={open} onClose={onClose} title={`Delete “${project.name}”?`}>
            <p className="text-sm leading-relaxed text-slate-400">
                The project itself is always removed. Choose what happens to its {itemCount} item{plural}:
            </p>

            {itemCount > 0 && (
                <div className="mt-4 space-y-2">
                    {[
                        { value: 'unassign' as const, title: `Keep the item${plural}`, desc: 'They move back to the general library. All links stay intact.' },
                        { value: 'delete-items' as const, title: `Delete the item${plural} too`, desc: 'Removes them and all their connections. This cannot be undone.' },
                    ].map((o) => (
                        <label
                            key={o.value}
                            className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition',
                                mode === o.value ? 'border-violet-400/40 bg-violet-400/10' : 'border-white/10 hover:bg-white/5',
                            )}
                        >
                            <input type="radio" name="project-delete-mode" className="mt-1 accent-violet-500" checked={mode === o.value} onChange={() => setMode(o.value)} />
                            <span>
                                <span className="block text-sm font-medium text-white">{o.title}</span>
                                <span className="mt-0.5 block text-xs text-slate-400">{o.desc}</span>
                            </span>
                        </label>
                    ))}
                </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={() => { onConfirm(itemCount > 0 ? mode : 'unassign'); onClose(); }}>
                    Delete project
                </Button>
            </div>
        </Modal>
    );
}