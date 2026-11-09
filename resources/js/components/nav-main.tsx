import { Link } from '@inertiajs/react';
import type { ShellNavGroup } from '@/components/nav-items';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

export function NavMain({ groups }: { groups: ShellNavGroup[] }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();

    // Only the most specific match is active, so /paklarings/create-batch
    // lights up "Buat Batch" and not also "Daftar Paklaring".
    const hrefOf = (href: ShellNavGroup['items'][number]['href']) =>
        typeof href === 'string' ? href : href.url;
    const activeHref = groups
        .flatMap((g) => g.items)
        .filter((item) => isCurrentOrParentUrl(item.href))
        .map((item) => hrefOf(item.href))
        .sort((a, b) => b.length - a.length)[0];

    return (
        <nav aria-label="Menu utama">
            {groups.map((group, i) => (
                <SidebarGroup key={group.label ?? i} className="p-0">
                    {group.label && (
                        <>
                            <div
                                aria-hidden
                                className="mx-auto my-2.5 hidden h-px w-6 bg-border group-data-[collapsible=icon]:block"
                            />
                            <SidebarGroupLabel className="h-auto px-3 pt-3.5 pb-1 text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                                {group.label}
                            </SidebarGroupLabel>
                        </>
                    )}
                    <SidebarMenu className="gap-0.5">
                        {group.items.map((item) => {
                            const active = hrefOf(item.href) === activeHref;

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={cn(
                                            'h-10 gap-2.5 rounded-[12px] px-3 text-sm transition-colors',
                                            active
                                                ? 'bg-primary font-semibold text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground'
                                                : 'font-medium text-sidebar-foreground hover:bg-muted',
                                        )}
                                    >
                                        <Link
                                            href={item.href}
                                            prefetch
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                            onClick={() =>
                                                isMobile && setOpenMobile(false)
                                            }
                                        >
                                            <item.icon
                                                className="size-[18px] shrink-0"
                                                strokeWidth={1.8}
                                                aria-hidden
                                            />
                                            <span className="truncate">
                                                {item.title}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </nav>
    );
}
