// src/components/ui/ConfirmDialog.tsx
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose }: ConfirmDialogProps) {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            <p className="text-sm leading-relaxed text-slate-400">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
            </div>
        </Modal>
    );
}