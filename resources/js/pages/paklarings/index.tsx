import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Download,
    Eye,
    FileText,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import {
    bulkDestroy,
    create,
    createBatch,
    destroy,
    edit,
    index,
    pdf,
    show,
} from '@/routes/paklarings';
import type { Auth, PaginatedData, Paklaring, Site } from '@/types';

function decodeLabel(label: string): string {
    return label
        .replace(/&laquo;\s*/i, '')
        .replace(/\s*&raquo;/i, '')
        .trim();
}

export default function Index({
    paklarings,
    sites,
    filters,
    stats,
    perPage,
}: {
    paklarings: PaginatedData<Paklaring>;
    sites: Site[];
    filters: { search?: string; site_id?: string };
    stats: { thisMonth: number; sites: number };
    perPage: string;
}) {
    const {
        props: { auth },
    } = usePage<{ auth: Auth }>();
    const getInitials = useInitials();

    const [siteFilter, setSiteFilter] = useState(filters.site_id ?? 'all');
    const [perPageValue, setPerPageValue] = useState(perPage);
    const [deleteTarget, setDeleteTarget] = useState<Paklaring | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    // Any navigation (pagination, filtering, a delete) loads a new page of
    // results, so a stale selection should not carry over across it.
    useEffect(() => router.on('success', () => setSelectedIds(new Set())), []);

    const pageIds = paklarings.data.map((paklaring) => paklaring.id);
    const selectedOnPageCount = pageIds.filter((id) =>
        selectedIds.has(id),
    ).length;
    const allOnPageSelected =
        pageIds.length > 0 && selectedOnPageCount === pageIds.length;
    const someOnPageSelected =
        selectedOnPageCount > 0 && !allOnPageSelected;

    function toggleAllOnPage(checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            pageIds.forEach((id) => {
                if (checked) {
                    next.add(id);
                } else {
                    next.delete(id);
                }
            });

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

    function handlePerPageChange(value: string) {
        setPerPageValue(value);
        router.get(
            index.url({ query: { ...filters, per_page: value } }),
            {},
            { preserveState: true, preserveScroll: true },
        );
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

    return (
        <>
            <Head title="Paklaring" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        title="Paklaring"
                        description="Daftar surat paklaring yang sudah pernah dibuat."
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={createBatch()}>
                                <Users />
                                Buat Massal
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                Buat Paklaring
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold tabular-nums">
                                    {paklarings.total}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total paklaring
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                <CalendarDays className="size-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold tabular-nums">
                                    {stats.thisMonth}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Dibuat bulan ini
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {auth.user.role === 'super_admin' && (
                        <Card>
                            <CardContent className="flex items-center gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <FileText className="size-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold tabular-nums">
                                        {stats.sites}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Site dengan paklaring
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent>
                        <Form
                            {...index.form()}
                            className="flex flex-wrap items-end gap-3"
                        >
                            {() => (
                                <>
                                    <div className="grid gap-1.5">
                                        <label
                                            htmlFor="search"
                                            className="text-xs font-medium text-muted-foreground"
                                        >
                                            Cari
                                        </label>
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                name="search"
                                                placeholder="Nama, NRPP, atau No Surat"
                                                defaultValue={filters.search}
                                                className="w-64 pl-8"
                                            />
                                        </div>
                                    </div>

                                    {auth.user.role === 'super_admin' && (
                                        <div className="grid gap-1.5">
                                            <label
                                                htmlFor="site_id"
                                                className="text-xs font-medium text-muted-foreground"
                                            >
                                                Site
                                            </label>
                                            <Select
                                                value={siteFilter}
                                                onValueChange={setSiteFilter}
                                            >
                                                <SelectTrigger
                                                    id="site_id"
                                                    className="w-48"
                                                >
                                                    <SelectValue placeholder="Semua site" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        Semua site
                                                    </SelectItem>
                                                    {sites.map((site) => (
                                                        <SelectItem
                                                            key={site.id}
                                                            value={String(
                                                                site.id,
                                                            )}
                                                        >
                                                            {site.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input
                                                type="hidden"
                                                name="site_id"
                                                value={
                                                    siteFilter === 'all'
                                                        ? ''
                                                        : siteFilter
                                                }
                                            />
                                        </div>
                                    )}

                                    <Button type="submit" variant="secondary">
                                        Terapkan Filter
                                    </Button>

                                    <div className="ml-auto grid gap-1.5">
                                        <label
                                            htmlFor="per_page"
                                            className="text-xs font-medium text-muted-foreground"
                                        >
                                            Tampilkan
                                        </label>
                                        <Select
                                            value={perPageValue}
                                            onValueChange={
                                                handlePerPageChange
                                            }
                                        >
                                            <SelectTrigger
                                                id="per_page"
                                                className="w-32"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">
                                                    15 baris
                                                </SelectItem>
                                                <SelectItem value="50">
                                                    50 baris
                                                </SelectItem>
                                                <SelectItem value="100">
                                                    100 baris
                                                </SelectItem>
                                                <SelectItem value="all">
                                                    Semua
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <input
                                            type="hidden"
                                            name="per_page"
                                            value={perPageValue}
                                        />
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                {/* Bulk actions */}
                {selectedIds.size > 0 && (
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
                        <span className="text-sm font-medium">
                            {selectedIds.size} paklaring dipilih
                        </span>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setBulkDeleteOpen(true)}
                        >
                            <Trash2 />
                            Hapus Terpilih
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIds(new Set())}
                        >
                            <X />
                            Batalkan pilihan
                        </Button>
                    </div>
                )}

                {/* Table */}
                <Card className="py-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-px">
                                    <Checkbox
                                        checked={
                                            allOnPageSelected
                                                ? true
                                                : someOnPageSelected
                                                  ? 'indeterminate'
                                                  : false
                                        }
                                        onCheckedChange={(checked) =>
                                            toggleAllOnPage(checked === true)
                                        }
                                        aria-label="Pilih semua paklaring di halaman ini"
                                    />
                                </TableHead>
                                <TableHead>No Surat</TableHead>
                                <TableHead>Karyawan</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Tanggal Surat</TableHead>
                                <TableHead className="w-px" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paklarings.data.map((paklaring) => (
                                <TableRow
                                    key={paklaring.id}
                                    data-state={
                                        selectedIds.has(paklaring.id)
                                            ? 'selected'
                                            : undefined
                                    }
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(
                                                paklaring.id,
                                            )}
                                            onCheckedChange={(checked) =>
                                                toggleOne(
                                                    paklaring.id,
                                                    checked === true,
                                                )
                                            }
                                            aria-label={`Pilih paklaring ${paklaring.no_surat}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        <Link
                                            href={show(paklaring)}
                                            className="hover:underline"
                                        >
                                            {paklaring.no_surat}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                                                    {getInitials(
                                                        paklaring.nama,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="whitespace-nowrap">
                                                <p className="font-medium">
                                                    {paklaring.nama}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {paklaring.nrpp}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {paklaring.site?.name ?? '-'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {paklaring.signing_tanggal.slice(
                                            0,
                                            10,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                >
                                                    <MoreHorizontal />
                                                    <span className="sr-only">
                                                        Aksi
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={show(paklaring)}
                                                    >
                                                        <Eye />
                                                        Lihat
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={edit(paklaring)}
                                                    >
                                                        <Pencil />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <a
                                                        href={
                                                            pdf(paklaring).url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <Download />
                                                        Unduh PDF
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={(event) => {
                                                        event.preventDefault();
                                                        setDeleteTarget(
                                                            paklaring,
                                                        );
                                                    }}
                                                >
                                                    <Trash2 />
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {paklarings.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="size-8 text-muted-foreground/50" />
                                            <p>Belum ada paklaring.</p>
                                            {(filters.search ||
                                                filters.site_id) && (
                                                <p className="text-xs">
                                                    Coba ubah kata kunci atau
                                                    filter site.
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {paklarings.last_page > 1 && (
                    <Pagination>
                        <PaginationContent>
                            {paklarings.links.map((link, i) => {
                                if (link.label === '...') {
                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }

                                if (/previous/i.test(link.label)) {
                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationPrevious
                                                href={link.url}
                                            />
                                        </PaginationItem>
                                    );
                                }

                                if (/next/i.test(link.label)) {
                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationNext href={link.url} />
                                        </PaginationItem>
                                    );
                                }

                                return (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            href={link.url}
                                            isActive={link.active}
                                        >
                                            {decodeLabel(link.label)}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    {deleteTarget && (
                        <>
                            <DialogTitle>
                                Hapus paklaring {deleteTarget.no_surat}?
                            </DialogTitle>
                            <DialogDescription>
                                Tindakan ini tidak bisa dibatalkan. PDF dan
                                link verifikasi untuk paklaring ini akan
                                dihapus permanen.
                            </DialogDescription>
                            <Form
                                {...destroy.form(deleteTarget)}
                                onSuccess={() => setDeleteTarget(null)}
                            >
                                {({ processing }) => (
                                    <DialogFooter className="gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() =>
                                                setDeleteTarget(null)
                                            }
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Hapus
                                        </Button>
                                    </DialogFooter>
                                )}
                            </Form>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogContent>
                    <DialogTitle>
                        Hapus {selectedIds.size} paklaring?
                    </DialogTitle>
                    <DialogDescription>
                        Tindakan ini tidak bisa dibatalkan. PDF dan link
                        verifikasi untuk paklaring-paklaring ini akan dihapus
                        permanen.
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setBulkDeleteOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={bulkProcessing}
                            onClick={handleBulkDelete}
                        >
                            {bulkProcessing && <Spinner />}
                            Hapus {selectedIds.size} Paklaring
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Paklaring', href: index() }],
};
