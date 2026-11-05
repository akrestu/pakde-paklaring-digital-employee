import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { BottomNav, isFocusedFlow } from '@/components/bottom-nav';
import { cn } from '@/lib/utils';
import type { AppLayoutProps } from '@/types';

/** Sticky blurred mobile header: logo + page title (PaklaringMobile.html). */
function MobileHeader({ title }: { title: string }) {
    return (
        <header
            data-glass
            className="sticky top-0 z-30 flex h-16 items-center gap-2.5 border-b border-border bg-background/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-[16px] md:hidden"
        >
            <img
                src="/images/logo.png"
                alt="Logo WBK"
                className="size-[30px] object-contain"
            />
            <h1 className="truncate text-lg font-extrabold tracking-[-0.02em]">
                {title}
            </h1>
        </header>
    );
}

/**
 * Full-width shell: white 256 px sidebar on desktop, sticky header + bottom
 * nav on mobile. Content padding `28px 32px 40px`, no max-width.
 */
export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { url } = usePage();
    const title = breadcrumbs.at(-1)?.title ?? 'PAKDE';
    const withNav = !isFocusedFlow(url);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <MobileHeader title={title} />
                <div
                    className={cn(
                        'flex flex-1 flex-col px-4 pt-4 md:px-8 md:pt-7 md:pb-10',
                        withNav ? 'pb-24' : 'pb-6',
                    )}
                >
                    {children}
                </div>
                <BottomNav />
            </AppContent>
        </AppShell>
    );
}
