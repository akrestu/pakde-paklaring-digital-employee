import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CircleAlert,
    CircleCheck,
    CircleX,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Field } from '@/components/paklaring-form-fields';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { edit as editEmployee } from '@/routes/employees';
import { batchStore, createBatch, index, show } from '@/routes/paklarings';
import type { Employee, Site } from '@/types';

type BatchResult = {
    created: { id: number; no_surat: string; nama: string; nrpp: string }[];
    skipped: { id: number; nama: string; nrpp: string; reason: string }[];
};

type SharedFields = {
    alasan_phk: string;
    doe: string;
    remarks: string;
    signing_lokasi: string;
    signing_tanggal: string;
};

type BatchEmployee = Employee & {
    site?: Pick<Site, 'id' | 'name'> & { default_location?: string | null };
};

const STEP_NAMES = ['Pilih karyawan', 'Isi data', 'Review', 'Hasil'];

const card = 'rounded-lg bg-card shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]';
const dateLong = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const fmt = (v: string) =>
    v ? dateLong.format(new Date(`${v}T00:00:00`)) : '–';

const PICK_GRID =
    'grid grid-cols-[44px_minmax(160px,1.4fr)_110px_minmax(120px,1fr)_130px] items-center gap-2 px-3';
const REVIEW_GRID =
    'grid grid-cols-[minmax(150px,1.2fr)_110px_minmax(220px,1.4fr)_minmax(150px,1fr)] items-center gap-3 px-4';

function CompletenessBadge({ complete }: { complete: boolean }) {
    return (
        <span
            className={cn(
                'inline-block rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                complete
                    ? 'bg-success-soft text-success'
                    : 'bg-warning-soft text-warning',
            )}
        >
            {complete ? 'Lengkap' : 'Belum lengkap'}
        </span>
    );
}

function ResultScreen({ result }: { result: BatchResult }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
                <div className={cn(card, 'flex flex-col gap-1.5 p-5')}>
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-success">
                        <CircleCheck
                            className="size-[18px]"
                            strokeWidth={1.8}
                            aria-hidden
                        />
                        Berhasil
                    </div>
                    <div className="tabular text-[32px] leading-[1.15] font-extrabold tracking-[-0.025em]">
                        {result.created.length}
                    </div>
                </div>
                <div className={cn(card, 'flex flex-col gap-1.5 p-5')}>
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-destructive">
                        <CircleX
                            className="size-[18px]"
                            strokeWidth={1.8}
                            aria-hidden
                        />
                        Dilewati
                    </div>
                    <div className="tabular text-[32px] leading-[1.15] font-extrabold tracking-[-0.025em]">
                        {result.skipped.length}
                    </div>
                </div>
            </div>

            {result.skipped.length > 0 && (
                <section className={cn(card, 'overflow-hidden')}>
                    <h2 className="px-5 pt-4 pb-3 text-base font-bold">
                        Perlu diperbaiki
                    </h2>
                    {result.skipped.map((s) => (
                        <div
                            key={s.id}
                            className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3"
                        >
                            <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="tabular text-sm font-bold">
                                    {s.nama} · NRPP {s.nrpp}
                                </span>
                                <span className="text-[13px] text-destructive">
                                    {s.reason}
                                </span>
                            </span>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={editEmployee(s.id)}>
                                    Lengkapi data
                                </Link>
                            </Button>
                        </div>
                    ))}
                </section>
            )}

            {result.created.length > 0 && (
                <section className={cn(card, 'overflow-hidden')}>
                    <h2 className="px-5 pt-4 pb-3 text-base font-bold">
                        Paklaring dibuat
                    </h2>
                    {result.created.map((c) => (
                        <Link
                            key={c.id}
                            href={show(c.id)}
                            className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 outline-none hover:bg-muted/50 focus-visible:bg-muted"
                        >
                            <span className="truncate text-sm font-semibold">
                                {c.nama}
                            </span>
                            <span className="tabular text-[13px] text-muted-foreground">
                                {c.no_surat}
                            </span>
                        </Link>
                    ))}
                </section>
            )}

            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href={createBatch()}>Buat batch lagi</Link>
                </Button>
                <Button asChild>
                    <Link href={index()}>Lihat Daftar Paklaring</Link>
                </Button>
            </div>
        </div>
    );
}

export default function CreateBatch({
    employees,
    sites,
    alasanPhkOptions,
}: {
    employees: BatchEmployee[];
    sites: Pick<Site, 'id' | 'name'>[];
    alasanPhkOptions: string[];
}) {
    const page = usePage();
    const flashResult = (
        page.flash as { batchResult?: BatchResult } | undefined
    )?.batchResult;

    const [stepState, setStep] = useState(0);
    // The result screen comes straight from the batchStore flash; it is
    // shown for that one response and gone on the next visit.
    const result = flashResult ?? null;
    const step = result ? 3 : stepState;
    const [search, setSearch] = useState('');
    const [siteFilter, setSiteFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [noSurats, setNoSurats] = useState<Record<number, string>>({});
    const [processing, setProcessing] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [fields, setFields] = useState<SharedFields>({
        alasan_phk: '',
        doe: '',
        remarks: '',
        signing_lokasi: '',
        signing_tanggal: new Date().toISOString().slice(0, 10),
    });

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return employees.filter(
            (e) =>
                (!term ||
                    e.nama.toLowerCase().includes(term) ||
                    e.nrpp.toLowerCase().includes(term)) &&
                (!siteFilter || String(e.site_id) === siteFilter),
        );
    }, [employees, search, siteFilter]);

    const filteredIds = filtered.map((e) => e.id);
    const selectedOnView = filteredIds.filter((id) =>
        selectedIds.has(id),
    ).length;
    const allOnView =
        filteredIds.length > 0 && selectedOnView === filteredIds.length;

    const selected = employees.filter((e) => selectedIds.has(e.id));
    const ready = selected.filter((e) => e.is_complete_for_paklaring);

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
            filteredIds.forEach((id) =>
                checked ? next.add(id) : next.delete(id),
            );

            return next;
        });
    }

    function setField<K extends keyof SharedFields>(key: K, value: string) {
        setFields((f) => ({ ...f, [key]: value }));
    }

    const sharedComplete =
        fields.alasan_phk !== '' &&
        fields.doe !== '' &&
        fields.signing_lokasi.trim() !== '' &&
        fields.signing_tanggal !== '';
    const numbersComplete = ready.every(
        (e) => (noSurats[e.id] ?? '').trim() !== '',
    );

    const canContinue =
        step === 0
            ? selected.length > 0
            : step === 1
              ? sharedComplete
              : ready.length > 0 && numbersComplete;

    function submit() {
        setProcessing(true);
        setErrors({});

        router.post(
            batchStore().url,
            {
                employee_ids: selected.map((e) => e.id),
                // Only complete employees get a number; incomplete ones are
                // sent without one and the server skips them with a reason.
                no_surats: Object.fromEntries(
                    ready.map((e) => [e.id, (noSurats[e.id] ?? '').trim()]),
                ),
                ...fields,
            },
            {
                onSuccess: () => {
                    setSelectedIds(new Set());
                    setNoSurats({});
                },
                onError: (responseErrors) => {
                    setErrors(responseErrors);
                    const firstKey = Object.keys(responseErrors)[0] ?? '';
                    setStep(firstKey.startsWith('no_surats') ? 2 : 1);
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    function next() {
        if (!canContinue) {
            setAttempted(true);

            return;
        }

        setAttempted(false);

        if (step === 0 && !fields.signing_lokasi) {
            const lokasi = selected.find((e) => e.site?.default_location)?.site
                ?.default_location;

            if (lokasi) {
                setField('signing_lokasi', lokasi);
            }
        }

        if (step === 2) {
            submit();

            return;
        }

        setStep((s) => s + 1);
    }

    const subtitle =
        step === 3
            ? 'Proses selesai'
            : `Langkah ${step + 1} dari 3 · ${STEP_NAMES[step]}${step > 0 ? ` · ${selected.length} karyawan` : ''}`;

    const firstError = Object.values(errors)[0];

    return (
        <>
            <Head title="Buat Paklaring Batch" />

            <div className="flex flex-col gap-4 md:gap-5">
                <div className="flex items-center gap-3">
                    <Link
                        href={index()}
                        aria-label="Kembali ke Daftar Paklaring"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <ArrowLeft
                            className="size-5"
                            strokeWidth={1.8}
                            aria-hidden
                        />
                    </Link>
                    <div className="flex min-w-0 flex-col">
                        <h1 className="truncate text-2xl leading-[1.15] font-extrabold tracking-[-0.025em] md:text-[30px]">
                            Buat Paklaring Batch
                        </h1>
                        <div
                            className="text-[13px] text-muted-foreground"
                            aria-live="polite"
                        >
                            {subtitle}
                        </div>
                    </div>
                </div>

                <ol aria-label="Tahapan" className="grid grid-cols-4 gap-1.5">
                    {STEP_NAMES.map((name, i) => (
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
                            <span className="hidden sm:block">{name}</span>
                        </li>
                    ))}
                </ol>

                {firstError && step < 3 && (
                    <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-md bg-destructive-soft px-4 py-3 text-sm font-medium text-destructive"
                    >
                        <CircleAlert
                            className="mt-0.5 size-[18px] shrink-0"
                            strokeWidth={1.8}
                            aria-hidden
                        />
                        <span>{firstError}</span>
                    </div>
                )}

                {step === 0 && (
                    <>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <label className="relative block flex-1">
                                <span className="sr-only">Cari karyawan</span>
                                <Search
                                    className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground"
                                    strokeWidth={1.8}
                                    aria-hidden
                                />
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari NRPP atau nama"
                                    className="h-11 pl-11"
                                />
                            </label>
                            {sites.length > 0 && (
                                <select
                                    aria-label="Filter site"
                                    value={siteFilter}
                                    onChange={(e) =>
                                        setSiteFilter(e.target.value)
                                    }
                                    className="h-11 rounded-md border-2 border-transparent bg-input px-3 text-sm font-medium outline-none focus-visible:border-foreground sm:w-48 dark:focus-visible:border-accent"
                                >
                                    <option value="">Semua site</option>
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <section className={cn(card, 'overflow-hidden')}>
                            {filtered.length === 0 ? (
                                <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                                    {employees.length === 0
                                        ? 'Belum ada karyawan aktif.'
                                        : 'Tidak ada karyawan yang cocok dengan pencarian.'}
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <div
                                        role="table"
                                        aria-label="Pilih karyawan"
                                        className="min-w-[620px]"
                                    >
                                        <div
                                            role="row"
                                            className={cn(
                                                PICK_GRID,
                                                'bg-muted py-1.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase',
                                            )}
                                        >
                                            <span
                                                role="columnheader"
                                                className="flex size-11 items-center justify-center"
                                            >
                                                <Checkbox
                                                    checked={
                                                        allOnView
                                                            ? true
                                                            : selectedOnView > 0
                                                              ? 'indeterminate'
                                                              : false
                                                    }
                                                    onCheckedChange={(v) =>
                                                        toggleAll(v === true)
                                                    }
                                                    aria-label="Pilih semua"
                                                />
                                            </span>
                                            <span role="columnheader">
                                                Nama
                                            </span>
                                            <span role="columnheader">
                                                NRPP
                                            </span>
                                            <span role="columnheader">
                                                Lokasi
                                            </span>
                                            <span role="columnheader">
                                                Data paklaring
                                            </span>
                                        </div>
                                        {filtered.map((e) => {
                                            const on = selectedIds.has(e.id);

                                            return (
                                                <div
                                                    key={e.id}
                                                    role="row"
                                                    className={cn(
                                                        PICK_GRID,
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
                                                            onCheckedChange={(
                                                                v,
                                                            ) =>
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
                                                        className="truncate text-sm font-semibold"
                                                    >
                                                        {e.nama}
                                                    </span>
                                                    <span
                                                        role="cell"
                                                        className="tabular text-muted-foreground"
                                                    >
                                                        {e.nrpp}
                                                    </span>
                                                    <span
                                                        role="cell"
                                                        className="truncate"
                                                    >
                                                        {e.site?.name ??
                                                            e.lokasi}
                                                    </span>
                                                    <span role="cell">
                                                        <CompletenessBadge
                                                            complete={
                                                                e.is_complete_for_paklaring
                                                            }
                                                        />
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {step === 1 && (
                    <section
                        className={cn(
                            card,
                            'flex flex-col gap-[18px] p-4 md:p-6',
                        )}
                    >
                        <fieldset className="flex flex-col gap-2">
                            <legend className="mb-2 text-[13px] font-semibold">
                                Alasan PHK untuk semua karyawan terpilih
                            </legend>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                {alasanPhkOptions.map((option) => {
                                    const on = fields.alasan_phk === option;

                                    return (
                                        <label
                                            key={option}
                                            className={cn(
                                                'flex min-h-[52px] cursor-pointer items-center gap-2.5 rounded-md px-3.5 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                                on
                                                    ? 'border-2 border-primary bg-accent-soft'
                                                    : 'border border-border bg-card hover:bg-muted',
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="alasan_phk"
                                                value={option}
                                                checked={on}
                                                onChange={() =>
                                                    setField(
                                                        'alasan_phk',
                                                        option,
                                                    )
                                                }
                                                className="size-[18px] accent-[var(--primary)]"
                                            />
                                            {option}
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                            <Field
                                label="DOE (tanggal keluar)"
                                htmlFor="doe"
                                error={errors.doe}
                            >
                                <Input
                                    id="doe"
                                    type="date"
                                    value={fields.doe}
                                    onChange={(e) =>
                                        setField('doe', e.target.value)
                                    }
                                    className="tabular"
                                />
                            </Field>
                            <Field
                                label="Tanggal tanda tangan"
                                htmlFor="signing_tanggal"
                                error={errors.signing_tanggal}
                            >
                                <Input
                                    id="signing_tanggal"
                                    type="date"
                                    value={fields.signing_tanggal}
                                    onChange={(e) =>
                                        setField(
                                            'signing_tanggal',
                                            e.target.value,
                                        )
                                    }
                                    className="tabular"
                                />
                            </Field>
                        </div>
                        <Field
                            label="Lokasi tanda tangan"
                            htmlFor="signing_lokasi"
                            error={errors.signing_lokasi}
                        >
                            <Input
                                id="signing_lokasi"
                                value={fields.signing_lokasi}
                                onChange={(e) =>
                                    setField('signing_lokasi', e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="Remarks"
                            htmlFor="remarks"
                            error={errors.remarks}
                            optional
                        >
                            <Textarea
                                id="remarks"
                                rows={3}
                                value={fields.remarks}
                                onChange={(e) =>
                                    setField('remarks', e.target.value)
                                }
                            />
                        </Field>
                        <p className="rounded-md bg-muted/70 px-4 py-3 text-[13px] text-muted-foreground">
                            No. surat diisi per karyawan pada langkah Review.
                            Penandatangan mengikuti data site masing-masing
                            karyawan.
                        </p>
                    </section>
                )}

                {step === 2 && (
                    <>
                        <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
                            {[
                                `Alasan PHK: ${fields.alasan_phk}`,
                                `DOE: ${fmt(fields.doe)}`,
                                `Tanda tangan: ${fmt(fields.signing_tanggal)}`,
                            ].map((chip) => (
                                <span
                                    key={chip}
                                    className="rounded-full bg-card px-3.5 py-2 shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]"
                                >
                                    {chip}
                                </span>
                            ))}
                        </div>
                        <section className={cn(card, 'overflow-hidden')}>
                            <div className="overflow-x-auto">
                                <div
                                    role="table"
                                    aria-label="Review batch"
                                    className="min-w-[640px]"
                                >
                                    <div
                                        role="row"
                                        className={cn(
                                            REVIEW_GRID,
                                            'bg-muted py-2.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase',
                                        )}
                                    >
                                        <span role="columnheader">Nama</span>
                                        <span role="columnheader">NRPP</span>
                                        <span role="columnheader">
                                            No. surat
                                        </span>
                                        <span role="columnheader">Status</span>
                                    </div>
                                    {selected.map((e) => {
                                        const ok = e.is_complete_for_paklaring;
                                        const err = errors[`no_surats.${e.id}`];
                                        const empty =
                                            attempted &&
                                            ok &&
                                            !(noSurats[e.id] ?? '').trim();

                                        return (
                                            <div
                                                key={e.id}
                                                role="row"
                                                className={cn(
                                                    REVIEW_GRID,
                                                    'border-t border-border py-2 text-[13px]',
                                                )}
                                            >
                                                <span
                                                    role="cell"
                                                    className="truncate text-sm font-semibold"
                                                >
                                                    {e.nama}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="tabular text-muted-foreground"
                                                >
                                                    {e.nrpp}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className="flex flex-col gap-1"
                                                >
                                                    {ok ? (
                                                        <>
                                                            <Input
                                                                aria-label={`No. surat ${e.nama}`}
                                                                value={
                                                                    noSurats[
                                                                        e.id
                                                                    ] ?? ''
                                                                }
                                                                onChange={(
                                                                    ev,
                                                                ) =>
                                                                    setNoSurats(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [e.id]:
                                                                                ev
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                                aria-invalid={
                                                                    err || empty
                                                                        ? true
                                                                        : undefined
                                                                }
                                                                placeholder="Ketik nomor surat"
                                                                className="tabular h-10 text-sm"
                                                            />
                                                            {err && (
                                                                <span className="text-xs font-semibold text-destructive">
                                                                    {err}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            –
                                                        </span>
                                                    )}
                                                </span>
                                                <span
                                                    role="cell"
                                                    className={cn(
                                                        'text-[13px] font-semibold',
                                                        ok
                                                            ? 'text-success'
                                                            : 'text-warning',
                                                    )}
                                                >
                                                    {ok
                                                        ? 'Siap dibuat'
                                                        : 'Data belum lengkap, akan dilewati'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {step === 3 && result && <ResultScreen result={result} />}

                {attempted && !canContinue && step < 3 && (
                    <p
                        role="alert"
                        className="text-sm font-semibold text-destructive"
                    >
                        {step === 0
                            ? 'Pilih minimal satu karyawan.'
                            : step === 1
                              ? 'Lengkapi alasan PHK, DOE, tanggal, dan lokasi tanda tangan.'
                              : ready.length === 0
                                ? 'Tidak ada karyawan dengan data lengkap untuk dibuat.'
                                : 'Isi nomor surat untuk setiap karyawan yang siap dibuat.'}
                    </p>
                )}

                {step < 3 && (
                    <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-full bg-card/95 p-2 shadow-[0_10px_30px_rgba(20,20,20,0.12)] backdrop-blur md:pl-5">
                        {step > 0 ? (
                            <Button
                                variant="outline"
                                onClick={() => setStep((s) => s - 1)}
                            >
                                Kembali
                            </Button>
                        ) : (
                            <span
                                className="tabular pl-3 text-sm font-semibold md:pl-0"
                                aria-live="polite"
                            >
                                {selected.length} karyawan dipilih
                            </span>
                        )}
                        <Button
                            variant={step === 2 ? 'accent' : 'default'}
                            className={step === 2 ? 'font-bold' : undefined}
                            onClick={next}
                            loading={processing}
                        >
                            {step === 2
                                ? `Simpan ${ready.length} paklaring`
                                : 'Lanjut'}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

CreateBatch.layout = {
    breadcrumbs: [
        { title: 'Daftar Paklaring', href: index() },
        { title: 'Buat Paklaring Batch', href: index() },
    ],
};
