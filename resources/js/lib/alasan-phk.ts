/**
 * Colour per termination reason (README "Warna alasan PHK"). The palette is
 * not colour-blind safe, so charts must always label bars with name + count.
 */
export const ALASAN_PHK_STYLE: Record<string, { fill: string; badge: string }> =
    {
        'End Contract': {
            fill: 'var(--primary)',
            badge: 'bg-muted text-foreground',
        },
        Resign: { fill: 'var(--accent)', badge: 'bg-accent-soft text-foreground' },
        Efisiensi: { fill: 'var(--info)', badge: 'bg-info-soft text-info' },
        Pensiun: { fill: 'var(--success)', badge: 'bg-success-soft text-success' },
        PHK: {
            fill: 'var(--destructive)',
            badge: 'bg-destructive-soft text-destructive',
        },
    };

const FALLBACK = { fill: 'var(--muted-foreground)', badge: 'bg-muted text-foreground' };

export function alasanStyle(reason: string) {
    return ALASAN_PHK_STYLE[reason] ?? FALLBACK;
}
