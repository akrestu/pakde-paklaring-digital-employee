import { Form, Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import {
    DataKerjaStep,
    KaryawanStep,
    STEP_REQUIRED_FIELDS,
    TandaTanganStep,
} from '@/components/paklaring-form-fields';
import type {
    LookupEmployee,
    PaklaringFormValues,
} from '@/components/paklaring-form-fields';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Site } from '@/types';

const STEP_NAMES = [
    'Pilih karyawan',
    'Data kerja & alasan',
    'Tanda tangan & no. surat',
    'Ringkasan',
];

const dateLong = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const fmtDate = (v: string) =>
    v ? dateLong.format(new Date(`${v.slice(0, 10)}T00:00:00`)) : '–';

function findStepForField(field: string): number | null {
    for (const [step, fields] of Object.entries(STEP_REQUIRED_FIELDS)) {
        if ((fields as string[]).includes(field)) {
            return Number(step);
        }
    }

    return null;
}

function SummaryGroup({
    title,
    items,
    onEdit,
}: {
    title: string;
    items: [string, string][];
    onEdit: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-lg bg-muted/60 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">{title}</h2>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                >
                    Ubah
                </Button>
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {items.map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-0.5">
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="text-sm font-semibold break-words">
                            {v || '–'}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

/**
 * Four-step paklaring form per `screens/PaklaringForm*.html`, shared by
 * create and edit. Hidden steps stay mounted so every field is posted.
 */
export function PaklaringWizard({
    mode,
    form,
    initialValues,
    sites,
    lockedSite,
    alasanPhkOptions,
    backHref,
    backLabel,
    enableLookup = false,
}: {
    mode: 'create' | 'edit';
    form: Pick<ComponentProps<typeof Form>, 'action' | 'method'>;
    initialValues: PaklaringFormValues;
    sites: Site[];
    lockedSite?: Site | null;
    alasanPhkOptions: string[];
    backHref: NonNullable<InertiaLinkProps['href']>;
    backLabel: string;
    enableLookup?: boolean;
}) {
    const [values, setValues] = useState<PaklaringFormValues>(initialValues);
    const [step, setStep] = useState(0);
    const [attemptedNext, setAttemptedNext] = useState(false);
    const [pickedIncomplete, setPickedIncomplete] = useState(false);

    const site =
        lockedSite ??
        sites.find((s) => String(s.id) === values.site_id) ??
        null;

    function handleChange<K extends keyof PaklaringFormValues>(
        field: K,
        value: PaklaringFormValues[K],
    ) {
        setValues((prev) => {
            const next = { ...prev, [field]: value };

            if (field === 'site_id') {
                const picked = sites.find((s) => String(s.id) === value);

                if (picked) {
                    next.project ||= picked.default_project ?? '';
                    next.lokasi ||= picked.default_location ?? '';
                    next.signing_lokasi ||= picked.default_location ?? '';
                }
            }

            return next;
        });
    }

    function handlePick(employee: LookupEmployee) {
        setPickedIncomplete(!employee.is_complete_for_paklaring);
        setValues((prev) => {
            const employeeSite = sites.find((s) => s.id === employee.site_id);

            return {
                ...prev,
                site_id:
                    !lockedSite && employee.site_id
                        ? String(employee.site_id)
                        : prev.site_id,
                nrpp: employee.nrpp ?? prev.nrpp,
                nama: employee.nama ?? prev.nama,
                tempat_lahir: employee.tempat_lahir ?? prev.tempat_lahir,
                tanggal_lahir: employee.tanggal_lahir
                    ? employee.tanggal_lahir.slice(0, 10)
                    : prev.tanggal_lahir,
                alamat: employee.alamat ?? prev.alamat,
                project: employee.project ?? prev.project,
                lokasi: employee.lokasi ?? prev.lokasi,
                beginning_classification:
                    employee.beginning_classification ??
                    prev.beginning_classification,
                beginning_versatility:
                    employee.beginning_versatility ??
                    prev.beginning_versatility,
                final_classification:
                    employee.classification ?? prev.final_classification,
                final_versatility:
                    employee.versatility ?? prev.final_versatility,
                doh: employee.doh ? employee.doh.slice(0, 10) : prev.doh,
                signing_lokasi:
                    prev.signing_lokasi || employeeSite?.default_location || '',
            };
        });
    }

    function isStepComplete(i: number): boolean {
        const filled = (STEP_REQUIRED_FIELDS[i] ?? []).every(
            (field) => values[field].trim() !== '',
        );

        if (i === 1 && values.doh && values.doe && values.doe < values.doh) {
            return false;
        }

        return filled;
    }

    const lastStep = STEP_NAMES.length - 1;
    const allComplete = [0, 1, 2].every(isStepComplete);

    function goNext() {
        if (!isStepComplete(step)) {
            setAttemptedNext(true);

            return;
        }

        setAttemptedNext(false);
        setStep((s) => Math.min(s + 1, lastStep));
    }

    function goTo(i: number) {
        setAttemptedNext(false);
        setStep(i);
    }

    const title = mode === 'edit' ? 'Edit Paklaring' : 'Buat Paklaring';

    return (
        <Form
            {...form}
            className="flex flex-col gap-4 md:gap-5"
            onError={(errors) => {
                const first = Object.keys(errors)[0];
                const target = first ? findStepForField(first) : null;

                if (target !== null) {
                    setStep(target);
                }
            }}
        >
            {({ processing, errors }) => (
                <>
                    <div className="flex items-center gap-3">
                        <Link
                            href={backHref}
                            aria-label={backLabel}
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
                                {title}
                            </h1>
                            <div className="text-[13px] text-muted-foreground">
                                Langkah {step + 1} dari {STEP_NAMES.length} ·{' '}
                                {STEP_NAMES[step]}
                            </div>
                        </div>
                    </div>

                    <ol
                        aria-label="Tahapan"
                        className="grid grid-cols-4 gap-1.5"
                    >
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

                    {Object.keys(errors).length > 0 && (
                        <div
                            role="alert"
                            className="flex items-start gap-2.5 rounded-md bg-destructive-soft px-4 py-3 text-sm font-medium text-destructive"
                        >
                            <CircleAlert
                                className="mt-0.5 size-[18px] shrink-0"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                            Ada isian yang perlu diperbaiki. Periksa kolom yang
                            ditandai merah.
                        </div>
                    )}

                    <section className="flex flex-col gap-[18px] rounded-lg bg-card p-4 shadow-[0_1px_2px_oklch(0.191_0_0/0.06)] md:p-6">
                        <div className={step === 0 ? '' : 'hidden'}>
                            <KaryawanStep
                                values={values}
                                onChange={handleChange}
                                errors={errors}
                                sites={sites}
                                lockedSite={lockedSite}
                                onPickEmployee={
                                    enableLookup ? handlePick : undefined
                                }
                                pickedIncomplete={pickedIncomplete}
                            />
                        </div>
                        <div className={step === 1 ? '' : 'hidden'}>
                            <DataKerjaStep
                                values={values}
                                onChange={handleChange}
                                errors={errors}
                                alasanPhkOptions={alasanPhkOptions}
                            />
                        </div>
                        <div className={step === 2 ? '' : 'hidden'}>
                            <TandaTanganStep
                                values={values}
                                onChange={handleChange}
                                errors={errors}
                                site={site}
                            />
                        </div>
                        {step === 3 && (
                            <div className="flex flex-col gap-3">
                                <SummaryGroup
                                    title="Karyawan"
                                    onEdit={() => goTo(0)}
                                    items={[
                                        ['Nama', values.nama],
                                        ['NRPP', values.nrpp],
                                        [
                                            'Tempat, tanggal lahir',
                                            [
                                                values.tempat_lahir,
                                                values.tanggal_lahir
                                                    ? fmtDate(
                                                          values.tanggal_lahir,
                                                      )
                                                    : '',
                                            ]
                                                .filter(Boolean)
                                                .join(', '),
                                        ],
                                        ['Alamat', values.alamat],
                                        ['Project', values.project],
                                        ['Lokasi', values.lokasi],
                                        ['Site', site?.name ?? ''],
                                    ]}
                                />
                                <SummaryGroup
                                    title="Data kerja"
                                    onEdit={() => goTo(1)}
                                    items={[
                                        [
                                            'Classification',
                                            `${values.beginning_classification || '–'} → ${values.final_classification || '–'}`,
                                        ],
                                        [
                                            'Versatility',
                                            `${values.beginning_versatility || '–'} → ${values.final_versatility || '–'}`,
                                        ],
                                        ['Alasan PHK', values.alasan_phk],
                                        ['DOH', fmtDate(values.doh)],
                                        ['DOE', fmtDate(values.doe)],
                                        ['Remarks', values.remarks],
                                    ]}
                                />
                                <SummaryGroup
                                    title="Penandatanganan"
                                    onEdit={() => goTo(2)}
                                    items={[
                                        ['Lokasi', values.signing_lokasi],
                                        [
                                            'Tanggal',
                                            fmtDate(values.signing_tanggal),
                                        ],
                                        [
                                            'Penandatangan',
                                            [
                                                site?.signer_name,
                                                site?.signer_title,
                                            ]
                                                .filter(Boolean)
                                                .join(' · '),
                                        ],
                                        ['No. surat', values.no_surat],
                                    ]}
                                />
                            </div>
                        )}
                    </section>

                    {attemptedNext && !isStepComplete(step) && (
                        <p
                            role="alert"
                            className="text-sm font-semibold text-destructive"
                        >
                            Lengkapi semua kolom wajib sebelum lanjut ke langkah
                            berikutnya.
                        </p>
                    )}

                    <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-full bg-card/95 p-2 shadow-[0_10px_30px_rgba(20,20,20,0.12)] backdrop-blur md:static md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
                        {step > 0 ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => goTo(step - 1)}
                            >
                                Kembali
                            </Button>
                        ) : (
                            <Button type="button" variant="ghost" asChild>
                                <Link href={backHref}>Batal</Link>
                            </Button>
                        )}

                        {step < lastStep ? (
                            <Button type="button" onClick={goNext}>
                                Lanjut
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="accent"
                                className="font-bold"
                                loading={processing}
                                disabled={!allComplete}
                            >
                                {mode === 'edit'
                                    ? 'Simpan perubahan'
                                    : 'Simpan paklaring'}
                            </Button>
                        )}
                    </div>
                </>
            )}
        </Form>
    );
}
