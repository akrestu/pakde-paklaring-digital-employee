import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Briefcase,
    Calendar,
    Check,
    CircleAlert,
    PenLine,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import PaklaringController from '@/actions/App/Http/Controllers/PaklaringController';
import Heading from '@/components/heading';
import {
    emptyPaklaringFormValues,
    MasaKerjaFields,
    ProjekKlasifikasiFields,
    SiteKaryawanFields,
    STEP_REQUIRED_FIELDS,
    TandaTanganFields,
} from '@/components/paklaring-form-fields';
import type { PaklaringFormValues } from '@/components/paklaring-form-fields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { index } from '@/routes/paklarings';
import type { Site } from '@/types';

type Step = {
    title: string;
    description: string;
    icon: LucideIcon;
};

const STEPS: Step[] = [
    {
        title: 'Karyawan',
        description: 'Site dan data pribadi',
        icon: UserRound,
    },
    {
        title: 'Project & Klasifikasi',
        description: 'Posisi dan klasifikasi kerja',
        icon: Briefcase,
    },
    {
        title: 'Masa Kerja',
        description: 'Tanggal kerja & alasan berhenti',
        icon: Calendar,
    },
    {
        title: 'Tanda Tangan',
        description: 'Lokasi surat & review',
        icon: PenLine,
    },
];

function findStepForField(field: string): number | null {
    for (const [step, fields] of Object.entries(STEP_REQUIRED_FIELDS)) {
        if ((fields as string[]).includes(field)) {
            return Number(step);
        }
    }

    return null;
}

function StepIndicator({
    current,
    completeUpTo,
    onJump,
}: {
    current: number;
    completeUpTo: number;
    onJump: (step: number) => void;
}) {
    return (
        <ol className="flex items-center gap-2 sm:gap-4">
            {STEPS.map((step, i) => {
                const isDone =
                    i < completeUpTo || (i === completeUpTo && i < current);
                const isCurrent = i === current;
                const clickable = i <= current;

                return (
                    <li
                        key={step.title}
                        className="flex flex-1 items-center gap-2 sm:gap-4"
                    >
                        <button
                            type="button"
                            disabled={!clickable}
                            onClick={() => onJump(i)}
                            className={cn(
                                'flex items-center gap-2 rounded-lg p-1 text-left',
                                clickable && 'cursor-pointer',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                                    isCurrent &&
                                        'border-primary bg-primary text-primary-foreground',
                                    !isCurrent &&
                                        isDone &&
                                        'border-primary/40 bg-primary/10 text-primary',
                                    !isCurrent &&
                                        !isDone &&
                                        'border-border text-muted-foreground',
                                )}
                            >
                                {isDone && !isCurrent ? (
                                    <Check className="size-4" />
                                ) : (
                                    i + 1
                                )}
                            </span>
                            <span className="hidden sm:block">
                                <span
                                    className={cn(
                                        'block text-sm font-medium',
                                        !isCurrent &&
                                            !isDone &&
                                            'text-muted-foreground',
                                    )}
                                >
                                    {step.title}
                                </span>
                            </span>
                        </button>
                        {i < STEPS.length - 1 && (
                            <div
                                className={cn(
                                    'h-px flex-1',
                                    i < current ? 'bg-primary/40' : 'bg-border',
                                )}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{value || '-'}</dd>
        </div>
    );
}

function ReviewSummary({
    values,
    site,
}: {
    values: PaklaringFormValues;
    site?: Site | null;
}) {
    return (
        <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">
                Periksa kembali sebelum menyimpan
            </p>
            <dl className="grid gap-3 sm:grid-cols-3">
                <ReviewRow label="Site" value={site?.name ?? '-'} />
                <ReviewRow label="Nomor Surat" value={values.no_surat} />
                <ReviewRow label="NRPP" value={values.nrpp} />
                <ReviewRow label="Nama" value={values.nama} />
                <ReviewRow label="Project" value={values.project} />
                <ReviewRow
                    label="Classification Akhir"
                    value={values.final_classification}
                />
                <ReviewRow label="Alasan PHK" value={values.alasan_phk} />
                <ReviewRow label="DOH" value={values.doh} />
                <ReviewRow label="DOE" value={values.doe} />
                <ReviewRow
                    label="Lokasi Tanda Tangan"
                    value={values.signing_lokasi}
                />
            </dl>
        </div>
    );
}

export default function Create({
    sites,
    userSite,
    alasanPhkOptions,
}: {
    sites: Site[];
    userSite: Site | null;
    alasanPhkOptions: string[];
}) {
    const [values, setValues] = useState<PaklaringFormValues>({
        ...emptyPaklaringFormValues,
        site_id: userSite ? String(userSite.id) : '',
        project: userSite?.default_project ?? '',
        lokasi: userSite?.default_location ?? '',
        signing_lokasi: userSite?.default_location ?? '',
    });
    const [looking, setLooking] = useState(false);
    const [step, setStep] = useState(0);
    const [attemptedNext, setAttemptedNext] = useState(false);

    function handleChange<K extends keyof PaklaringFormValues>(
        field: K,
        value: PaklaringFormValues[K],
    ) {
        setValues((prev) => {
            const next = { ...prev, [field]: value };

            if (field === 'site_id') {
                const site = sites.find((s) => String(s.id) === value);

                if (site) {
                    if (!prev.project) {
                        next.project = site.default_project ?? '';
                    }

                    if (!prev.lokasi) {
                        next.lokasi = site.default_location ?? '';
                    }

                    if (!prev.signing_lokasi) {
                        next.signing_lokasi = site.default_location ?? '';
                    }
                }
            }

            return next;
        });
    }

    async function handleNrppLookup() {
        // Site admins are always scoped to their own site. Super admins can
        // search across every site — the site field then fills itself in
        // from wherever the matching employee actually belongs.
        const siteId = userSite ? String(userSite.id) : values.site_id;

        setLooking(true);

        try {
            const response = await fetch(
                EmployeeController.lookup.url({
                    query: siteId
                        ? { nrpp: values.nrpp, site_id: siteId }
                        : { nrpp: values.nrpp },
                }),
                {
                    headers: { Accept: 'application/json' },
                },
            );
            const data = await response.json();

            if (!data.found) {
                toast.error(
                    'NRPP tidak ditemukan di data karyawan. Silakan isi manual.',
                );

                return;
            }

            const employee = data.employee;

            setValues((prev) => ({
                ...prev,
                site_id: employee.site_id
                    ? String(employee.site_id)
                    : prev.site_id,
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
            }));

            toast.success(`Data ditemukan: ${employee.nama}`);
        } catch {
            toast.error('Gagal mengambil data karyawan.');
        } finally {
            setLooking(false);
        }
    }

    function isStepComplete(i: number): boolean {
        const fieldsFilled = (STEP_REQUIRED_FIELDS[i] ?? []).every(
            (field) => values[field].trim() !== '',
        );

        if (i === 2 && values.doh && values.doe && values.doe < values.doh) {
            return false;
        }

        return fieldsFilled;
    }

    const canGoNext = isStepComplete(step);
    const isLastStep = step === STEPS.length - 1;

    function goNext() {
        if (!isStepComplete(step)) {
            setAttemptedNext(true);

            return;
        }

        setAttemptedNext(false);
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }

    function goPrev() {
        setAttemptedNext(false);
        setStep((s) => Math.max(s - 1, 0));
    }

    const selectedSite =
        userSite ?? sites.find((s) => String(s.id) === values.site_id);

    return (
        <>
            <Head title="Buat Paklaring" />

            <div className="space-y-6 p-4 pb-24">
                <Link
                    href={index()}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Paklaring
                </Link>

                <Heading
                    title="Buat Paklaring"
                    description="Ikuti langkah di bawah ini. Ketik NRPP lalu klik Cari untuk isi otomatis dari data karyawan."
                />

                <Form
                    {...PaklaringController.store.form()}
                    className="max-w-3xl space-y-6"
                    onError={(errors) => {
                        const firstField = Object.keys(errors)[0];
                        const errorStep = firstField
                            ? findStepForField(firstField)
                            : null;

                        if (errorStep !== null) {
                            setStep(errorStep);
                        }
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <StepIndicator
                                current={step}
                                completeUpTo={step}
                                onJump={(i) => {
                                    if (i <= step) {
                                        setAttemptedNext(false);
                                        setStep(i);
                                    }
                                }}
                            />

                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive">
                                    <CircleAlert />
                                    <AlertTitle>
                                        Ada isian yang perlu diperbaiki
                                    </AlertTitle>
                                    <AlertDescription>
                                        Periksa kembali kolom yang ditandai
                                        merah.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Langkah {step + 1}: {STEPS[step].title}
                                    </CardTitle>
                                    <CardDescription>
                                        {STEPS[step].description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className={step === 0 ? '' : 'hidden'}>
                                        <SiteKaryawanFields
                                            values={values}
                                            onChange={handleChange}
                                            errors={errors}
                                            sites={sites}
                                            lockedSite={userSite}
                                            nrppLookup={{
                                                onSearch: handleNrppLookup,
                                                loading: looking,
                                            }}
                                        />
                                    </div>
                                    <div className={step === 1 ? '' : 'hidden'}>
                                        <ProjekKlasifikasiFields
                                            values={values}
                                            onChange={handleChange}
                                            errors={errors}
                                        />
                                    </div>
                                    <div className={step === 2 ? '' : 'hidden'}>
                                        <MasaKerjaFields
                                            values={values}
                                            onChange={handleChange}
                                            errors={errors}
                                            alasanPhkOptions={alasanPhkOptions}
                                        />
                                    </div>
                                    <div
                                        className={cn(
                                            'space-y-6',
                                            step === 3 ? '' : 'hidden',
                                        )}
                                    >
                                        <TandaTanganFields
                                            values={values}
                                            onChange={handleChange}
                                            errors={errors}
                                        />
                                        <ReviewSummary
                                            values={values}
                                            site={selectedSite}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {attemptedNext && !canGoNext && (
                                <p className="text-sm text-destructive">
                                    Lengkapi kolom bertanda * sebelum
                                    melanjutkan ke langkah berikutnya.
                                </p>
                            )}

                            <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goPrev}
                                    disabled={step === 0}
                                >
                                    <ArrowLeft />
                                    Kembali
                                </Button>

                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        asChild
                                    >
                                        <Link href={index()}>Batal</Link>
                                    </Button>

                                    {isLastStep ? (
                                        <Button
                                            type="submit"
                                            disabled={processing || !canGoNext}
                                        >
                                            {processing && <Spinner />}
                                            Simpan &amp; Buat PDF
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={goNext}
                                            disabled={!canGoNext}
                                        >
                                            Lanjut
                                            <ArrowRight />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Paklaring', href: index() },
        { title: 'Buat Paklaring', href: index() },
    ],
};
