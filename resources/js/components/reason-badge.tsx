import { alasanStyle } from '@/lib/alasan-phk';
import { cn } from '@/lib/utils';

/** Pill badge for a termination reason (README "Warna alasan PHK"). */
export function ReasonBadge({
    reason,
    className,
}: {
    reason: string;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-block rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                alasanStyle(reason).badge,
                className,
            )}
        >
            {reason}
        </span>
    );
}
