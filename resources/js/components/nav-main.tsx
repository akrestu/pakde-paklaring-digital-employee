import { Link } from '@inertiajs/react';
import type { ShellNavGroup } from '@/components/nav-items';
import { useSidebar } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

export function NavMain({ groups }: { groups: ShellNavGroup[] }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <nav aria-label="Menu utama" className="flex flex-col gap-1">
            {groups.map((group, i) => (
                <div key={group.label ?? i} className="flex flex-col gap-1">
                    {group.label && (
                        <div className="px-3 pt-3.5 pb-1 text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                            {group.label}
                        </div>
                    )}
                    {group.items.map((item) => {
                        const active = isCurrentOrParentUrl(item.href);

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch
                                aria-current={active ? 'page' : undefined}
                                onClick={() => isMobile && setOpenMobile(false)}
                                className={cn(
                                    'flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    active
                                        ? 'bg-primary font-semibold text-primary-foreground'
                                        : 'font-medium text-foreground hover:bg-muted',
                                )}
                            >
                                <item.icon
                                    className="size-[18px] shrink-0"
                                    strokeWidth={1.8}
                                    aria-hidden
                                />
                                <span className="truncate">{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            ))}
        </nav>
    );
}
