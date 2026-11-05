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
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Auth } from '@/types';

/** Desktop sidebar per `screens/Sidebar.html` (white, 256 px). */
export function AppSidebar() {
    const {
        props: { auth },
    } = usePage<{ auth: Auth }>();

    const isSuperAdmin = auth.user.role === 'super_admin';

    return (
        <Sidebar collapsible="offcanvas" className="border-r border-border">
            <SidebarHeader className="px-3.5 pt-5 pb-0">
                <Link
                    href={dashboard()}
                    prefetch
                    className="flex items-center gap-2.5 rounded-xl px-2 pt-1 pb-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <img
                        src="/images/logo.png"
                        alt="Logo WBK"
                        className="size-[34px] object-contain"
                    />
                    <span className="flex flex-col">
                        <span className="text-base font-extrabold tracking-[-0.01em]">
                            PAKDE
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            Paklaring Digital Employee
                        </span>
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3.5">
                <NavMain groups={sidebarGroups(isSuperAdmin)} />
            </SidebarContent>

            <SidebarFooter className="gap-3 px-3.5 pt-6 pb-5">
                <AppearanceSwitch />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
