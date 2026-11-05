import { Head, Link, router, usePage } from '@inertiajs/react';
import { CircleAlert, FileSpreadsheet, Upload } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { Site } from '@/types';

type PreviewRow = {
    row: number;
    nrpp: string | null;
    nama: string | null;
    site: string | null;
    doh: string | null;
    status: 'new' | 'update' | 'skip';
    message: string | null;
};

type ImportPreview = {
    file_name: string;
    counts: { new: number; update: number; skip: number };
    rows: PreviewRow[];
    truncated: boolean;
};

type ImportResult = { created: number; updated: number; skipped: string[] };

const STEPS = ['Unggah file', 'Pratinjau', 'Hasil'];
const card = 'rounded-lg bg-card shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]';
const nf = new Intl.NumberFormat('id-ID');
const dateShort = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});
const fmt = (v: string | null) =>
    v ? dateShort.format(new Date(`${v.slice(0, 10)}T00:00:00`)) : '–';

const STATUS_LABEL: Record<PreviewRow['status'], string> = {
    new: 'Valid, baru',
    update: 'Valid, diperbarui',
    skip: 'Dilewati',
};

const GRID =
    'grid grid-cols-[64px_110px_minmax(150px,1.2fr)_minmax(110px,0.8fr)_110px_minmax(200px,1.4fr)] items-center gap-3 px-4';

export default function Import({ sites }: { sites: Site[] }) {
    const page = usePage();
    const flash = page.flash as
        | { importPreview?: ImportPreview; importResult?: ImportResult }
        | undefined;
    const preview = flash?.importPreview;
    const result = flash?.importResult;

    const [file, setFile] = useState<File | null>(null);
    const [siteId, setSiteId] = useState('');
    const [onlyErrors, setOnlyErrors] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [restarted, setRestarted] = useState(false);

    const step = result && !restarted ? 2 : preview && !restarted ? 1 : 0;

    // A single site (Site Admin) is always the fallback; the Super Admin
    // may pick one or leave it empty and rely on the file's "site" column.
    const effectiveSiteId = sites.length === 1 ? String(sites[0].id) : siteId;

    function send(url: string, chosen: File) {
        setProcessing(true);
        setErrors({});
        setRestarted(false);

        router.post(
            url,
            { file: chosen, site_id: effectiveSiteId || undefined },
            {
                forceFormData: true,
                preserveState: true,
                preserveScroll: true,
                onError: (e) => setErrors(e),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function choose(chosen: File | null | undefined) {
        if (!chosen) {
            return;
        }

        setFile(chosen);
        send(EmployeeController.importPreview.url(), chosen);
    }

    function onDrop(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setDragging(false);
        choose(event.dataTransfer.files?.[0]);
    }

    const validCount = preview ? preview.counts.new + preview.counts.update : 0;
    const rows = preview
        ? onlyErrors
            ? preview.rows.filter((r) => r.status === 'skip')
            : preview.rows
        : [];
    const firstError = Object.values(errors)[0];

    const resultTiles: [string, number, string][] = result
        ? [
              ['Karyawan baru', result.created, 'text-success'],
              ['Diperbarui', result.updated, 'text-info'],
              [
                  'Dilewati karena error',
                  result.skipped.length,
                  'text-destructive',
              ],
          ]
        : [];

    return (
        <>
            <Head title="Import Karyawan" />

            <div className="flex flex-col gap-4 md:gap-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl leading-[1.15] font-extrabold tracking-[-0.025em] md:text-[30px]">
                        Import Karyawan
                    </h1>
                    <div className="text-sm text-muted-foreground">
                        Tambah atau perbarui data karyawan sekaligus dari file
                        Excel.
                    </div>
                </div>

                <ol aria-label="Tahapan" className="grid grid-cols-3 gap-1.5">
                    {STEPS.map((name, i) => (
                        <li
                            key={name}
                            aria-current={i === step ? 'step' : undefined}
                            className={cn(
                                'flex flex-col gap-1.5 text-xs',
                                i === step ? 'font-bold' : 'font-medium',
                                i <= step
                                    ? 'text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    'h-1.5 rounded-full',
                                    i < step
                                        ? 'bg-primary'
                                        : i === step
                                          ? 'bg-accent'
                                          : 'bg-border',
                                )}
                            />
                            {name}
                        </li>
                    ))}
                </ol>

                {firstError && (
                    <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-md bg-destructive-soft px-4 py-3 text-sm font-medium text-destructive"
                    >
                        <CircleAlert
                            className="mt-0.5 size-[18px] shrink-0"
                            strokeWidth={1.8}
                            aria-hidden
                        />
                        {firstError}
                    </div>
                )}

                {step === 0 && (
                    <>
                        <section
                            className={cn(
                                card,
                                'flex flex-wrap items-center gap-4 p-4 md:p-5',
                            )}
                        >
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                                <FileSpreadsheet
                                    className="size-6"
                                    strokeWidth={1.8}
                                    aria-hidden
                                />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col">
                                <span className="text-[15px] font-bold">
                                    Template Excel
                                </span>
                                <span className="text-[13px] text-muted-foreground">
                                    Gunakan template ini agar kolom terbaca
                                    dengan benar. Baris dengan NRPP yang sudah
                                    ada akan diperbarui.
                                </span>
                            </span>
                            <Button variant="outline" asChild>
                                <a href={EmployeeController.template.url()}>
                                    Unduh template
                                </a>
                            </Button>
                        </section>

                        {sites.length > 1 && (
                            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                                Site cadangan
                                <select
                                    value={siteId}
                                    onChange={(e) => setSiteId(e.target.value)}
                                    className="h-[50px] w-full rounded-md border-2 border-transparent bg-input px-4 text-[15px] font-normal outline-none focus-visible:border-foreground md:max-w-sm dark:focus-visible:border-accent"
                                >
                                    <option value="">
                                        Ikuti kolom "site" di file
                                    </option>
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.code})
                                        </option>
                                    ))}
                                </select>
                                <span className="text-xs font-normal text-muted-foreground">
                                    Dipakai untuk baris yang kolom site-nya
                                    kosong.
                                </span>
                            </label>
                        )}

                        <label
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={onDrop}
                            className={cn(
                                'flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                dragging
                                    ? 'border-foreground bg-accent-soft'
                                    : 'border-border bg-card hover:bg-muted/50',
                            )}
                        >
                            <input
                                type="file"
                                name="file"
                                accept=".xlsx,.xls"
                                className="sr-only"
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    choose(e.target.files?.[0])
                                }
                            />
                            <span className="flex size-14 items-center justify-center rounded-full bg-muted">
                                {processing ? (
                                    <Spinner className="size-6" />
                                ) : (
                                    <Upload
                                        className="size-6"
                                        strokeWidth={1.8}
                                        aria-hidden
                                    />
                                )}
                            </span>
                            <span className="text-base font-bold">
                                {processing
                                    ? 'Membaca file…'
                                    : 'Tarik file ke sini atau klik untuk memilih'}
                            </span>
                            <span className="text-[13px] text-muted-foreground">
                                Format .xlsx atau .xls, maks. 10 MB
                            </span>
                        </label>
                    </>
                )}

                {step === 1 && preview && (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
                                <span className="truncate">
                                    {preview.file_name}
                                </span>
                                <span className="rounded-full bg-success-soft px-2.5 py-1 font-bold text-success">
                                    {nf.format(validCount)} valid
                                </span>
                                <span className="rounded-full bg-destructive-soft px-2.5 py-1 font-bold text-destructive">
                                    {nf.format(preview.counts.skip)} error
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                aria-pressed={onlyErrors}
                                onClick={() => setOnlyErrors((v) => !v)}
                                disabled={preview.counts.skip === 0}
                            >
                                {onlyErrors
                                    ? 'Tampilkan semua baris'
                                    : 'Hanya baris error'}
                            </Button>
                        </div>

                        <section className={cn(card, 'overflow-hidden')}>
                            <div className="overflow-x-auto">
                                <div
                                    role="table"
                                    aria-label="Pratinjau import"
                                    className="min-w-[760px]"
                                >
                                    <div
                                        role="row"
                                        className={cn(
                                            GRID,
                                            'bg-muted py-2.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase',
                                        )}
                                    >
                                        <span role="columnheader">Baris</span>
                                        <span role="columnheader">NRPP</span>
                                        <span role="columnheader">Nama</span>
                                        <span role="columnheader">Site</span>
                                        <span role="columnheader">DOH</span>
                                        <span role="columnheader">Status</span>
                                    </div>
                                    {rows.map((r) => {
                                        const bad = r.status === 'skip';

                                        return (
                                            <div
                                                key={r.row}
                                                role="row"
                                                className={cn(
                                                    GRID,
                                                    'border-t border-border py-2.5 text-[13px]',
                                                    bad && 'bg-destructive-soft',
                                                )}
                                            >
                                                <span
                                                    role="cell"
                                                    className="tabular text-muted-foreground"
                                                >
                                                    {r.row}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="tabular font-semibold"
                                                >
                                                    {r.nrpp ?? '–'}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="truncate font-semibold"
                                                >
                                                    {r.nama ?? '–'}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="truncate"
                                                >
                                                    {r.site ?? '–'}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="tabular"
                                                >
                                                    {fmt(r.doh)}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className={cn(
                                                        'font-semibold',
                                                        bad
                                                            ? 'text-destructive'
                                                            : 'text-success',
                                                    )}
                                                >
                                                    {bad
                                                        ? r.message
                                                        : STATUS_LABEL[r.status]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {preview.truncated && (
                                <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                                    Hanya sebagian baris ditampilkan. Jumlah di
                                    atas mencakup seluruh file.
                                </p>
                            )}
                        </section>

                        {!file && (
                            <p
                                role="alert"
                                className="text-sm font-semibold text-warning"
                            >
                                File perlu dipilih ulang sebelum diimport.
                            </p>
                        )}

                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setRestarted(true)}
                            >
                                Ganti file
                            </Button>
                            <Button
                                variant="accent"
                                className="font-bold"
                                disabled={!file || validCount === 0}
                                loading={processing}
                                onClick={() =>
                                    file &&
                                    send(EmployeeController.import.url(), file)
                                }
                            >
                                Import {nf.format(validCount)} baris valid
                            </Button>
                        </div>
                    </>
                )}

                {step === 2 && result && (
                    <>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {resultTiles.map(([label, value, color]) => (
                                <div
                                    key={label}
                                    className={cn(card, 'flex flex-col gap-1.5 p-5')}
                                >
                                    <div
                                        className={cn(
                                            'text-[13px] font-semibold',
                                            color,
                                        )}
                                    >
                                        {label}
                                    </div>
                                    <div className="tabular text-[32px] leading-[1.15] font-extrabold tracking-[-0.025em]">
                                        {nf.format(value)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {result.skipped.length > 0 && (
                            <section className={cn(card, 'overflow-hidden')}>
                                <h2 className="px-5 pt-4 pb-3 text-base font-bold">
                                    Baris yang dilewati
                                </h2>
                                {result.skipped.map((message) => (
                                    <div
                                        key={message}
                                        className="border-t border-border px-5 py-3 text-[13px] text-destructive"
                                    >
                                        {message}
                                    </div>
                                ))}
                            </section>
                        )}

                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFile(null);
                                    setRestarted(true);
                                }}
                            >
                                Import file lain
                            </Button>
                            <Button asChild>
                                <Link href={EmployeeController.index()}>
                                    Lihat Daftar Karyawan
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

Import.layout = {
    breadcrumbs: [
        { title: 'Daftar Karyawan', href: EmployeeController.index() },
        { title: 'Import Karyawan', href: EmployeeController.importForm() },
    ],
};
