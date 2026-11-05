import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    FileText,
    Home,
    Layers,
    LogOut,
    Menu,
    Plus,
    Upload,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AppearanceSwitch } from '@/components/appearance-switch';
import { ROLE_LABEL, sidebarGroups } from '@/components/nav-items';
import type { ShellNavItem } from '@/components/nav-items';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import { index as employeesIndex } from '@/routes/employees';
import { form as employeesImport } from '@/routes/employees/import';
import {
    create as paklaringCreate,
    createBatch,
    index as paklaringsIndex,
} from '@/routes/paklarings';
import type { Auth } from '@/types';

const startsWith = (url: string, prefix: string) =>
    url === prefix ||
    url.startsWith(`${prefix}/`) ||
    url.startsWith(`${prefix}?`);

/** Form flows own a sticky footer, so the bottom nav steps aside there. */
const FOCUSED_FLOW = /\/(create|create-batch|edit)(\/|\?|$)/;

export function isFocusedFlow(url: string): boolean {
    return FOCUSED_FLOW.test(url);
}

type TabItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    match: (url: string) => boolean;
};

const TABS: [TabItem, TabItem, TabItem] = [
    {
        label: 'Beranda',
        href: dashboard.url(),
        icon: Home,
        match: (u) => startsWith(u, '/dashboard'),
    },
    {
        label: 'Paklaring',
        href: paklaringsIndex.url(),
        icon: FileText,
        match: (u) => startsWith(u, '/paklarings'),
    },
    {
        label: 'Karyawan',
        href: employeesIndex.url(),
        icon: Users,
        match: (u) => startsWith(u, '/employees'),
    },
];

const MORE_PREFIXES = ['/sites', '/users', '/settings'];

const tabClass = (active: boolean) =>
    cn(
        'relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-2xl',
        'transition-transform duration-75 active:scale-[0.92] motion-reduce:transition-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        active
            ? 'text-[#141414] dark:text-white'
            : 'text-[#3A3833] dark:text-[#D9D4C9]',
    );

function TabLabel({
    icon: Icon,
    label,
    active,
}: {
    icon: LucideIcon;
    label: string;
    active: boolean;
}) {
    return (
        <>
            <span className="flex h-[30px] min-w-11 items-center justify-center">
                <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
            </span>
            <span
                className={cn(
                    'text-[11px] leading-none',
                    active ? 'font-bold' : 'font-medium',
                )}
            >
                {label}
            </span>
        </>
    );
}

function SheetRow({
    href,
    icon: Icon,
    label,
    description,
    highlight,
    onNavigate,
}: {
    href: ShellNavItem['href'];
    icon: LucideIcon;
    label: string;
    description?: string;
    highlight?: boolean;
    onNavigate: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className="flex min-h-14 items-center gap-3 rounded-2xl bg-card px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <span
                className={cn(
                    'flex size-11 flex-none items-center justify-center rounded-full',
                    highlight
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-foreground',
                )}
            >
                <Icon className="size-5" strokeWidth={1.8} aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-bold">{label}</span>
                {description && (
                    <span className="text-xs text-muted-foreground">
                        {description}
                    </span>
                )}
            </span>
            <ChevronRight
                className="size-4 text-muted-foreground"
                aria-hidden
            />
        </Link>
    );
}

function BottomSheet({
    open,
    onOpenChange,
    title,
    description,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="gap-0 rounded-t-[28px] border-0 bg-background px-4 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))]"
            >
                <span
                    aria-hidden
                    className="mx-auto mb-2 h-1 w-10 rounded-full bg-border"
                />
                <SheetHeader className="px-1 pb-3">
                    <SheetTitle className="text-lg font-extrabold tracking-tight">
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2">{children}</div>
            </SheetContent>
        </Sheet>
    );
}

/**
 * Mobile bottom nav E1 (glass bar, big centre FAB):
 * Beranda · Paklaring · [+] · Karyawan · Lainnya.
 */
export function BottomNav() {
    const { url, props } = usePage<{ auth: Auth }>();
    const [quickOpen, setQuickOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const getInitials = useInitials();

    if (isFocusedFlow(url)) {
        return null;
    }

    const user = props.auth.user;
    const isSuperAdmin = user.role === 'super_admin';
    const moreActive = MORE_PREFIXES.some((p) => startsWith(url, p));
    const moreItems = sidebarGroups(isSuperAdmin)
        .filter((g) => g.label === 'Manajemen' || g.label === 'Akun')
        .flatMap((g) => g.items);

    const renderTab = (tab: TabItem) => {
        const active = tab.match(url);

        return (
            <Link
                key={tab.href}
                href={tab.href}
                prefetch
                aria-current={active ? 'page' : undefined}
                className={tabClass(active)}
            >
                <TabLabel icon={tab.icon} label={tab.label} active={active} />
            </Link>
        );
    };

    return (
        <>
            <nav
                data-glass
                aria-label="Navigasi utama"
                className={cn(
                    'fixed inset-x-3 z-40 mx-auto grid h-[72px] max-w-md grid-cols-5 items-stretch rounded-[28px] px-1 md:hidden',
                    'bottom-[calc(12px+env(safe-area-inset-bottom))]',
                    'border border-white/70 bg-white/55 shadow-[0_10px_30px_rgba(20,20,20,0.18)]',
                    'backdrop-blur-[18px] backdrop-saturate-[1.4]',
                    'dark:border-white/15 dark:bg-[#181816]/55',
                    'supports-[not(backdrop-filter:blur(1px))]:bg-white/92 dark:supports-[not(backdrop-filter:blur(1px))]:bg-[#181816]/92',
                )}
            >
                {renderTab(TABS[0])}
                {renderTab(TABS[1])}
                <div className="flex items-start justify-center">
                    <button
                        type="button"
                        onClick={() => setQuickOpen(true)}
                        aria-label="Buat (aksi cepat)"
                        aria-haspopup="dialog"
                        className={cn(
                            '-mt-[13px] flex size-[60px] items-center justify-center rounded-full',
                            'bg-[#141414] text-accent dark:bg-accent dark:text-[#141414]',
                            'shadow-[0_0_0_5px_rgba(255,255,255,0.75),0_10px_24px_rgba(20,20,20,0.28)]',
                            'dark:shadow-[0_0_0_5px_rgba(255,255,255,0.18),0_10px_24px_rgba(20,20,20,0.28)]',
                            'transition-transform duration-75 active:scale-[0.92] motion-reduce:transition-none',
                            'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
                        )}
                    >
                        <Plus
                            className="size-[26px]"
                            strokeWidth={2.2}
                            aria-hidden
                        />
                    </button>
                </div>
                {renderTab(TABS[2])}
                <button
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    aria-haspopup="dialog"
                    aria-current={moreActive ? 'page' : undefined}
                    className={tabClass(moreActive)}
                >
                    <TabLabel icon={Menu} label="Lainnya" active={moreActive} />
                </button>
            </nav>

            <BottomSheet
                open={quickOpen}
                onOpenChange={setQuickOpen}
                title="Aksi cepat"
                description="Mulai pekerjaan baru."
            >
                <SheetRow
                    href={paklaringCreate()}
                    icon={Plus}
                    label="Buat Paklaring"
                    description="Satu surat untuk satu karyawan"
                    highlight
                    onNavigate={() => setQuickOpen(false)}
                />
                <SheetRow
                    href={createBatch()}
                    icon={Layers}
                    label="Buat Batch"
                    description="Beberapa karyawan sekaligus"
                    onNavigate={() => setQuickOpen(false)}
                />
                <SheetRow
                    href={employeesImport()}
                    icon={Upload}
                    label="Import Karyawan"
                    description="Unggah file Excel data karyawan"
                    onNavigate={() => setQuickOpen(false)}
                />
            </BottomSheet>

            <BottomSheet
                open={moreOpen}
                onOpenChange={setMoreOpen}
                title="Lainnya"
                description="Menu dan pengaturan akun."
            >
                <div className="flex items-center gap-3 px-1 pb-2">
                    <span className="flex size-11 flex-none items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">
                        {getInitials(user.name)}
                    </span>
                    <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[15px] font-bold">
                            {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            {ROLE_LABEL[user.role] ?? user.role}
                        </span>
                    </span>
                </div>
                {moreItems.map((item) => (
                    <SheetRow
                        key={item.title}
                        href={item.href}
                        icon={item.icon}
                        label={item.title}
                        onNavigate={() => setMoreOpen(false)}
                    />
                ))}
                <AppearanceSwitch className="mt-2" />
                <Link
                    href={logout()}
                    as="button"
                    onClick={() => {
                        setMoreOpen(false);
                        router.flushAll();
                    }}
                    className="mt-2 flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-destructive outline-none hover:bg-destructive-soft focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <LogOut className="size-4" aria-hidden />
                    Keluar
                </Link>
            </BottomSheet>
        </>
    );
}
