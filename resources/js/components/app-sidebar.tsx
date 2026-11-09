import { Link, usePage } from '@inertiajs/react';
import { AppearanceSwitch } from '@/components/appearance-switch';
import { sidebarGroups } from '@/components/nav-items';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Auth } from '@/types';

/** Desktop sidebar, same format as MyWahana: collapses to an icon rail. */
export function AppSidebar() {
    const {
        props: { auth },
    } = usePage<{ auth: Auth }>();

    const isSuperAdmin = auth.user.role === 'super_admin';

    return (
        <Sidebar collapsible="icon" className="border-r border-border">
            <SidebarHeader className="px-3.5 pt-5 pb-2 group-data-[collapsible=icon]:px-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="gap-2.5 rounded-[12px] px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! hover:bg-background"
                            tooltip={{ children: 'PAKDE' }}
                        >
                            <Link href={dashboard()} prefetch>
                                <img
                                    src="/images/logo.png"
                                    alt="Logo WBK"
                                    className="size-8 shrink-0 object-contain"
                                />
                                <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                                    <span className="text-base font-extrabold tracking-[-0.01em]">
                                        PAKDE
                                    </span>
                                    <span className="truncate text-[11px] font-normal text-muted-foreground">
                                        Paklaring Digital Employee
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0 px-3.5 pb-4 group-data-[collapsible=icon]:px-3">
                <NavMain groups={sidebarGroups(isSuperAdmin)} />
            </SidebarContent>

            <SidebarFooter className="gap-3 px-3.5 pt-6 pb-5 group-data-[collapsible=icon]:px-3">
                <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
                    <AppearanceSwitch
                        compact
                        className="mr-auto group-data-[collapsible=icon]:hidden"
                    />
                    <SidebarTrigger className="size-9 rounded-full" />
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
