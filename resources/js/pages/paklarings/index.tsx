import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Download,
    Eye,
    FileText,
    Layers,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ReasonBadge } from '@/components/reason-badge';
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
import {
    bulkDestroy,
    create,
    createBatch,
    edit,
    index,
    pdf,
    show,
} from '@/routes/paklarings';
import type { Auth, PaginatedData, Paklaring, Site } from '@/types';

type Filters = {
    search?: string;
    site_id?: string;
    alasan_phk?: string;
    date_from?: string;
    date_to?: string;
};

type Props = {
    paklarings: PaginatedData<Paklaring>;
    sites: Pick<Site, 'id' | 'name'>[];
    filters: Filters;
    alasanPhkOptions: string[];
    stats: { thisMonth: number; sites: number };
    perPage: string;
};

const nf = new Intl.NumberFormat('id-ID');
const dateShort = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});
const formatDate = (value: string | null | undefined) =>
    value ? dateShort.format(new Date(`${value.slice(0, 10)}T00:00:00`)) : '–';

const fieldLabel =
    'flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground';
const fieldControl =
    'h-11 w-full min-w-0 rounded-md border-2 border-transparent bg-input px-3 text-sm font-medium text-foreground outline-none focus-visible:border-foreground dark:focus-visible:border-accent dark:[color-scheme:dark]';
const pillSelect =
    'h-11 min-w-0 rounded-full border border-border bg-card px-2.5 text-[13px] font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';

const GRID =
    'grid grid-cols-[44px_214px_minmax(150px,1.3fr)_84px_120px_96px_minmax(130px,1fr)_124px] items-center gap-2 px-3';

const iconLinkClass =
    'flex size-10 items-center justify-center rounded-full text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring';

function IconLink({
    label,
    href,
    children,
}: {
    label: string;
    href: ReturnType<typeof show>;
    children: ReactNode;
}) {
    return (
        <Link href={href} aria-label={label} className={iconLinkClass}>
            {children}
        </Link>
    );
}

export default function Index({
    paklarings,
    sites,
    filters,
    alasanPhkOptions,
    perPage,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = auth.user.role === 'super_admin';

    const [search, setSearch] = useState(filters.search ?? '');
    const [showDates, setShowDates] = useState(
        Boolean(filters.date_from || filters.date_to),
    );
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    // Any navigation (pagination, filtering, a delete) loads a new page of
    // results, so a stale selection should not carry over across it.
    useEffect(() => router.on('success', () => setSelectedIds(new Set())), []);

    function applyFilters(patch: Partial<Filters & { per_page: string }>) {
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

        router.get(index.url(), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        applyFilters({ search });
    }

    const pageIds = paklarings.data.map((p) => p.id);
    const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
    const allOnPage = pageIds.length > 0 && selectedOnPage === pageIds.length;

    function toggleAllOnPage(checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            pageIds.forEach((id) =>
                checked ? next.add(id) : next.delete(id),
            );

            return next;
        });
    }

    function toggleOne(id: number, checked: boolean) {
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

    function handleBulkDelete() {
        setBulkProcessing(true);

        router.delete(bulkDestroy().url, {
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
            filters.alasan_phk ||
            filters.date_from ||
            filters.date_to,
    );
    const scope = filters.site_id
        ? `di ${sites.find((s) => String(s.id) === String(filters.site_id))?.name ?? 'site terpilih'}`
        : isSuperAdmin
          ? 'di semua site'
          : '';
    const countLabel = `${nf.format(paklarings.total)} surat${scope ? ` ${scope}` : ''}`;

    const siteSelect = (className: string, labelled: boolean) =>
        isSuperAdmin && (
            <select
                aria-label={labelled ? undefined : 'Filter site'}
                value={filters.site_id ?? ''}
                onChange={(e) => applyFilters({ site_id: e.target.value })}
                className={className}
            >
                <option value="">Semua site</option>
                {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                ))}
            </select>
        );

    const reasonSelect = (
        className: string,
        placeholder: string,
        labelled: boolean,
    ) => (
        <select
            aria-label={labelled ? undefined : 'Filter alasan PHK'}
            value={filters.alasan_phk ?? ''}
            onChange={(e) => applyFilters({ alasan_phk: e.target.value })}
            className={className}
        >
            <option value="">{placeholder}</option>
            {alasanPhkOptions.map((a) => (
                <option key={a} value={a}>
                    {a}
                </option>
            ))}
        </select>
    );

    const dateInputs = (
        <>
            <label className={cn(fieldLabel, 'md:flex-[0_1_150px]')}>
                Dari tanggal
                <input
                    type="date"
                    value={filters.date_from ?? ''}
                    max={filters.date_to}
                    onChange={(e) => applyFilters({ date_from: e.target.value })}
                    className={cn(fieldControl, 'tabular')}
                />
            </label>
            <label className={cn(fieldLabel, 'md:flex-[0_1_150px]')}>
                Sampai tanggal
                <input
                    type="date"
                    value={filters.date_to ?? ''}
                    min={filters.date_from}
                    onChange={(e) => applyFilters({ date_to: e.target.value })}
                    className={cn(fieldControl, 'tabular')}
                />
            </label>
        </>
    );

    const card = 'rounded-lg bg-card shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]';

    return (
        <>
            <Head title="Daftar Paklaring" />

            <div className="relative flex flex-col gap-2.5 md:gap-[18px]">
                {/* Page header (desktop; mobile uses the shell header) */}
                <div className="hidden flex-wrap items-end justify-between gap-3 md:flex">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[30px] leading-[1.15] font-extrabold tracking-[-0.025em]">
                            Daftar Paklaring
                        </h1>
                        <div className="tabular text-sm text-muted-foreground">
                            {countLabel}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={createBatch()}>
                                <Layers />
                                Buat Batch
                            </Link>
                        </Button>
                        <Button variant="accent" className="font-bold" asChild>
                            <Link href={create()}>
                                <Plus />
                                Buat Paklaring
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <form
                    onSubmit={submitSearch}
                    className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-end md:gap-2"
                >
                    <label className={cn(fieldLabel, 'md:flex-[1_1_260px]')}>
                        <span className="sr-only md:not-sr-only">Cari</span>
                        <span className="relative block">
                            <Search
                                className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                            <input
                                type="search"
                                name="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onBlur={() => {
                                    if (search !== (filters.search ?? '')) {
                                        applyFilters({ search });
                                    }
                                }}
                                placeholder="No. surat, nama, atau NRPP"
                                className={cn(fieldControl, 'pl-[42px]')}
                            />
                        </span>
                    </label>

                    {isSuperAdmin && (
                        <label
                            className={cn(
                                fieldLabel,
                                'hidden md:flex md:flex-[0_1_160px]',
                            )}
                        >
                            Site
                            {siteSelect(fieldControl, true)}
                        </label>
                    )}
                    <label
                        className={cn(
                            fieldLabel,
                            'hidden md:flex md:flex-[0_1_170px]',
                        )}
                    >
                        Alasan PHK
                        {reasonSelect(fieldControl, 'Semua alasan', true)}
                    </label>
                    <div className="hidden md:contents">{dateInputs}</div>

                    {/* Mobile pill row */}
                    <div
                        className={cn(
                            'grid gap-2 md:hidden',
                            isSuperAdmin ? 'grid-cols-3' : 'grid-cols-2',
                        )}
                    >
                        {siteSelect(pillSelect, false)}
                        {reasonSelect(pillSelect, 'Alasan', false)}
                        <button
                            type="button"
                            onClick={() => setShowDates((v) => !v)}
                            aria-expanded={showDates}
                            className={cn(
                                pillSelect,
                                'flex items-center justify-center gap-1.5',
                                (filters.date_from || filters.date_to) &&
                                    'border-foreground',
                            )}
                        >
                            <CalendarDays
                                className="size-4"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                            Tanggal
                        </button>
                    </div>
                    {showDates && (
                        <div className="grid grid-cols-2 gap-2 md:hidden">
                            {dateInputs}
                        </div>
                    )}
                </form>

                <div className="tabular px-0.5 pt-0.5 text-[13px] text-muted-foreground md:hidden">
                    {nf.format(paklarings.total)} surat
                </div>

                {paklarings.data.length === 0 ? (
                    <div
                        className={cn(
                            card,
                            'flex flex-col items-center gap-3 px-6 py-14 text-center',
                        )}
                    >
                        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <FileText
                                className="size-6 text-muted-foreground"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                        </span>
                        <div className="text-base font-bold">
                            {hasFilters
                                ? 'Tidak ada paklaring yang cocok'
                                : 'Belum ada paklaring'}
                        </div>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {hasFilters
                                ? 'Ubah atau hapus filter untuk melihat hasil lain.'
                                : 'Buat paklaring pertama untuk karyawan yang sudah selesai bekerja.'}
                        </p>
                        {hasFilters ? (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    router.get(index.url(), {}, { replace: true });
                                }}
                            >
                                Hapus filter
                            </Button>
                        ) : (
                            <Button variant="accent" asChild>
                                <Link href={create()}>
                                    <Plus />
                                    Buat Paklaring
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile cards */}
                        <ul className="flex flex-col gap-2.5 md:hidden">
                            {paklarings.data.map((p) => {
                                const on = selectedIds.has(p.id);

                                return (
                                    <li
                                        key={p.id}
                                        className={cn(
                                            'flex items-stretch rounded-lg py-1 pr-1 shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]',
                                            on ? 'bg-accent-soft' : 'bg-card',
                                        )}
                                    >
                                        <label className="flex w-12 flex-none cursor-pointer items-center justify-center">
                                            <Checkbox
                                                checked={on}
                                                onCheckedChange={(v) =>
                                                    toggleOne(p.id, v === true)
                                                }
                                                aria-label={`Pilih ${p.no_surat}`}
                                            />
                                        </label>
                                        <Link
                                            href={show(p)}
                                            className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-md py-2.5 pr-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="truncate text-[15px] font-bold">
                                                    {p.nama}
                                                </span>
                                                <ReasonBadge
                                                    reason={p.alasan_phk}
                                                    className="py-[3px]"
                                                />
                                            </span>
                                            <span className="tabular truncate text-xs font-semibold text-muted-foreground">
                                                {p.no_surat}
                                            </span>
                                            <span className="tabular text-xs text-muted-foreground">
                                                NRPP {p.nrpp} · DOE{' '}
                                                {formatDate(p.doe)}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Desktop table */}
                        <section
                            className={cn(card, 'hidden overflow-hidden md:block')}
                        >
                            <div className="overflow-x-auto">
                                <div
                                    role="table"
                                    aria-label="Daftar paklaring"
                                    className="min-w-[1020px]"
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
                                                    toggleAllOnPage(v === true)
                                                }
                                                aria-label="Pilih semua baris"
                                            />
                                        </span>
                                        <span role="columnheader">No. Surat</span>
                                        <span role="columnheader">Nama</span>
                                        <span role="columnheader">NRPP</span>
                                        <span role="columnheader">Alasan</span>
                                        <span role="columnheader">DOE</span>
                                        <span role="columnheader">Dibuat</span>
                                        <span
                                            role="columnheader"
                                            className="text-right"
                                        >
                                            Aksi
                                        </span>
                                    </div>
                                    {paklarings.data.map((p) => {
                                        const on = selectedIds.has(p.id);

                                        return (
                                            <div
                                                key={p.id}
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
                                                            toggleOne(
                                                                p.id,
                                                                v === true,
                                                            )
                                                        }
                                                        aria-label={`Pilih ${p.no_surat}`}
                                                    />
                                                </span>
                                                <span role="cell" className="min-w-0">
                                                    <Link
                                                        href={show(p)}
                                                        className="tabular block truncate font-bold hover:underline"
                                                    >
                                                        {p.no_surat}
                                                    </Link>
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="truncate text-sm font-semibold"
                                                >
                                                    {p.nama}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="tabular text-muted-foreground"
                                                >
                                                    {p.nrpp}
                                                </span>
                                                <span role="cell">
                                                    <ReasonBadge
                                                        reason={p.alasan_phk}
                                                    />
                                                </span>
                                                <span role="cell" className="tabular">
                                                    {formatDate(p.doe)}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="flex min-w-0 flex-col"
                                                >
                                                    <span className="tabular">
                                                        {formatDate(p.created_at)}
                                                    </span>
                                                    <span className="truncate text-xs text-muted-foreground">
                                                        {[
                                                            p.creator?.name,
                                                            p.site?.name,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' · ')}
                                                    </span>
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="flex justify-end gap-0.5"
                                                >
                                                    <IconLink
                                                        href={show(p)}
                                                        label={`Lihat ${p.no_surat}`}
                                                    >
                                                        <Eye
                                                            className="size-[18px]"
                                                            strokeWidth={1.8}
                                                            aria-hidden
                                                        />
                                                    </IconLink>
                                                    <IconLink
                                                        href={edit(p)}
                                                        label={`Edit ${p.no_surat}`}
                                                    >
                                                        <Pencil
                                                            className="size-[18px]"
                                                            strokeWidth={1.8}
                                                            aria-hidden
                                                        />
                                                    </IconLink>
                                                    <a
                                                        href={
                                                            pdf(p, {
                                                                query: {
                                                                    download: 1,
                                                                },
                                                            }).url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        aria-label={`Unduh PDF ${p.no_surat}`}
                                                        className={iconLinkClass}
                                                    >
                                                        <Download
                                                            className="size-[18px]"
                                                            strokeWidth={1.8}
                                                            aria-hidden
                                                        />
                                                    </a>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Pagination */}
                        <div
                            className={cn(
                                card,
                                'tabular flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[13px] text-muted-foreground',
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <span>
                                    {nf.format(paklarings.from ?? 0)}–
                                    {nf.format(paklarings.to ?? 0)} dari{' '}
                                    {nf.format(paklarings.total)}
                                </span>
                                <select
                                    value={perPage}
                                    onChange={(e) =>
                                        applyFilters({ per_page: e.target.value })
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
                                    disabled={!paklarings.prev_page_url}
                                    onClick={() =>
                                        paklarings.prev_page_url &&
                                        router.get(
                                            paklarings.prev_page_url,
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
                                    disabled={!paklarings.next_page_url}
                                    onClick={() =>
                                        paklarings.next_page_url &&
                                        router.get(
                                            paklarings.next_page_url,
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

                {/* Bulk action bar */}
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
                    <DialogTitle>Hapus {selectedIds.size} paklaring?</DialogTitle>
                    <DialogDescription>
                        Surat dan file PDF-nya akan dihapus permanen. Tindakan
                        ini tidak bisa dibatalkan.
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
                            Hapus {selectedIds.size} paklaring
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Daftar Paklaring', href: index() }],
};
