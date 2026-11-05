import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Download,
    Pencil,
    Plus,
    Search,
    Trash2,
    Upload,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Auth, Employee, PaginatedData, Site } from '@/types';

type Filters = {
    search?: string;
    site_id?: string;
    kelengkapan?: string;
    status?: string;
};

const nf = new Intl.NumberFormat('id-ID');
const dateShort = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});
const formatDate = (value: string | null | undefined) =>
    value ? dateShort.format(new Date(`${value.slice(0, 10)}T00:00:00`)) : '–';

const card = 'rounded-lg bg-card shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]';
const control =
    'h-11 w-full min-w-0 rounded-md border-2 border-transparent bg-input px-3 text-sm font-medium text-foreground outline-none focus-visible:border-foreground dark:focus-visible:border-accent';
const GRID =
    'grid grid-cols-[44px_100px_minmax(150px,1.3fr)_minmax(110px,1fr)_minmax(100px,0.8fr)_minmax(110px,0.9fr)_100px_118px_92px_44px] items-center gap-2 px-3';

function CompletePill({ ok }: { ok: boolean }) {
    return (
        <span
            className={cn(
                'inline-block rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                ok
                    ? 'bg-success-soft text-success'
                    : 'bg-warning-soft text-warning',
            )}
        >
            {ok ? 'Lengkap' : 'Belum lengkap'}
        </span>
    );
}

function StatusPill({ active }: { active: boolean }) {
    return (
        <span
            className={cn(
                'inline-block rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                active
                    ? 'bg-info-soft text-info'
                    : 'bg-muted text-muted-foreground',
            )}
        >
            {active ? 'Aktif' : 'Nonaktif'}
        </span>
    );
}

export default function Index({
    employees,
    sites,
    filters,
    stats,
    perPage,
}: {
    employees: PaginatedData<Employee>;
    sites: Pick<Site, 'id' | 'name'>[];
    filters: Filters;
    stats: { active: number; inactive: number; incomplete: number };
    perPage: string;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = auth.user.role === 'super_admin';

    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    useEffect(() => router.on('success', () => setSelectedIds(new Set())), []);

    function apply(patch: Partial<Filters & { per_page: string }>) {
        const next: Record<string, string> = {
            ...(filters as Record<string, string>),
            per_page: perPage,
            ...(patch as Record<string, string>),
        };

        Object.keys(next).forEach((key) => {
            if (!next[key] || (key === 'per_page' && next[key] === '15')) {
                delete next[key];
            }
        });

        router.get(EmployeeController.index.url(), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        apply({ search });
    }

    const pageIds = employees.data.map((e) => e.id);
    const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
    const allOnPage = pageIds.length > 0 && selectedOnPage === pageIds.length;

    function toggle(id: number, checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }

            return next;
        });
    }

    function toggleAll(checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            pageIds.forEach((id) =>
                checked ? next.add(id) : next.delete(id),
            );

            return next;
        });
    }

    function handleBulkDelete() {
        setBulkProcessing(true);

        router.delete(EmployeeController.bulkDestroy().url, {
            data: { ids: Array.from(selectedIds) },
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds(new Set());
                setBulkDeleteOpen(false);
            },
            onFinish: () => setBulkProcessing(false),
        });
    }

    const hasFilters = Boolean(
        filters.search ||
            filters.site_id ||
            filters.kelengkapan ||
            filters.status,
    );
    const summary = `${nf.format(stats.active)} aktif · ${nf.format(stats.incomplete)} belum lengkap`;

    return (
        <>
            <Head title="Daftar Karyawan" />

            <div className="relative flex flex-col gap-2.5 md:gap-[18px]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="hidden flex-col gap-1 md:flex">
                        <h1 className="text-[30px] leading-[1.15] font-extrabold tracking-[-0.025em]">
                            Daftar Karyawan
                        </h1>
                        <div className="tabular text-sm text-muted-foreground">
                            {summary}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <a
                                href={EmployeeController.export.url({
                                    query: filters,
                                })}
                            >
                                <Download />
                                Export
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={EmployeeController.importForm()}>
                                <Upload />
                                Import
                            </Link>
                        </Button>
                        <Button variant="accent" className="font-bold" asChild>
                            <Link href={EmployeeController.create()}>
                                <Plus />
                                Tambah Karyawan
                            </Link>
                        </Button>
                    </div>
                </div>

                <form
                    onSubmit={submitSearch}
                    className="flex flex-col gap-2 md:flex-row md:flex-wrap"
                >
                    <label className="relative block md:flex-[1_1_260px]">
                        <span className="sr-only">Cari karyawan</span>
                        <Search
                            className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
                            strokeWidth={1.8}
                            aria-hidden
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onBlur={() => {
                                if (search !== (filters.search ?? '')) {
                                    apply({ search });
                                }
                            }}
                            placeholder="Cari NRPP atau nama"
                            className={cn(control, 'pl-[42px]')}
                        />
                    </label>
                    <div
                        className={cn(
                            'grid gap-2 md:flex',
                            isSuperAdmin ? 'grid-cols-3' : 'grid-cols-2',
                        )}
                    >
                        {isSuperAdmin && (
                            <select
                                aria-label="Filter site"
                                value={filters.site_id ?? ''}
                                onChange={(e) =>
                                    apply({ site_id: e.target.value })
                                }
                                className={cn(control, 'md:w-44')}
                            >
                                <option value="">Semua site</option>
                                {sites.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <select
                            aria-label="Filter kelengkapan"
                            value={filters.kelengkapan ?? ''}
                            onChange={(e) =>
                                apply({ kelengkapan: e.target.value })
                            }
                            className={cn(control, 'md:w-48')}
                        >
                            <option value="">Semua kelengkapan</option>
                            <option value="lengkap">Lengkap</option>
                            <option value="belum">Belum lengkap</option>
                        </select>
                        <select
                            aria-label="Filter status"
                            value={filters.status ?? ''}
                            onChange={(e) => apply({ status: e.target.value })}
                            className={cn(control, 'md:w-40')}
                        >
                            <option value="">Semua status</option>
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>
                </form>

                <div className="tabular px-0.5 text-[13px] text-muted-foreground md:hidden">
                    {summary}
                </div>

                {employees.data.length === 0 ? (
                    <div
                        className={cn(
                            card,
                            'flex flex-col items-center gap-3 px-6 py-14 text-center',
                        )}
                    >
                        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <Users
                                className="size-6 text-muted-foreground"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                        </span>
                        <div className="text-base font-bold">
                            {hasFilters
                                ? 'Tidak ada karyawan yang cocok'
                                : 'Belum ada data karyawan'}
                        </div>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {hasFilters
                                ? 'Ubah atau hapus filter untuk melihat hasil lain.'
                                : 'Tambahkan karyawan satu per satu atau import dari file Excel.'}
                        </p>
                        {hasFilters ? (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    router.get(
                                        EmployeeController.index.url(),
                                        {},
                                        { replace: true },
                                    );
                                }}
                            >
                                Hapus filter
                            </Button>
                        ) : (
                            <Button variant="accent" asChild>
                                <Link href={EmployeeController.importForm()}>
                                    <Upload />
                                    Import Karyawan
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <ul className="flex flex-col gap-2.5 md:hidden">
                            {employees.data.map((e) => {
                                const on = selectedIds.has(e.id);

                                return (
                                    <li
                                        key={e.id}
                                        className={cn(
                                            'flex items-stretch rounded-lg py-1 pr-1 shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]',
                                            on ? 'bg-accent-soft' : 'bg-card',
                                        )}
                                    >
                                        <label className="flex w-12 flex-none cursor-pointer items-center justify-center">
                                            <Checkbox
                                                checked={on}
                                                onCheckedChange={(v) =>
                                                    toggle(e.id, v === true)
                                                }
                                                aria-label={`Pilih ${e.nama}`}
                                            />
                                        </label>
                                        <Link
                                            href={EmployeeController.edit(e)}
                                            className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-md py-2.5 pr-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="truncate text-[15px] font-bold">
                                                    {e.nama}
                                                </span>
                                                <CompletePill
                                                    ok={
                                                        e.is_complete_for_paklaring
                                                    }
                                                />
                                            </span>
                                            <span className="tabular truncate text-xs text-muted-foreground">
                                                NRPP {e.nrpp} ·{' '}
                                                {e.site?.name ?? e.lokasi ?? '–'}
                                            </span>
                                            <span>
                                                <StatusPill
                                                    active={e.is_active}
                                                />
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        <section
                            className={cn(card, 'hidden overflow-hidden md:block')}
                        >
                            <div className="overflow-x-auto">
                                <div
                                    role="table"
                                    aria-label="Daftar karyawan"
                                    className="min-w-[1080px]"
                                >
                                    <div
                                        role="row"
                                        className={cn(
                                            GRID,
                                            'bg-muted py-1.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase',
                                        )}
                                    >
                                        <span
                                            role="columnheader"
                                            className="flex size-11 items-center justify-center"
                                        >
                                            <Checkbox
                                                checked={
                                                    allOnPage
                                                        ? true
                                                        : selectedOnPage > 0
                                                          ? 'indeterminate'
                                                          : false
                                                }
                                                onCheckedChange={(v) =>
                                                    toggleAll(v === true)
                                                }
                                                aria-label="Pilih semua baris"
                                            />
                                        </span>
                                        <span role="columnheader">NRPP</span>
                                        <span role="columnheader">Nama</span>
                                        <span role="columnheader">Project</span>
                                        <span role="columnheader">Lokasi</span>
                                        <span role="columnheader">
                                            Classification
                                        </span>
                                        <span role="columnheader">DOH</span>
                                        <span role="columnheader">
                                            Paklaring
                                        </span>
                                        <span role="columnheader">Status</span>
                                        <span
                                            role="columnheader"
                                            className="sr-only"
                                        >
                                            Aksi
                                        </span>
                                    </div>
                                    {employees.data.map((e) => {
                                        const on = selectedIds.has(e.id);

                                        return (
                                            <div
                                                key={e.id}
                                                role="row"
                                                className={cn(
                                                    GRID,
                                                    'border-t border-border py-1.5 text-[13px]',
                                                    on && 'bg-accent-soft',
                                                )}
                                            >
                                                <span
                                                    role="cell"
                                                    className="flex size-11 items-center justify-center"
                                                >
                                                    <Checkbox
                                                        checked={on}
                                                        onCheckedChange={(v) =>
                                                            toggle(
                                                                e.id,
                                                                v === true,
                                                            )
                                                        }
                                                        aria-label={`Pilih ${e.nama}`}
                                                    />
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="tabular font-bold"
                                                >
                                                    {e.nrpp}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="truncate text-sm font-semibold"
                                                >
                                                    {e.nama}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="truncate"
                                                >
                                                    {e.project || '–'}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="truncate"
                                                >
                                                    {e.lokasi || '–'}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="truncate"
                                                >
                                                    {e.classification || '–'}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="tabular"
                                                >
                                                    {formatDate(e.doh)}
                                                </span>
                                                <span role="cell">
                                                    <CompletePill
                                                        ok={
                                                            e.is_complete_for_paklaring
                                                        }
                                                    />
                                                </span>
                                                <span role="cell">
                                                    <StatusPill
                                                        active={e.is_active}
                                                    />
                                                </span>
                                                <span role="cell">
                                                    <Link
                                                        href={EmployeeController.edit(
                                                            e,
                                                        )}
                                                        aria-label={`Edit ${e.nama}`}
                                                        className="flex size-10 items-center justify-center rounded-full outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                                                    >
                                                        <Pencil
                                                            className="size-[18px]"
                                                            strokeWidth={1.8}
                                                            aria-hidden
                                                        />
                                                    </Link>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        <div
                            className={cn(
                                card,
                                'tabular flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[13px] text-muted-foreground',
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <span>
                                    {nf.format(employees.from ?? 0)}–
                                    {nf.format(employees.to ?? 0)} dari{' '}
                                    {nf.format(employees.total)}
                                </span>
                                <select
                                    value={perPage}
                                    onChange={(e) =>
                                        apply({ per_page: e.target.value })
                                    }
                                    className="h-9 rounded-full border border-border bg-card px-2.5 text-[13px] font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label="Jumlah baris per halaman"
                                >
                                    <option value="15">15 / halaman</option>
                                    <option value="50">50 / halaman</option>
                                    <option value="100">100 / halaman</option>
                                    <option value="all">Semua</option>
                                </select>
                            </span>
                            <span className="flex gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!employees.prev_page_url}
                                    onClick={() =>
                                        employees.prev_page_url &&
                                        router.get(
                                            employees.prev_page_url,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!employees.next_page_url}
                                    onClick={() =>
                                        employees.next_page_url &&
                                        router.get(
                                            employees.next_page_url,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    Berikutnya
                                </Button>
                            </span>
                        </div>
                    </>
                )}

                {selectedIds.size > 0 && (
                    <div
                        role="toolbar"
                        aria-label="Aksi massal"
                        className="fixed inset-x-4 bottom-[calc(96px+env(safe-area-inset-bottom))] z-40 flex items-center gap-1 rounded-full bg-primary py-1.5 pr-1.5 pl-4 text-primary-foreground shadow-[0_10px_30px_rgba(20,20,20,0.22)] md:sticky md:inset-x-auto md:bottom-5 md:gap-2 md:self-center md:py-2 md:pr-2 md:pl-5"
                    >
                        <span
                            className="tabular flex-1 text-sm font-bold md:mr-3 md:flex-none"
                            aria-live="polite"
                        >
                            {selectedIds.size} dipilih
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedIds(new Set())}
                            className="h-11 rounded-full px-3 text-sm font-semibold outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent md:px-4"
                        >
                            <span className="md:hidden">Batal</span>
                            <span className="hidden md:inline">Batal pilih</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setBulkDeleteOpen(true)}
                            className="flex h-11 items-center gap-2 rounded-full bg-[oklch(0.472_0.163_30)] px-4 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-accent md:px-[18px]"
                        >
                            <Trash2
                                className="hidden size-[18px] md:block"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                            Hapus
                        </button>
                    </div>
                )}
            </div>

            <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogContent className="rounded-xl">
                    <DialogTitle>Hapus {selectedIds.size} karyawan?</DialogTitle>
                    <DialogDescription>
                        Paklaring yang sudah pernah dibuat untuk karyawan ini
                        tidak terpengaruh. Tindakan ini tidak bisa dibatalkan.
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setBulkDeleteOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            loading={bulkProcessing}
                            onClick={handleBulkDelete}
                        >
                            Hapus {selectedIds.size} karyawan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Daftar Karyawan', href: EmployeeController.index() },
    ],
};
