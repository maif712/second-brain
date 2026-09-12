// src/features/dashboard/components/projects/ProjectFormModal.tsx
import { useEffect, useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/toast/ToastContext';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { PROJECT_COLORS, PROJECT_COLOR_KEYS } from '@/features/knowledge/lib/projectColors';
import type { Project, ProjectColorKey } from '@/features/knowledge/types';
import { cn } from '@/lib/cn';

const inputCls =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20';
const labelCls = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500';

const randomColor = () => PROJECT_COLOR_KEYS[Math.floor(Math.random() * PROJECT_COLOR_KEYS.length)];

export function ProjectFormModal({ open, onClose, initial = null }: { open: boolean; onClose: () => void; initial?: Project | null }) {
    const { projects } = useKnowledgeState();
    const { addProject, updateProject } = useKnowledgeActions();
    const { toast } = useToast();
    const [form, setForm] = useState({ name: '', description: '', color: 'violet' as ProjectColorKey });
    const [error, setError] = useState<string | null>(null);
    const isEdit = initial !== null;

    useEffect(() => {
        if (open) {
            setForm(initial
                ? { name: initial.name, description: initial.description, color: initial.color }
                : { name: '', description: '', color: randomColor() }); // playful default
            setError(null);
        }
    }, [open, initial]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const name = form.name.trim();
        if (name.length < 2) { setError('Give the project a name of at least 2 characters.'); return; }
        if (name.length > 60) { setError('Keep names under 60 characters.'); return; }
        const duplicate = projects.some((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== initial?.id);
        if (duplicate) { setError('You already have a project with this name.'); return; }

        if (isEdit) {
            updateProject(initial.id, { name, description: form.description.trim(), color: form.color });
            toast('Project updated');
        } else {
            addProject({ name, description: form.description.trim(), color: form.color });
            toast('Project created');
        }
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? 'Edit project' : 'New project'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="pf-name" className={labelCls}>Name *</label>
                    <input
                        id="pf-name" autoFocus value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. React Deep Dive"
                        className={cn(inputCls, error && 'border-rose-400/50')}
                    />
                    {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
                </div>

                <div>
                    <label htmlFor="pf-desc" className={labelCls}>Description</label>
                    <textarea
                        id="pf-desc" rows={2} value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="What is this project about?"
                        className={cn(inputCls, 'resize-y')}
                    />
                </div>

                <div>
                    <span className={labelCls}>Color</span>
                    <div className="grid grid-cols-4 gap-2">
                        {PROJECT_COLOR_KEYS.map((key) => {
                            const c = PROJECT_COLORS[key];
                            const active = form.color === key;
                            return (
                                <button
                                    type="button" key={key} aria-label={c.label} aria-pressed={active}
                                    onClick={() => setForm((f) => ({ ...f, color: key }))}
                                    className={cn(
                                        'relative grid h-11 place-items-center rounded-xl border transition',
                                        active ? 'border-white/40 bg-white/10' : 'border-white/10 hover:bg-white/5',
                                    )}
                                >
                                    <span className={cn('h-5 w-5 rounded-full', c.dot)} />
                                    {active && <Check size={12} className="absolute right-1 top-1 text-white" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-5">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{isEdit ? 'Save changes' : 'Create project'}</Button>
                </div>
            </form>
        </Modal>
    );
}