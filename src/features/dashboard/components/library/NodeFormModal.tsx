// src/features/dashboard/components/library/NodeFormModal.tsx
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/toast/ToastContext';
import { useKnowledgeState, useKnowledgeActions } from '@/features/knowledge/context/KnowledgeContext';
import { TYPE_META } from '@/features/knowledge/lib/typeMeta';
import type { EntityType, KnowledgeNode, QuestionStatus, ResourceKind } from '@/features/knowledge/types';
import { cn } from '@/lib/cn';

const inputCls =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20';
const labelCls = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500';

interface FormState {
    type: EntityType;
    title: string;
    content: string;
    tagsInput: string;
    status: QuestionStatus;
    url: string;
    resourceKind: ResourceKind;
    projectId: string; // '' = no project (general library)
}
type FormErrors = Partial<Record<'title' | 'url', string>>;

function toForm(node: KnowledgeNode | null, fallbackType: EntityType, fallbackProjectId: string): FormState {
    if (!node) {
        return {
            type: fallbackType, title: '', content: '', tagsInput: '',
            status: 'open', url: '', resourceKind: 'article', projectId: fallbackProjectId,
        };
    }
    return {
        type: node.type,
        title: node.title,
        content: node.content,
        tagsInput: node.tags.join(', '),
        status: node.status ?? 'open',
        url: node.url ?? '',
        resourceKind: node.resourceKind ?? 'article',
        projectId: node.projectId ?? '',
    };
}

interface NodeFormModalProps {
    open: boolean;
    onClose: () => void;
    initial?: KnowledgeNode | null;      // present → edit mode
    defaultType?: EntityType;
    defaultProjectId?: string | null;    // used when creating inside a project workspace
}

export function NodeFormModal({
    open, onClose, initial = null, defaultType = 'concept', defaultProjectId = null,
}: NodeFormModalProps) {
    const { projects } = useKnowledgeState();
    const { addNode, updateNode } = useKnowledgeActions();
    const { toast } = useToast();
    const [form, setForm] = useState<FormState>(() => toForm(initial, defaultType, defaultProjectId ?? ''));
    const [errors, setErrors] = useState<FormErrors>({});
    const isEdit = initial !== null;

    // Reset the form every time the modal (re)opens — fresh node or fresh defaults.
    useEffect(() => {
        if (open) {
            setForm(toForm(initial, defaultType, defaultProjectId ?? ''));
            setErrors({});
        }
    }, [open, initial, defaultType, defaultProjectId]);

    const tagPreview = useMemo(
        () => Array.from(new Set(form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean))),
        [form.tagsInput],
    );

    const projectOptions = useMemo(
        () => [
            { value: '', label: 'No project — general library' },
            ...projects.map((p) => ({ value: p.id, label: p.name })),
        ],
        [projects],
    );

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const errs: FormErrors = {};
        const title = form.title.trim();

        if (title.length < 2) errs.title = 'Give it a title of at least 2 characters.';
        else if (title.length > 120) errs.title = 'Keep titles under 120 characters.';

        if (form.type === 'resource' && form.url.trim()) {
            try { new URL(form.url.trim()); } catch { errs.url = 'That does not look like a valid URL (include https://).'; }
        }

        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        const payload = {
            title,
            content: form.content.trim(),
            tags: tagPreview, // already trimmed + deduped
            projectId: form.projectId || null,
            ...(form.type === 'question' ? { status: form.status } : {}),
            ...(form.type === 'resource' ? { url: form.url.trim() || undefined, resourceKind: form.resourceKind } : {}),
        };

        if (isEdit) {
            updateNode(initial.id, payload);
            toast('Changes saved');
        } else {
            addNode({ type: form.type, ...payload });
            toast('Added to your brain');
        }
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? 'Edit item' : 'New knowledge item'} wide>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type picker — locked in edit mode so type-specific fields never go stale */}
                <div>
                    <span className={labelCls}>Type</span>
                    {isEdit ? (
                        <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1', TYPE_META[form.type].bg, TYPE_META[form.type].text, TYPE_META[form.type].ring)}>
                            {TYPE_META[form.type].label} · fixed while editing
                        </span>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {(Object.keys(TYPE_META) as EntityType[]).map((t) => {
                                const m = TYPE_META[t];
                                const Icon = m.icon;
                                const active = form.type === t;
                                return (
                                    <button
                                        type="button" key={t} onClick={() => set('type', t)}
                                        className={cn(
                                            'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition',
                                            active
                                                ? cn('border-transparent ring-1', m.bg, m.text, m.ring)
                                                : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200',
                                        )}
                                    >
                                        <Icon size={16} /> {m.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Project assignment */}
                <div>
                    <span className={labelCls}>Project</span>
                    <Select
                        ariaLabel="Assign to project"
                        value={form.projectId}
                        onChange={(v) => set('projectId', v)}
                        options={projectOptions}
                    />
                </div>

                {/* Title */}
                <div>
                    <label htmlFor="nb-title" className={labelCls}>Title *</label>
                    <input
                        id="nb-title" autoFocus value={form.title}
                        onChange={(e) => set('title', e.target.value)}
                        placeholder="e.g. Context API"
                        className={cn(inputCls, errors.title && 'border-rose-400/50')}
                    />
                    {errors.title && <p className="mt-1.5 text-xs text-rose-400">{errors.title}</p>}
                </div>

                {/* Content */}
                <div>
                    <label htmlFor="nb-content" className={labelCls}>Content</label>
                    <textarea
                        id="nb-content" value={form.content} rows={4}
                        onChange={(e) => set('content', e.target.value)}
                        placeholder="What did you learn? Why does it matter?"
                        className={cn(inputCls, 'resize-y')}
                    />
                </div>

                {/* Question-only field */}
                {form.type === 'question' && (
                    <div>
                        <span className={labelCls}>Status</span>
                        <Select
                            ariaLabel="Question status"
                            value={form.status}
                            onChange={(v) => set('status', v as QuestionStatus)}
                            options={[
                                { value: 'open', label: 'Open — still hunting the answer' },
                                { value: 'answered', label: 'Answered' },
                            ]}
                        />
                    </div>
                )}

                {/* Resource-only fields */}
                {form.type === 'resource' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="nb-url" className={labelCls}>URL</label>
                            <input
                                id="nb-url" value={form.url}
                                onChange={(e) => set('url', e.target.value)}
                                placeholder="https://…"
                                className={cn(inputCls, errors.url && 'border-rose-400/50')}
                            />
                            {errors.url && <p className="mt-1.5 text-xs text-rose-400">{errors.url}</p>}
                        </div>
                        <div>
                            <span className={labelCls}>Kind</span>
                            <Select
                                ariaLabel="Resource kind"
                                value={form.resourceKind}
                                onChange={(v) => set('resourceKind', v as ResourceKind)}
                                options={(['article', 'video', 'book', 'course', 'podcast', 'other'] as ResourceKind[]).map((k) => ({ value: k, label: k }))}
                            />
                        </div>
                    </div>
                )}

                {/* Tags */}
                <div>
                    <label htmlFor="nb-tags" className={labelCls}>Tags (comma separated)</label>
                    <input
                        id="nb-tags" value={form.tagsInput}
                        onChange={(e) => set('tagsInput', e.target.value)}
                        placeholder="react, hooks, performance"
                        className={inputCls}
                    />
                    {tagPreview.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {tagPreview.map((t) => (
                                <span key={t} className="rounded-md bg-violet-400/10 px-2 py-0.5 text-[11px] text-violet-300 ring-1 ring-violet-400/20">#{t}</span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-5">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{isEdit ? 'Save changes' : 'Add to brain'}</Button>
                </div>
            </form>
        </Modal>
    );
}