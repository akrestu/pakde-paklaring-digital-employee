import type { InertiaLinkProps } from '@inertiajs/react';
import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    CalendarClock,
    FileText,
    Plus,
    UserCheck,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as employeesIndex } from '@/routes/employees';
import {
    create as createPaklaring,
    show as showPaklaring,
} from '@/routes/paklarings';
import type { Auth, Paklaring } from '@/types';

type MonthlyTrend = { month: string; total: number };
type SiteBreakdown = { site: string; total: number };

function formatMonth(iso: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        month: 'short',
        year: 'numeric',
    }).format(new Date(iso));
}

function StatCard({
    icon: Icon,
    label,
    value,
    tone = 'default',
    action,
}: {
    icon: LucideIcon;
    label: string;
    value: number;
    tone?: 'default' | 'warning';
    action?: { label: string; href: InertiaLinkProps['href'] };
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4">
                <div
                    className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full',
                        tone === 'warning'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-primary/10 text-primary',
                    )}
                >
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-2xl font-semibold tabular-nums">
                        {value}
                    </p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                {action && (
                    <Link
                        href={action.href}
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                        {action.label}
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    stats,
    monthlyTrend,
    employeeStatus,
    paklaringBySite,
    recentPaklarings,
    site,
    greeting,
    today,
}: {
    stats: {
        totalPaklaring: number;
        paklaringThisMonth: number;
        activeEmployees: number;
        incompleteEmployees: number;
    };
    monthlyTrend: MonthlyTrend[];
    employeeStatus: { active: number; inactive: number };
    paklaringBySite: SiteBreakdown[];
    recentPaklarings: Paklaring[];
    site: { name: string } | null;
    greeting: { text: string; emoji: string };
    today: string;
}) {
    const {
        props: { auth },
    } = usePage<{ auth: Auth }>();
    const getInitials = useInitials();

    const firstName = auth.user.name.split(' ')[0];

    const trendConfig = {
        total: { label: 'Paklaring', color: 'var(--chart-1)' },
    } satisfies ChartConfig;

    const statusConfig = {
        total: { label: 'Karyawan' },
        active: { label: 'Aktif', color: 'var(--chart-1)' },
        inactive: { label: 'Nonaktif', color: 'var(--chart-4)' },
    } satisfies ChartConfig;

    const statusData = [
        {
            status: 'active',
            total: employeeStatus.active,
            fill: 'var(--color-active)',
        },
        {
            status: 'inactive',
            total: employeeStatus.inactive,
            fill: 'var(--color-inactive)',
        },
    ];

    const siteConfig = {
        total: { label: 'Paklaring', color: 'var(--chart-2)' },
    } satisfies ChartConfig;

    return (
        <>
            <Head title="Dashboard" />

            <div className="@container/main flex flex-1 flex-col gap-0">
                {/* Header / Greeting */}
                <div className="flex flex-col gap-4 border-b px-4 py-5 lg:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                {today}
                            </p>
                            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                                <span>{greeting.emoji}</span>
                                <span>
                                    {greeting.text}
                                    <span className="text-primary">
                                        , {firstName}
                                    </span>
                                    !
                                </span>
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {site
                                    ? `Ringkasan aktivitas paklaring untuk ${site.name}.`
                                    : 'Ringkasan aktivitas paklaring di seluruh site.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm">
                                <Link href={createPaklaring()}>
                                    <Plus className="h-3.5 w-3.5" />
                                    Buat Paklaring
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Status strip */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1.5 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            {stats.totalPaklaring} total paklaring
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {stats.activeEmployees} karyawan aktif
                        </Badge>
                        {stats.incompleteEmployees > 0 && (
                            <Badge
                                variant="secondary"
                                className="gap-1.5 text-xs text-amber-600 dark:text-amber-400"
                            >
                                <AlertTriangle className="h-3 w-3" />
                                {stats.incompleteEmployees} data belum lengkap
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6 px-4 py-5 lg:px-6">
                    {/* Stat cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={FileText}
                            label="Total Paklaring"
                            value={stats.totalPaklaring}
                        />
                        <StatCard
                            icon={CalendarClock}
                            label="Dibuat Bulan Ini"
                            value={stats.paklaringThisMonth}
                        />
                        <StatCard
                            icon={UserCheck}
                            label="Karyawan Aktif"
                            value={stats.activeEmployees}
                        />
                        <StatCard
                            icon={AlertTriangle}
                            label="Data Belum Lengkap"
                            value={stats.incompleteEmployees}
                            tone={
                                stats.incompleteEmployees > 0
                                    ? 'warning'
                                    : 'default'
                            }
                            action={
                                stats.incompleteEmployees > 0
                                    ? {
                                          label: 'Lengkapi',
                                          href: employeesIndex(),
                                      }
                                    : undefined
                            }
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Tren Paklaring</CardTitle>
                                <CardDescription>
                                    Jumlah paklaring dibuat, 6 bulan terakhir
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={trendConfig}
                                    className="aspect-auto h-[260px] w-full"
                                >
                                    <BarChart
                                        data={monthlyTrend}
                                        margin={{ left: 12, right: 12 }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={formatMonth}
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(value) =>
                                                        formatMonth(
                                                            String(value),
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="var(--color-total)"
                                            radius={4}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status Karyawan</CardTitle>
                                <CardDescription>
                                    Aktif vs nonaktif
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={statusConfig}
                                    className="mx-auto aspect-square max-h-[260px]"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                    nameKey="status"
                                                />
                                            }
                                        />
                                        <Pie
                                            data={statusData}
                                            dataKey="total"
                                            nameKey="status"
                                            innerRadius={55}
                                            isAnimationActive={false}
                                        />
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent nameKey="status" />
                                            }
                                        />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {auth.user.role === 'super_admin' &&
                        paklaringBySite.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Paklaring per Site</CardTitle>
                                    <CardDescription>
                                        Distribusi paklaring di seluruh site
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={siteConfig}
                                        className="h-[220px] w-full"
                                    >
                                        <BarChart
                                            data={paklaringBySite}
                                            layout="vertical"
                                            margin={{ left: 12 }}
                                        >
                                            <CartesianGrid horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="site"
                                                type="category"
                                                tickLine={false}
                                                axisLine={false}
                                                width={140}
                                            />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                            />
                                            <Bar
                                                dataKey="total"
                                                fill="var(--color-total)"
                                                radius={4}
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        )}

                    {/* Recent activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Paklaring Terbaru</CardTitle>
                            <CardDescription>
                                Aktivitas pembuatan paklaring paling baru
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentPaklarings.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                                    <FileText className="size-8 text-muted-foreground/50" />
                                    <p>Belum ada paklaring dibuat.</p>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                    >
                                        <Link href={createPaklaring()}>
                                            Buat paklaring pertama
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {recentPaklarings.map((paklaring) => (
                                        <Link
                                            key={paklaring.id}
                                            href={showPaklaring(paklaring)}
                                            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-muted/40"
                                        >
                                            <Avatar>
                                                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                                                    {getInitials(
                                                        paklaring.nama,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {paklaring.nama}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {paklaring.no_surat}
                                                    {paklaring.site &&
                                                        ` · ${paklaring.site.name}`}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0"
                                            >
                                                {paklaring.signing_tanggal.slice(
                                                    0,
                                                    10,
                                                )}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
