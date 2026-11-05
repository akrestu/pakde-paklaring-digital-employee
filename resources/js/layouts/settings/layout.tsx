import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Profil', href: edit(), icon: null },
    { title: 'Keamanan', href: editSecurity(), icon: null },
    { title: 'Tampilan', href: editAppearance(), icon: null },
];

/**
 * Pengaturan per `screens/Pengaturan.html`. The three Fortify settings
 * routes stay separate pages; this layout gives them one title, a pill tab
 * bar and a card for the content.
 */
export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-col gap-4 md:gap-5">
            <h1 className="hidden text-[30px] leading-[1.15] font-extrabold tracking-[-0.025em] md:block">
                Pengaturan
            </h1>

            <nav
                aria-label="Pengaturan"
                className="grid w-full grid-cols-3 gap-0.5 self-start rounded-full bg-muted p-1 sm:w-auto"
            >
                {sidebarNavItems.map((item) => {
                    const active = isCurrentOrParentUrl(item.href);

                    return (
                        <Link
                            key={toUrl(item.href)}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                active
                                    ? 'bg-card text-foreground shadow-[0_1px_2px_oklch(0.191_0_0/0.12)]'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            <section className="flex max-w-3xl flex-col gap-10 rounded-lg bg-card p-5 shadow-[0_1px_2px_oklch(0.191_0_0/0.06)] md:p-6">
                {children}
            </section>
        </div>
    );
}
