import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { ROLE_LABEL } from '@/components/nav-items';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { Auth } from '@/types';

/** Avatar (ink + accent initials), name and role (Sidebar.html footer). */
export function NavUser() {
    const {
        props: { auth },
    } = usePage<{ auth: Auth }>();
    const getInitials = useInitials();

    if (!auth.user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="flex w-full items-center gap-2.5 rounded-2xl p-1 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted"
                data-test="sidebar-menu-button"
            >
                <span className="flex size-10 flex-none items-center justify-center rounded-full bg-primary text-[13px] font-bold text-accent">
                    {getInitials(auth.user.name)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-bold">
                        {auth.user.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                        {ROLE_LABEL[auth.user.role] ?? auth.user.role}
                    </span>
                </span>
                <ChevronsUpDown
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-2xl"
                align="end"
                side="top"
                sideOffset={8}
            >
                <UserMenuContent user={auth.user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
