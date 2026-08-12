import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    FileDown,
    FileUp,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
    Users,
    UserX,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import type { Auth, Employee, PaginatedData, Site } from '@/types';

function decodeLabel(label: string): string {
    return label
        .replace(/&laquo;\s*/i, '')
        .replace(/\s*&raquo;/i, '')
        .trim();
}

export default function Index({
    employees,
    sites,
    filters,
    stats,
    perPage,
}: {
    employees: PaginatedData<Employee>;
    sites: Site[];
    filters: { search?: string; site_id?: string };
    stats: { active: number; inactive: number };
    perPage: string;
}) {
    const {
        props: { auth },
    } = usePage<{ auth: Auth }>();
    const getInitials = useInitials();

    const [siteFilter, setSiteFilter] = useState(filters.site_id ?? 'all');
    const [perPageValue, setPerPageValue] = useState(perPage);
    const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    // Any navigation (pagination, filtering, a delete) loads a new page of
    // results, so a stale selection should not carry over across it.
    useEffect(() => router.on('success', () => setSelectedIds(new Set())), []);

    const pageIds = employees.data.map((employee) => employee.id);
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
            EmployeeController.index.url({
                query: { ...filters, per_page: value },
            }),
            {},
            { preserveState: true, preserveScroll: true },
        );
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

    return (
        <>
            <Head title="Data Karyawan" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        title="Data Karyawan"
                        description="Data ini dipakai untuk auto-fill saat membuat paklaring lewat NRPP."
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <a
                                href={EmployeeController.export.url({
                                    query: filters,
                                })}
                            >
                                <FileDown />
                                Export Excel
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={EmployeeController.importForm()}>
                                <FileUp />
                                Import Excel
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={EmployeeController.create()}>
                                <Plus />
                                Tambah Karyawan
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold tabular-nums">
                                    {employees.total}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total karyawan
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                <UserCheck className="size-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold tabular-nums">
                                    {stats.active}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Masih aktif
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <UserX className="size-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold tabular-nums">
                                    {stats.inactive}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Nonaktif
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent>
                        <Form
                            {...EmployeeController.index.form()}
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
                                                placeholder="Nama atau NRPP"
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
                            {selectedIds.size} karyawan dipilih
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
                                        aria-label="Pilih semua karyawan di halaman ini"
                                    />
                                </TableHead>
                                <TableHead>Karyawan</TableHead>
                                <TableHead>NRPP</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Classification</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-px" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.data.map((employee) => (
                                <TableRow
                                    key={employee.id}
                                    data-state={
                                        selectedIds.has(employee.id)
                                            ? 'selected'
                                            : undefined
                                    }
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(
                                                employee.id,
                                            )}
                                            onCheckedChange={(checked) =>
                                                toggleOne(
                                                    employee.id,
                                                    checked === true,
                                                )
                                            }
                                            aria-label={`Pilih ${employee.nama}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                                                    {getInitials(
                                                        employee.nama,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium whitespace-nowrap">
                                                {employee.nama}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {employee.nrpp}
                                    </TableCell>
                                    <TableCell>
                                        {employee.site?.name ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        {employee.classification ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        {employee.is_active ? (
                                            <Badge className="border-transparent bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                                Aktif
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                Nonaktif
                                            </Badge>
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
                                                        href={EmployeeController.edit(
                                                            employee,
                                                        )}
                                                    >
                                                        <Pencil />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={(event) => {
                                                        event.preventDefault();
                                                        setDeleteTarget(
                                                            employee,
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

                            {employees.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="size-8 text-muted-foreground/50" />
                                            <p>Belum ada data karyawan.</p>
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

                {employees.last_page > 1 && (
                    <Pagination>
                        <PaginationContent>
                            {employees.links.map((link, i) => {
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
                                Hapus data {deleteTarget.nama}?
                            </DialogTitle>
                            <DialogDescription>
                                Data paklaring yang sudah pernah dibuat untuk
                                karyawan ini tidak akan terpengaruh.
                            </DialogDescription>
                            <Form
                                {...EmployeeController.destroy.form(
                                    deleteTarget,
                                )}
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
                        Hapus {selectedIds.size} data karyawan?
                    </DialogTitle>
                    <DialogDescription>
                        Data paklaring yang sudah pernah dibuat untuk
                        karyawan-karyawan ini tidak akan terpengaruh.
                        Tindakan ini tidak bisa dibatalkan.
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
                            Hapus {selectedIds.size} Karyawan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Data Karyawan', href: EmployeeController.index() }],
};
