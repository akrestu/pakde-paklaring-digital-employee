import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    FileText,
    LayoutGrid,
    UserSquare2,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import type { NavGroup } from '@/components/nav-main';
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
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as employeesIndex } from '@/routes/employees';
import { index as paklaringsIndex } from '@/routes/paklarings';
import { index as sitesIndex } from '@/routes/sites';
import { index as usersIndex } from '@/routes/users';
import type { Auth } from '@/types';

export function AppSidebar() {
    const {
        props: { auth },
    } = usePage<{ auth: Auth }>();

    const isSuperAdmin = auth.user.role === 'super_admin';

    const navGroups: NavGroup[] = [
        {
            label: 'Menu Utama',
            defaultOpen: true,
            items: [
                { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
                {
                    title: 'Data Karyawan',
                    href: employeesIndex(),
                    icon: UserSquare2,
                },
                {
                    title: 'Paklaring',
                    href: paklaringsIndex(),
                    icon: FileText,
                },
            ],
        },
        ...(isSuperAdmin
            ? [
                  {
                      label: 'Administrasi',
                      defaultOpen: true,
                      items: [
                          {
                              title: 'Sites',
                              href: sitesIndex(),
                              icon: Building2,
                          },
                          { title: 'Users', href: usersIndex(), icon: Users },
                      ],
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border/50 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="rounded-xl transition-colors hover:bg-sidebar-accent/50"
                            tooltip={{
                                children: 'PAKDE — Paklaring Digital Employee',
                            }}
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-1 px-2 py-2">
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter className="gap-2 border-t border-sidebar-border/50 px-2 pt-3 pb-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
