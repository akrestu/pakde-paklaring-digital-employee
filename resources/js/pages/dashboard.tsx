import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronRight, Layers, Moon, Plus, Sun, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import type { LabelProps } from 'recharts';
import { ReasonBadge } from '@/components/reason-badge';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import { alasanStyle } from '@/lib/alasan-phk';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { form as employeesImport } from '@/routes/employees/import';
import {
    create as createPaklaring,
    createBatch,
    index as paklaringsIndex,
    show as showPaklaring,
} from '@/routes/paklarings';
import { edit as profileEdit } from '@/routes/profile';
import type { Auth, Paklaring, Site } from '@/types';

type MonthlyTrend = { month: string; total: number };
type ReasonTotal = { reason: string; total: number };

type Props = {
    stats: {
        totalPaklaring: number;
        paklaringThisMonth: number;
        activeEmployees: number;
        incompleteEmployees: number;
    };
    monthlyTrend: MonthlyTrend[];
    byReason: ReasonTotal[];
    recentPaklarings: Paklaring[];
    site: Site | null;
    sites: Pick<Site, 'id' | 'code' | 'name'>[];
    filters: { site_id: number | null };
    greeting: { text: string; emoji: string };
    today: string;
};

const nf = new Intl.NumberFormat('id-ID');
const monthShort = new Intl.DateTimeFormat('id-ID', { month: 'short' });
const monthLong = new Intl.DateTimeFormat('id-ID', { month: 'long' });
const dateShort = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const parseMonth = (iso: string) => new Date(`${iso}T00:00:00`);
const shortLabel = (iso: string) =>
    monthShort.format(parseMonth(iso)).replace('.', '');
const monthYear = (iso: string) =>
    `${shortLabel(iso)} ${parseMonth(iso).getFullYear()}`;

const card =
    'rounded-lg bg-card shadow-[0_1px_2px_oklch(0.191_0_0/0.06)] dark:shadow-none';

function SiteFilter({
    sites,
    value,
}: {
    sites: Props['sites'];
    value: number | null;
}) {
    return (
        <label className="flex h-11 items-center gap-2 self-start rounded-full bg-white pr-3.5 pl-4 text-[13px] font-semibold text-[#141414]">
            Site
            <select
                aria-label="Filter site"
                value={value ?? ''}
                onChange={(e) =>
                    router.get(
                        dashboard.url(),
                        e.target.value ? { site_id: e.target.value } : {},
                        { preserveScroll: true, replace: true },
                    )
                }
                className="rounded-md border-0 bg-transparent text-sm font-bold text-[#141414] outline-offset-2"
            >
                <option value="">Semua site</option>
                {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                ))}
            </select>
        </label>
    );
}

const QUICK: {
    label: string;
    href: ReturnType<typeof createPaklaring>;
    icon: LucideIcon;
    accent?: boolean;
}[] = [
    {
        label: 'Buat Paklaring',
        href: createPaklaring(),
        icon: Plus,
        accent: true,
    },
    { label: 'Buat Batch', href: createBatch(), icon: Layers },
    { label: 'Import Karyawan', href: employeesImport(), icon: Upload },
];

/** Same format as MyWahana's Beranda hero: identity row, then a large headline. */
function Hero({
    greeting,
    today,
    user,
    siteName,
    sites,
    siteId,
    isSuperAdmin,
}: {
    greeting: string;
    today: string;
    user: Auth['user'];
    siteName?: string;
    sites: Props['sites'];
    siteId: number | null;
    isSuperAdmin: boolean;
}) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const getInitials = useInitials();
    const dark = resolvedAppearance === 'dark';

    return (
        <section className="relative isolate -mx-4 -mt-4 overflow-hidden bg-[#30485F] px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[76px] text-white md:mx-0 md:mt-0 md:rounded-[22px] md:pt-6">
            <img
                src="/images/mountain.jpg"
                alt=""
                className="absolute inset-0 -z-20 size-full object-cover object-[60%_70%]"
            />
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/20 to-black/5"
            />

            <div className="flex items-center justify-between gap-3">
                <Link
                    href={profileEdit()}
                    className="flex min-w-0 items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt=""
                            className="size-[42px] shrink-0 rounded-full object-cover"
                        />
                    ) : (
                        <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#141414]">
                            {getInitials(user.name)}
                        </span>
                    )}
                    <span className="min-w-0">
                        <span className="block truncate text-xs text-white/85">
                            {today}
                            {siteName ? ` · ${siteName}` : ''}
                        </span>
                        <span className="block truncate text-lg font-bold">
                            {greeting}
                        </span>
                    </span>
                </Link>

                {/* Desktop keeps this switch in the sidebar footer. */}
                <button
                    type="button"
                    onClick={() => updateAppearance(dark ? 'light' : 'dark')}
                    aria-label={
                        dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'
                    }
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/95 text-[#141414] outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-accent md:hidden"
                >
                    {dark ? (
                        <Sun className="size-5" strokeWidth={1.8} aria-hidden />
                    ) : (
                        <Moon
                            className="size-5"
                            strokeWidth={1.8}
                            aria-hidden
                        />
                    )}
                </button>
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                <h1 className="text-[26px] leading-[1.15] font-extrabold tracking-tight">
                    Siap terbitkan paklaring
                    <br />
                    hari ini?
                </h1>
                {isSuperAdmin && <SiteFilter sites={sites} value={siteId} />}
            </div>
        </section>
    );
}

function QuickActions() {
    return (
        <div className="relative z-10 -mt-12 grid grid-cols-3 gap-1 rounded-[22px] bg-card p-3 shadow-[0_8px_24px_oklch(0.191_0_0/0.07)]">
            {QUICK.map((q) => (
                <Link
                    key={q.label}
                    href={q.href}
                    className="flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-[14px] text-center text-xs leading-tight font-semibold transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring md:min-h-16 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-left md:text-sm"
                >
                    <span
                        className={cn(
                            'flex size-11 items-center justify-center rounded-full',
                            q.accent
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-muted text-foreground',
                        )}
                    >
                        <q.icon
                            className="size-5"
                            strokeWidth={1.8}
                            aria-hidden
                        />
                    </span>
                    {q.label}
                </Link>
            ))}
        </div>
    );
}

function StatTile({
    label,
    value,
    note,
}: {
    label: string;
    value: number;
    note: string;
}) {
    return (
        <div
            className={cn(
                card,
                'flex flex-col gap-1.5 p-4 md:px-5 md:py-[18px]',
            )}
        >
            <div className="min-h-[31px] text-xs leading-[1.3] font-semibold text-muted-foreground md:min-h-0 md:text-[13px]">
                {label}
            </div>
            <div className="tabular text-[28px] leading-[1.1] font-extrabold tracking-[-0.025em] md:text-[32px] md:leading-[1.15]">
                {nf.format(value)}
            </div>
            <div className="tabular hidden text-xs text-muted-foreground md:block">
                {note}
            </div>
        </div>
    );
}

function MonthlyChart({
    data,
    today,
}: {
    data: MonthlyTrend[];
    today: string;
}) {
    const [hover, setHover] = useState<number | null>(null);
    const last = data.length - 1;
    const peak = data.reduce((a, b) => (b.total > a.total ? b : a), data[0]);
    const readout =
        hover === null
            ? `${monthYear(data[0].month)} – ${monthYear(data[last].month)}`
            : `${monthYear(data[hover].month)} · ${nf.format(data[hover].total)} paklaring`;

    const rows = data.map((d, i) => ({
        ...d,
        label: shortLabel(d.month),
        index: i,
    }));

    const renderChart = (
        rowsIn: typeof rows,
        { mobile }: { mobile: boolean },
    ) => (
        <ResponsiveContainer width="100%" height={mobile ? 180 : 230}>
            <BarChart
                data={rowsIn}
                margin={{ top: 22, right: 0, bottom: 0, left: 0 }}
                barCategoryGap={mobile ? '20%' : '28%'}
                onMouseLeave={() => setHover(null)}
            >
                {!mobile && (
                    <YAxis
                        width={28}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    />
                )}
                <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    interval={0}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <Bar
                    dataKey="total"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={mobile ? 30 : 26}
                    isAnimationActive={false}
                    onMouseEnter={(_, i) => setHover(rowsIn[i].index)}
                    label={(p: LabelProps & { index?: number }) => {
                        const row = rowsIn[p.index ?? 0];
                        const show =
                            mobile ||
                            hover === row.index ||
                            (hover === null && row.index >= last - 1);

                        return show ? (
                            <text
                                x={Number(p.x) + Number(p.width) / 2}
                                y={Number(p.y) - 6}
                                textAnchor="middle"
                                className="tabular fill-foreground text-xs font-bold"
                            >
                                {p.value}
                            </text>
                        ) : (
                            <g />
                        );
                    }}
                >
                    {rowsIn.map((row) => (
                        <Cell
                            key={row.month}
                            fill={
                                row.index === last
                                    ? 'var(--accent)'
                                    : 'var(--primary)'
                            }
                            fillOpacity={
                                hover === null || hover === row.index ? 1 : 0.35
                            }
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    const ariaLabel = `Grafik batang jumlah paklaring per bulan, ${monthYear(data[0].month)} sampai ${monthYear(data[last].month)}. Tertinggi ${monthYear(peak.month)} sebanyak ${peak.total}.`;

    return (
        <section
            className={cn(card, 'flex min-w-0 flex-col gap-3.5 p-4 md:p-5')}
        >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[15px] font-bold md:text-base">
                    Paklaring per bulan
                </h2>
                <span
                    className="tabular hidden text-[13px] text-muted-foreground md:inline"
                    aria-live="polite"
                >
                    {readout}
                </span>
                <span className="text-xs text-muted-foreground md:hidden">
                    6 bulan
                </span>
            </div>
            <div role="img" aria-label={ariaLabel}>
                <div className="hidden md:block">
                    {renderChart(rows, { mobile: false })}
                </div>
                <div className="md:hidden">
                    {renderChart(rows.slice(-6), { mobile: true })}
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                    aria-hidden
                    className="size-2.5 rounded-[3px] bg-accent shadow-[inset_0_0_0_1px_var(--foreground)]"
                />
                Bulan berjalan, data s.d. {today.split(', ')[1]}
            </div>
        </section>
    );
}

function ReasonChart({ data }: { data: ReasonTotal[] }) {
    const total = data.reduce((sum, r) => sum + r.total, 0);
    const max = Math.max(1, ...data.map((r) => r.total));

    return (
        <section
            className={cn(
                card,
                'flex min-w-0 flex-col gap-3 p-4 md:gap-4 md:p-5',
            )}
        >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[15px] font-bold md:text-base">
                    <span className="md:hidden">Per alasan PHK</span>
                    <span className="hidden md:inline">
                        Paklaring per alasan PHK
                    </span>
                </h2>
                <span className="tabular text-xs text-muted-foreground md:text-[13px]">
                    12 bulan · {nf.format(total)}
                </span>
            </div>
            <ul className="flex flex-col gap-3 md:gap-3.5">
                {data.map((r) => {
                    const width = `${(r.total / max) * 100}%`;
                    const pct = total ? Math.round((r.total / total) * 100) : 0;

                    return (
                        <li
                            key={r.reason}
                            title={`${r.reason}: ${r.total} paklaring`}
                            className="flex flex-col gap-[5px] text-[13px] md:grid md:grid-cols-[96px_minmax(0,1fr)_72px] md:items-center md:gap-3"
                        >
                            <div className="flex justify-between gap-2 md:contents">
                                <span className="font-semibold">
                                    {r.reason}
                                </span>
                                <span className="tabular font-bold md:order-last md:text-right">
                                    {nf.format(r.total)}{' '}
                                    <span className="hidden font-normal text-muted-foreground md:inline">
                                        {pct}%
                                    </span>
                                </span>
                            </div>
                            <span className="block h-2.5 rounded-r-[4px] bg-muted md:h-3.5">
                                <span
                                    className="block h-full rounded-r-[4px]"
                                    style={{
                                        width,
                                        background: alasanStyle(r.reason).fill,
                                    }}
                                />
                            </span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

function RecentList({ items }: { items: Paklaring[] }) {
    return (
        <section className={cn(card, 'overflow-hidden')}>
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-4">
                <h2 className="text-[15px] font-bold md:text-base">
                    Paklaring terbaru
                </h2>
                <Link
                    href={paklaringsIndex()}
                    className="flex min-h-11 items-center gap-1 rounded-full text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    Lihat semua
                    <ChevronRight
                        className="size-4"
                        strokeWidth={1.8}
                        aria-hidden
                    />
                </Link>
            </div>

            {items.length === 0 ? (
                <p className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">
                    Belum ada paklaring.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    {items.map((p) => (
                        <Link
                            key={p.id}
                            href={showPaklaring(p.id)}
                            className="flex items-center gap-2.5 border-t border-border px-4 py-3 outline-none hover:bg-muted/50 focus-visible:bg-muted md:grid md:min-w-[640px] md:grid-cols-[230px_minmax(0,1.3fr)_130px_110px_24px] md:gap-3 md:px-5"
                        >
                            <span className="tabular hidden text-[13px] font-bold md:block">
                                {p.no_surat}
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="truncate text-sm font-bold md:font-semibold">
                                    {p.nama}
                                </span>
                                <span className="tabular text-xs text-muted-foreground">
                                    <span className="md:hidden">
                                        {dateShort.format(
                                            new Date(p.created_at),
                                        )}
                                    </span>
                                    <span className="hidden md:inline">
                                        NRPP {p.nrpp}
                                    </span>
                                </span>
                            </span>
                            <span>
                                <ReasonBadge reason={p.alasan_phk} />
                            </span>
                            <span className="tabular hidden text-[13px] text-muted-foreground md:block">
                                {dateShort.format(new Date(p.created_at))}
                            </span>
                            <ChevronRight
                                className="hidden size-[18px] text-muted-foreground md:block"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

export default function Dashboard({
    stats,
    monthlyTrend,
    byReason,
    recentPaklarings,
    site,
    sites,
    filters,
    greeting,
    today,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = auth.user.role === 'super_admin';
    const firstName = auth.user.name.split(' ')[0];
    const greetingLine = `${greeting.text.charAt(0)}${greeting.text.slice(1).toLowerCase()}, ${firstName}`;

    const selectedSite = sites.find((s) => s.id === filters.site_id);
    const scopeNote = site
        ? site.name
        : selectedSite
          ? selectedSite.name
          : 'Di semua site';

    const prev = monthlyTrend.at(-2);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-4 md:gap-5">
                <div className="flex flex-col">
                    <Hero
                        greeting={greetingLine}
                        today={today}
                        user={auth.user}
                        siteName={site?.name ?? selectedSite?.name}
                        sites={sites}
                        siteId={filters.site_id}
                        isSuperAdmin={isSuperAdmin}
                    />
                    <QuickActions />
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))]">
                    <StatTile
                        label="Total paklaring"
                        value={stats.totalPaklaring}
                        note="Sejak aplikasi digunakan"
                    />
                    <StatTile
                        label="Bulan ini"
                        value={stats.paklaringThisMonth}
                        note={
                            prev
                                ? `${monthLong.format(parseMonth(prev.month))}: ${nf.format(prev.total)}`
                                : ''
                        }
                    />
                    <StatTile
                        label="Karyawan aktif"
                        value={stats.activeEmployees}
                        note={scopeNote}
                    />
                    <StatTile
                        label="Karyawan belum lengkap"
                        value={stats.incompleteEmployees}
                        note="Data belum cukup untuk paklaring"
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 md:gap-4 xl:grid-cols-2">
                    <MonthlyChart data={monthlyTrend} today={today} />
                    <ReasonChart data={byReason} />
                </div>

                <RecentList items={recentPaklarings} />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
