export function daysSince(iso: string | null): number {
    if (!iso) return Number.POSITIVE_INFINITY;
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function timeAgo(iso: string | null): string {
    if (!iso) return 'never';
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}