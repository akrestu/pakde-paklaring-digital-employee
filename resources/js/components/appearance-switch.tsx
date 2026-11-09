import { Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Appearance; label: string; icon: LucideIcon }[] = [
    { value: 'light', label: 'Tema terang', icon: Sun },
    { value: 'dark', label: 'Tema gelap', icon: Moon },
    { value: 'system', label: 'Ikuti sistem', icon: Monitor },
];

/** Segmented light / dark / system toggle (Sidebar.html footer). */
export function AppearanceSwitch({
    className,
    compact = false,
}: {
    className?: string;
    /** Smaller pill that shares a row with other footer controls. */
    compact?: boolean;
}) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div
            role="group"
            aria-label="Tema tampilan"
            className={cn(
                compact
                    ? 'inline-flex gap-0.5 rounded-full bg-muted p-0.5'
                    : 'grid grid-cols-3 gap-0.5 rounded-full bg-muted p-1',
                className,
            )}
        >
            {OPTIONS.map(({ value, label, icon: Icon }) => {
                const on = appearance === value;

                return (
                    <button
                        key={value}
                        type="button"
                        aria-label={label}
                        title={label}
                        aria-pressed={on}
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            compact ? 'size-8' : 'h-9',
                            on
                                ? 'bg-card text-foreground shadow-[0_1px_2px_oklch(0.191_0_0/0.12)]'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Icon
                            className={compact ? 'size-[15px]' : 'size-4'}
                            strokeWidth={1.8}
                            aria-hidden
                        />
                    </button>
                );
            })}
        </div>
    );
}
