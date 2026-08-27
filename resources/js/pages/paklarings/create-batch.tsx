import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CircleAlert,
    Search,
    TriangleAlert,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { batchStore, index } from '@/routes/paklarings';
import type { Employee, Site } from '@/types';

type SharedFields = {
    alasan_phk: string;
    doe: string;
    remarks: string;
    signing_lokasi: string;
    signing_tanggal: string;
};

export default function CreateBatch({
    employees,
    sites,
    alasanPhkOptions,
}: {
    employees: Employee[];
    sites: Site[];
    alasanPhkOptions: string[];
}) {
    const getInitials = useInitials();

    const [search, setSearch] = useState('');
    const [siteFilter, setSiteFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [noSurats, setNoSurats] = useState<Record<number, string>>({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [fields, setFields] = useState<SharedFields>({
        alasan_phk: '',
        doe: '',
        remarks: '',
        signing_lokasi: '',
        signing_tanggal: new Date().toISOString().slice(0, 10),
    });

    function updateField<K extends keyof SharedFields>(
        field: K,
        value: SharedFields[K],
    ) {
        setFields((prev) => ({ ...prev, [field]: value }));
    }

    const filteredEmployees = useMemo(() => {
        const term = search.trim().toLowerCase();

        return employees.filter((employee) => {
            const matchesSearch =
                !term ||
                employee.nama.toLowerCase().includes(term) ||
                employee.nrpp.toLowerCase().includes(term);
            const matchesSite =
                siteFilter === 'all' || String(employee.site_id) === siteFilter;

            return matchesSearch && matchesSite;
        });
    }, [employees, search, siteFilter]);

    const selectableIds = filteredEmployees
        .filter((employee) => employee.is_complete_for_paklaring)
        .map((employee) => employee.id);
    const selectedOnPageCount = selectableIds.filter((id) =>
        selectedIds.has(id),
    ).length;
    const allSelectableSelected =
        selectableIds.length > 0 &&
        selectedOnPageCount === selectableIds.length;
    const someSelectableSelected =
        selectedOnPageCount > 0 && !allSelectableSelected;

    function toggleAll(checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            selectableIds.forEach((id) => {
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

    function updateNoSurat(id: number, value: string) {
        setNoSurats((prev) => ({ ...prev, [id]: value }));
    }

    const selectedEmployees = employees.filter((employee) =>
        selectedIds.has(employee.id),
    );

    const sharedFieldsComplete =
        fields.alasan_phk.trim() !== '' &&
        fields.doe.trim() !== '' &&
        fields.signing_lokasi.trim() !== '' &&
        fields.signing_tanggal.trim() !== '';

    const allNoSuratsFilled = Array.from(selectedIds).every(
        (id) => (noSurats[id] ?? '').trim() !== '',
    );

    const canSubmit =
        selectedIds.size > 0 && sharedFieldsComplete && allNoSuratsFilled;

    function handleSubmit() {
        setProcessing(true);
        setErrors({});

        const selectedNoSurats = Object.fromEntries(
            Array.from(selectedIds).map((id) => [id, noSurats[id] ?? '']),
        );

        router.post(
            batchStore().url,
            {
                employee_ids: Array.from(selectedIds),
                no_surats: selectedNoSurats,
                ...fields,
            },
            {
                onSuccess: () => {
                    setConfirmOpen(false);
                    setSelectedIds(new Set());
                    setNoSurats({});
                },
                onError: (responseErrors) => {
                    setErrors(responseErrors);
                    setConfirmOpen(false);
                    toast.error(
                        'Ada isian yang perlu diperbaiki sebelum melanjutkan.',
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Buat Paklaring Massal" />

            <div className="space-y-6 p-4 pb-24">
                <Link
                    href={index()}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Paklaring
                </Link>

                <Heading
                    title="Buat Paklaring Massal"
                    description="Pilih beberapa karyawan sekaligus, isi data yang sama untuk semuanya (alasan PHK, tanggal, tanda tangan), lalu buat semua paklaring dalam satu langkah."
                />

                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertTitle>Ada isian yang perlu diperbaiki</AlertTitle>
                        <AlertDescription>
                            Periksa kembali kolom yang ditandai merah di bawah.
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="size-4 text-muted-foreground" />
                            1. Pilih Karyawan
                        </CardTitle>
                        <CardDescription>
                            Hanya karyawan aktif dengan data lengkap yang bisa
                            dipilih.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="grid gap-1.5">
                                <label
                                    htmlFor="employee-search"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Cari
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="employee-search"
                                        placeholder="Nama atau NRPP"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        className="w-64 pl-8"
                                    />
                                </div>
                            </div>

                            {sites.length > 0 && (
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Site
                                    </Label>
                                    <Select
                                        value={siteFilter}
                                        onValueChange={setSiteFilter}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Semua site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua site
                                            </SelectItem>
                                            {sites.map((site) => (
                                                <SelectItem
                                                    key={site.id}
                                                    value={String(site.id)}
                                                >
                                                    {site.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {selectedIds.size > 0 && (
                                <Badge variant="secondary" className="mb-0.5">
                                    {selectedIds.size} karyawan dipilih
                                </Badge>
                            )}
                        </div>

                        <div className="overflow-hidden rounded-xl border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-px">
                                            <Checkbox
                                                checked={
                                                    allSelectableSelected
                                                        ? true
                                                        : someSelectableSelected
                                                          ? 'indeterminate'
                                                          : false
                                                }
                                                onCheckedChange={(checked) =>
                                                    toggleAll(checked === true)
                                                }
                                                aria-label="Pilih semua karyawan yang bisa dipilih"
                                            />
                                        </TableHead>
                                        <TableHead>Karyawan</TableHead>
                                        <TableHead>Site</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Status Data</TableHead>
                                        <TableHead>Nomor Surat</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.map((employee) => (
                                        <TableRow
                                            key={employee.id}
                                            data-state={
                                                selectedIds.has(employee.id)
                                                    ? 'selected'
                                                    : undefined
                                            }
                                            className={
                                                !employee.is_complete_for_paklaring
                                                    ? 'opacity-60'
                                                    : undefined
                                            }
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.has(
                                                        employee.id,
                                                    )}
                                                    disabled={
                                                        !employee.is_complete_for_paklaring
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
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
                                                    <div className="whitespace-nowrap">
                                                        <p className="font-medium">
                                                            {employee.nama}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {employee.nrpp}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {employee.site?.name ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {employee.project ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {employee.is_complete_for_paklaring ? (
                                                    <Badge className="border-transparent bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                                        Lengkap
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1 text-amber-700 dark:text-amber-400"
                                                    >
                                                        <TriangleAlert className="size-3" />
                                                        Data belum lengkap
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={
                                                        noSurats[employee.id] ??
                                                        ''
                                                    }
                                                    onChange={(event) =>
                                                        updateNoSurat(
                                                            employee.id,
                                                            event.target.value,
                                                        )
                                                    }
                                                    disabled={
                                                        !selectedIds.has(
                                                            employee.id,
                                                        )
                                                    }
                                                    placeholder="No. surat"
                                                    className="w-48"
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `no_surats.${employee.id}`
                                                        ]
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {filteredEmployees.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                Tidak ada karyawan yang cocok.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <InputError message={errors.employee_ids} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            2. Data yang Sama untuk Semua
                        </CardTitle>
                        <CardDescription>
                            Data pribadi & project setiap karyawan otomatis
                            diambil dari Data Karyawan — kamu hanya perlu isi
                            bagian pemberhentian di bawah ini sekali saja.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="alasan_phk">
                                Alasan PHK
                                <span className="ml-0.5 text-destructive">
                                    *
                                </span>
                            </Label>
                            <Select
                                value={fields.alasan_phk}
                                onValueChange={(value) =>
                                    updateField('alasan_phk', value)
                                }
                            >
                                <SelectTrigger
                                    id="alasan_phk"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih alasan…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {alasanPhkOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.alasan_phk} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="doe">
                                DOE (Date of End)
                                <span className="ml-0.5 text-destructive">
                                    *
                                </span>
                            </Label>
                            <Input
                                id="doe"
                                type="date"
                                value={fields.doe}
                                onChange={(event) =>
                                    updateField('doe', event.target.value)
                                }
                            />
                            <InputError message={errors.doe} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="signing_lokasi">
                                Lokasi Tanda Tangan
                                <span className="ml-0.5 text-destructive">
                                    *
                                </span>
                            </Label>
                            <Input
                                id="signing_lokasi"
                                value={fields.signing_lokasi}
                                onChange={(event) =>
                                    updateField(
                                        'signing_lokasi',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={errors.signing_lokasi} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="signing_tanggal">
                                Tanggal Surat
                                <span className="ml-0.5 text-destructive">
                                    *
                                </span>
                            </Label>
                            <Input
                                id="signing_tanggal"
                                type="date"
                                value={fields.signing_tanggal}
                                onChange={(event) =>
                                    updateField(
                                        'signing_tanggal',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={errors.signing_tanggal} />
                        </div>

                        <div className="col-span-full grid gap-2">
                            <Label htmlFor="remarks">
                                Remarks / Keterangan
                                <span className="ml-1 font-normal text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <Textarea
                                id="remarks"
                                value={fields.remarks}
                                onChange={(event) =>
                                    updateField('remarks', event.target.value)
                                }
                            />
                            <InputError message={errors.remarks} />
                        </div>
                    </CardContent>
                </Card>

                <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80">
                    <p className="px-2 text-sm text-muted-foreground">
                        {selectedIds.size > 0
                            ? `${selectedIds.size} paklaring akan dibuat.`
                            : 'Pilih minimal satu karyawan.'}
                    </p>
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="ghost" asChild>
                            <Link href={index()}>Batal</Link>
                        </Button>
                        <Button
                            type="button"
                            disabled={!canSubmit}
                            onClick={() => setConfirmOpen(true)}
                        >
                            Buat {selectedIds.size || ''} Paklaring
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogTitle>
                        Buat {selectedEmployees.length} paklaring sekaligus?
                    </DialogTitle>
                    <DialogDescription>
                        Setiap karyawan berikut akan mendapat satu surat
                        paklaring dengan alasan &quot;{fields.alasan_phk}
                        &quot;, ditandatangani di {
                            fields.signing_lokasi
                        } pada {fields.signing_tanggal}. Status aktif mereka di
                        Data Karyawan juga akan otomatis dinonaktifkan.
                    </DialogDescription>

                    <ul className="max-h-48 list-disc space-y-1 overflow-y-auto rounded-lg border bg-muted/30 p-4 pl-8 text-sm">
                        {selectedEmployees.map((employee) => (
                            <li key={employee.id}>
                                {employee.nama}{' '}
                                <span className="text-muted-foreground">
                                    ({employee.nrpp}) —{' '}
                                    {noSurats[employee.id] || '-'}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setConfirmOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button disabled={processing} onClick={handleSubmit}>
                            {processing && <Spinner />}
                            Konfirmasi & Buat
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

CreateBatch.layout = {
    breadcrumbs: [
        { title: 'Paklaring', href: index() },
        { title: 'Buat Massal', href: index() },
    ],
};
