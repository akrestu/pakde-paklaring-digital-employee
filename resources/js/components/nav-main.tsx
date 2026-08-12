import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export interface NavGroup {
    label: string;
    items: NavItem[];
    defaultOpen?: boolean;
}

type HrefType = NonNullable<InertiaLinkProps['href']>;

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <>
            {groups.map((group) => (
                <NavGroupSection
                    key={group.label}
                    group={group}
                    isActive={isCurrentOrParentUrl}
                />
            ))}
        </>
    );
}

function NavGroupSection({
    group,
    isActive,
}: {
    group: NavGroup;
    isActive: (href: HrefType) => boolean;
}) {
    const [open, setOpen] = useState(group.defaultOpen ?? true);
    const { isMobile, setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="group/collapsible"
        >
            <SidebarGroup className="py-0">
                <SidebarGroupLabel
                    asChild
                    className="h-7 cursor-pointer rounded-md text-xs font-semibold tracking-widest uppercase transition-colors select-none group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent/50"
                >
                    <CollapsibleTrigger className="flex w-full items-center justify-between px-2">
                        <span>{group.label}</span>
                        <ChevronDown
                            className={`h-3.5 w-3.5 text-sidebar-foreground/40 transition-transform duration-200 ${
                                open ? 'rotate-0' : '-rotate-90'
                            }`}
                        />
                    </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent>
                    <SidebarMenu className="gap-0.5">
                        {group.items.map((item) => {
                            const active = isActive(item.href);

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={`relative h-9 gap-3 rounded-lg px-3 transition-all duration-150 ${
                                            active
                                                ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm'
                                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                                        }`}
                                    >
                                        <Link
                                            href={item.href}
                                            prefetch
                                            onClick={handleLinkClick}
                                            className="flex w-full items-center gap-3"
                                        >
                                            {active && (
                                                <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sidebar-primary group-data-[collapsible=icon]:hidden" />
                                            )}
                                            {item.icon && (
                                                <item.icon
                                                    className={`h-4 w-4 shrink-0 transition-colors ${
                                                        active
                                                            ? 'text-sidebar-primary'
                                                            : 'text-sidebar-foreground/50'
                                                    }`}
                                                />
                                            )}
                                            <span className="truncate text-sm">
                                                {item.title}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
}
