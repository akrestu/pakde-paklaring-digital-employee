import { CircleAlert, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Employee, Site } from '@/types';

export type PaklaringFormValues = {
    site_id: string;
    no_surat: string;
    nrpp: string;
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    alamat: string;
    project: string;
    lokasi: string;
    beginning_classification: string;
    beginning_versatility: string;
    final_classification: string;
    final_versatility: string;
    alasan_phk: string;
    doh: string;
    doe: string;
    remarks: string;
    signing_lokasi: string;
    signing_tanggal: string;
};

export const emptyPaklaringFormValues: PaklaringFormValues = {
    site_id: '',
    no_surat: '',
    nrpp: '',
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    project: '',
    lokasi: '',
    beginning_classification: '',
    beginning_versatility: '',
    final_classification: '',
    final_versatility: '',
    alasan_phk: '',
    doh: '',
    doe: '',
    remarks: '',
    signing_lokasi: '',
    signing_tanggal: new Date().toISOString().slice(0, 10),
};

/**
 * Fields required to move past each wizard step (see StorePaklaringRequest),
 * grouped as in `screens/PaklaringForm.html`. Every field is still posted.
 */
export const STEP_REQUIRED_FIELDS: Record<
    number,
    (keyof PaklaringFormValues)[]
> = {
    0: [
        'site_id',
        'nrpp',
        'nama',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'project',
        'lokasi',
    ],
    1: [
        'beginning_classification',
        'final_classification',
        'beginning_versatility',
        'final_versatility',
        'alasan_phk',
        'doh',
        'doe',
    ],
    2: ['signing_lokasi', 'signing_tanggal', 'no_surat'],
    3: [],
};

export type OnChange = <K extends keyof PaklaringFormValues>(
    field: K,
    value: PaklaringFormValues[K],
) => void;

type SectionProps = {
    values: PaklaringFormValues;
    onChange: OnChange;
    errors: Partial<Record<string, string>>;
};

function useField(
    values: PaklaringFormValues,
    onChange: OnChange,
    errors: SectionProps['errors'],
) {
    return <K extends keyof PaklaringFormValues>(name: K) => ({
        id: name,
        name,
        value: values[name],
        'aria-invalid': errors[name] ? true : undefined,
        onChange: (
            event: ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => onChange(name, event.target.value),
    });
}

export function Field({
    label,
    htmlFor,
    error,
    hint,
    optional,
    className,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    optional?: boolean;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={htmlFor} className="text-[13px] font-semibold">
                {label}
                {optional && (
                    <span className="ml-1 font-normal text-muted-foreground">
                        (opsional)
                    </span>
                )}
            </label>
            {children}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            <InputError message={error} />
        </div>
    );
}

const selectClass =
    'h-[50px] w-full rounded-md border-2 border-transparent bg-input px-4 text-[15px] text-foreground outline-none focus-visible:border-foreground focus-visible:bg-card aria-invalid:border-destructive dark:focus-visible:border-accent';

export function SectionTitle({ children }: { children: ReactNode }) {
    return <h2 className="text-base font-bold">{children}</h2>;
}

/* ------------------------------------------------------------------ */
/* Step 1 · Pilih karyawan                                             */
/* ------------------------------------------------------------------ */

export type LookupEmployee = Employee & { site?: Pick<Site, 'id' | 'name'> };

function EmployeeCombobox({
    siteId,
    onPick,
}: {
    siteId: string;
    onPick: (employee: LookupEmployee) => void;
}) {
    const listId = useId();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<LookupEmployee[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const lastQuery = useRef('');

    useEffect(() => {
        const term = query.trim();

        if (term.length < 2 || term === lastQuery.current) {
            return;
        }

        const timer = setTimeout(async () => {
            lastQuery.current = term;
            setLoading(true);

            try {
                const response = await fetch(
                    EmployeeController.lookup.url({
                        query: siteId
                            ? { q: term, site_id: siteId }
                            : { q: term },
                    }),
                    { headers: { Accept: 'application/json' } },
                );
                const data = await response.json();
                setResults(data.results ?? []);
                setActive(0);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [query, siteId]);

    function pick(employee: LookupEmployee) {
        const label = `${employee.nama} · ${employee.nrpp}`;
        setPicked(employee.id);
        setOpen(false);
        setQuery(label);
        lastQuery.current = label;
        onPick(employee);
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (!open || results.length === 0) {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((i) => (i + 1) % results.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((i) => (i - 1 + results.length) % results.length);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            pick(results[active]);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

    const showList = open && query.trim().length >= 2;

    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor={`${listId}-input`}
                className="text-[13px] font-semibold"
            >
                Cari karyawan
            </label>
            <span className="relative block">
                <Search
                    className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground"
                    strokeWidth={1.8}
                    aria-hidden
                />
                <Input
                    id={`${listId}-input`}
                    role="combobox"
                    aria-expanded={showList}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        showList && results[active]
                            ? `${listId}-${results[active].id}`
                            : undefined
                    }
                    autoComplete="off"
                    autoFocus
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setPicked(null);
                    }}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder="Ketik NRPP atau nama"
                    className="pl-11 text-[15px]"
                />
                {loading && (
                    <Spinner className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground" />
                )}
            </span>

            {showList && (
                <div
                    id={listId}
                    role="listbox"
                    aria-label="Hasil pencarian karyawan"
                    className="overflow-hidden rounded-md border border-border"
                >
                    {results.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                            Tidak ada karyawan yang cocok. Isi data di bawah
                            secara manual.
                        </p>
                    ) : (
                        results.map((e, i) => (
                            <button
                                key={e.id}
                                id={`${listId}-${e.id}`}
                                type="button"
                                role="option"
                                aria-selected={picked === e.id}
                                onMouseDown={(ev) => ev.preventDefault()}
                                onClick={() => pick(e)}
                                className={cn(
                                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left',
                                    i > 0 && 'border-t border-border',
                                    i === active || picked === e.id
                                        ? 'bg-accent-soft'
                                        : 'bg-card hover:bg-muted',
                                )}
                            >
                                <span className="flex min-w-0 flex-col">
                                    <span className="truncate text-sm font-bold">
                                        {e.nama}
                                    </span>
                                    <span className="tabular truncate text-xs text-muted-foreground">
                                        NRPP {e.nrpp}
                                        {e.site?.name ? ` · ${e.site.name}` : ''}
                                        {!e.is_active ? ' · Nonaktif' : ''}
                                    </span>
                                </span>
                                <span
                                    className={cn(
                                        'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold',
                                        e.is_complete_for_paklaring
                                            ? 'bg-success-soft text-success'
                                            : 'bg-warning-soft text-warning',
                                    )}
                                >
                                    {e.is_complete_for_paklaring
                                        ? 'Lengkap'
                                        : 'Belum lengkap'}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export function KaryawanStep({
    values,
    onChange,
    errors,
    sites,
    lockedSite,
    onPickEmployee,
    pickedIncomplete,
}: SectionProps & {
    sites: Site[];
    lockedSite?: Site | null;
    /** Omit to hide the combobox (edit mode). */
    onPickEmployee?: (employee: LookupEmployee) => void;
    pickedIncomplete?: boolean;
}) {
    const field = useField(values, onChange, errors);

    return (
        <div className="flex flex-col gap-[18px]">
            {lockedSite ? (
                <input type="hidden" name="site_id" value={lockedSite.id} />
            ) : (
                <Field label="Site" htmlFor="site_id" error={errors.site_id}>
                    <select {...field('site_id')} className={selectClass}>
                        <option value="">Pilih site…</option>
                        {sites.map((site) => (
                            <option key={site.id} value={String(site.id)}>
                                {site.name} ({site.code})
                            </option>
                        ))}
                    </select>
                </Field>
            )}

            {onPickEmployee && (
                <EmployeeCombobox
                    siteId={lockedSite ? String(lockedSite.id) : values.site_id}
                    onPick={onPickEmployee}
                />
            )}

            {pickedIncomplete && (
                <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-md bg-warning-soft px-4 py-3 text-sm font-medium text-warning"
                >
                    <CircleAlert
                        className="mt-0.5 size-[18px] shrink-0"
                        strokeWidth={1.8}
                        aria-hidden
                    />
                    <span>
                        Data karyawan ini belum lengkap. Isi kolom yang masih
                        kosong di bawah dan pada langkah berikutnya.
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-3.5 rounded-lg border border-border p-4 md:p-5">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-sm font-bold">Data karyawan</h2>
                    {onPickEmployee && (
                        <p className="text-xs text-muted-foreground">
                            Terisi otomatis dari data karyawan. Ubah bila perlu.
                        </p>
                    )}
                </div>
                <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field label="NRPP" htmlFor="nrpp" error={errors.nrpp}>
                        <Input {...field('nrpp')} className="tabular" />
                    </Field>
                    <Field label="Nama" htmlFor="nama" error={errors.nama}>
                        <Input {...field('nama')} />
                    </Field>
                    <Field
                        label="Tempat lahir"
                        htmlFor="tempat_lahir"
                        error={errors.tempat_lahir}
                    >
                        <Input {...field('tempat_lahir')} />
                    </Field>
                    <Field
                        label="Tanggal lahir"
                        htmlFor="tanggal_lahir"
                        error={errors.tanggal_lahir}
                    >
                        <Input type="date" {...field('tanggal_lahir')} />
                    </Field>
                    <Field
                        label="Alamat"
                        htmlFor="alamat"
                        error={errors.alamat}
                        className="sm:col-span-2"
                    >
                        <Textarea {...field('alamat')} rows={2} />
                    </Field>
                    <Field
                        label="Project"
                        htmlFor="project"
                        error={errors.project}
                    >
                        <Input {...field('project')} />
                    </Field>
                    <Field label="Lokasi" htmlFor="lokasi" error={errors.lokasi}>
                        <Input {...field('lokasi')} />
                    </Field>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Step 2 · Data kerja & alasan                                         */
/* ------------------------------------------------------------------ */

export function DataKerjaStep({
    values,
    onChange,
    errors,
    alasanPhkOptions,
}: SectionProps & { alasanPhkOptions: string[] }) {
    const field = useField(values, onChange, errors);
    const dateOrderInvalid = Boolean(
        values.doh && values.doe && values.doe < values.doh,
    );

    return (
        <div className="flex flex-col gap-[18px]">
            <div className="grid gap-3.5 sm:grid-cols-2">
                <Field
                    label="Beginning classification"
                    htmlFor="beginning_classification"
                    error={errors.beginning_classification}
                >
                    <Input {...field('beginning_classification')} />
                </Field>
                <Field
                    label="Final classification"
                    htmlFor="final_classification"
                    error={errors.final_classification}
                >
                    <Input {...field('final_classification')} />
                </Field>
                <Field
                    label="Beginning versatility"
                    htmlFor="beginning_versatility"
                    error={errors.beginning_versatility}
                >
                    <Input {...field('beginning_versatility')} />
                </Field>
                <Field
                    label="Final versatility"
                    htmlFor="final_versatility"
                    error={errors.final_versatility}
                >
                    <Input {...field('final_versatility')} />
                </Field>
            </div>

            <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-[13px] font-semibold">
                    Alasan PHK
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {alasanPhkOptions.map((option) => {
                        const on = values.alasan_phk === option;

                        return (
                            <label
                                key={option}
                                className={cn(
                                    'flex min-h-[52px] cursor-pointer items-center gap-2.5 rounded-md px-3.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
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
                                        onChange('alasan_phk', option)
                                    }
                                    className="size-[18px] accent-[var(--primary)]"
                                />
                                {option}
                            </label>
                        );
                    })}
                </div>
                <InputError message={errors.alasan_phk} />
            </fieldset>

            <div className="grid gap-3.5 sm:grid-cols-2">
                <Field
                    label="DOH (tanggal masuk)"
                    htmlFor="doh"
                    error={errors.doh}
                >
                    <Input type="date" {...field('doh')} className="tabular" />
                </Field>
                <Field
                    label="DOE (tanggal keluar)"
                    htmlFor="doe"
                    error={
                        errors.doe ??
                        (dateOrderInvalid
                            ? 'DOE tidak boleh sebelum DOH.'
                            : undefined)
                    }
                >
                    <Input
                        type="date"
                        {...field('doe')}
                        aria-invalid={
                            errors.doe || dateOrderInvalid ? true : undefined
                        }
                        className="tabular"
                    />
                </Field>
            </div>

            <Field
                label="Remarks"
                htmlFor="remarks"
                error={errors.remarks}
                optional
            >
                <Textarea {...field('remarks')} rows={3} />
            </Field>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Step 3 · Tanda tangan & no. surat                                    */
/* ------------------------------------------------------------------ */

export function TandaTanganStep({
    values,
    onChange,
    errors,
    site,
}: SectionProps & { site?: Site | null }) {
    const field = useField(values, onChange, errors);
    const signer = [site?.signer_name, site?.signer_title]
        .filter(Boolean)
        .join(' · ');

    return (
        <div className="flex flex-col gap-[18px]">
            <SectionTitle>Penandatanganan</SectionTitle>
            <div className="grid gap-3.5 sm:grid-cols-2">
                <Field
                    label="Lokasi penandatanganan"
                    htmlFor="signing_lokasi"
                    error={errors.signing_lokasi}
                >
                    <Input {...field('signing_lokasi')} />
                </Field>
                <Field
                    label="Tanggal penandatanganan"
                    htmlFor="signing_tanggal"
                    error={errors.signing_tanggal}
                >
                    <Input
                        type="date"
                        {...field('signing_tanggal')}
                        className="tabular"
                    />
                </Field>
            </div>

            <div className="flex items-center gap-3 rounded-md bg-muted/60 px-4 py-3">
                <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-bold">
                        {signer || 'Penandatangan belum diatur'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {site
                            ? `Penandatangan dari data ${site.name}`
                            : 'Pilih site pada langkah 1'}
                    </span>
                </span>
            </div>

            <div className="h-px bg-border" />

            <SectionTitle>No. surat</SectionTitle>
            <Field
                label="Nomor surat"
                htmlFor="no_surat"
                error={errors.no_surat}
                hint="Diisi manual sesuai buku register paklaring."
            >
                <Input
                    {...field('no_surat')}
                    placeholder="Ketik nomor surat"
                    className="tabular"
                />
            </Field>
        </div>
    );
}
