// src/features/dashboard/hooks/useDashboardShortcuts.ts
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

export function useDashboardShortcuts() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
            const dialogOpen = document.querySelector('[role="dialog"]') !== null;
            if (typing || dialogOpen || e.metaKey || e.ctrlKey || e.altKey) return;

            if (e.key === '/') {
                e.preventDefault();
                if (pathname !== '/dashboard/library') navigate('/dashboard/library');
                requestAnimationFrame(() => document.getElementById('library-search')?.focus());
            }
            if (e.key.toLowerCase() === 'n') {
                e.preventDefault();
                navigate('/dashboard/library?new=1');
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [pathname, navigate]);
}