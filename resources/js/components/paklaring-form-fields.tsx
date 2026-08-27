import type { ChangeEvent, ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import type { Site } from '@/types';

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

/** Fields required to move past each wizard step (see StorePaklaringRequest). */
export const STEP_REQUIRED_FIELDS: Record<
    number,
    (keyof PaklaringFormValues)[]
> = {
    0: ['site_id', 'nrpp', 'nama', 'tempat_lahir', 'tanggal_lahir', 'alamat'],
    1: [
        'project',
        'lokasi',
        'beginning_classification',
        'beginning_versatility',
        'final_classification',
        'final_versatility',
    ],
    2: ['doh', 'doe', 'alasan_phk'],
    3: ['no_surat', 'signing_lokasi', 'signing_tanggal'],
};

type OnChange = <K extends keyof PaklaringFormValues>(
    field: K,
    value: PaklaringFormValues[K],
) => void;

type SectionProps = {
    values: PaklaringFormValues;
    onChange: OnChange;
    errors: Partial<Record<string, string>>;
};

function useField(values: PaklaringFormValues, onChange: OnChange) {
    return <K extends keyof PaklaringFormValues>(name: K) => ({
        id: name,
        name,
        value: values[name],
        onChange: (
            event: ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => onChange(name, event.target.value),
    });
}

function FieldLabel({
    htmlFor,
    required = true,
    children,
}: {
    htmlFor: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <Label htmlFor={htmlFor}>
            {children}
            {required ? (
                <span className="ml-0.5 text-destructive">*</span>
            ) : (
                <span className="ml-1 font-normal text-muted-foreground">
                    (opsional)
                </span>
            )}
        </Label>
    );
}

export function SiteKaryawanFields({
    values,
    onChange,
    errors,
    sites,
    lockedSite,
    nrppLookup,
}: SectionProps & {
    sites: Site[];
    lockedSite?: Site | null;
    nrppLookup?: { onSearch: () => void; loading: boolean };
}) {
    const field = useField(values, onChange);

    return (
        <div className="space-y-6">
            {/* NRPP is the primary reference for the whole form — it comes
                first, and everything below follows from it. */}
            <div className="space-y-2 rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                <FieldLabel htmlFor="nrpp">NRPP</FieldLabel>
                <div className="flex gap-2">
                    <Input
                        {...field('nrpp')}
                        autoFocus
                        placeholder="Masukkan NRPP karyawan"
                        className="bg-background"
                    />
                    {nrppLookup && (
                        <Button
                            type="button"
                            onClick={nrppLookup.onSearch}
                            disabled={nrppLookup.loading || !values.nrpp}
                            className="shrink-0"
                        >
                            {nrppLookup.loading && <Spinner />}
                            {nrppLookup.loading ? 'Mencari…' : 'Cari'}
                        </Button>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    {nrppLookup
                        ? 'Klik Cari — site, nama, dan kolom lain di bawah akan otomatis terisi dari data karyawan.'
                        : 'Kolom lain mengikuti data karyawan dengan NRPP ini.'}
                </p>
                <InputError message={errors.nrpp} />
            </div>

            <div className="grid gap-2">
                {lockedSite ? (
                    <>
                        <Label>Site</Label>
                        <Input value={lockedSite.name} disabled />
                        <input
                            type="hidden"
                            name="site_id"
                            value={lockedSite.id}
                        />
                    </>
                ) : (
                    <>
                        <FieldLabel htmlFor="site_id">Site</FieldLabel>
                        <Select
                            value={values.site_id}
                            onValueChange={(value) =>
                                onChange('site_id', value)
                            }
                        >
                            <SelectTrigger id="site_id" className="w-full">
                                <SelectValue placeholder="Pilih site…" />
                            </SelectTrigger>
                            <SelectContent>
                                {sites.map((site) => (
                                    <SelectItem
                                        key={site.id}
                                        value={String(site.id)}
                                    >
                                        {site.name} ({site.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <input
                            type="hidden"
                            name="site_id"
                            value={values.site_id}
                        />
                        <InputError message={errors.site_id} />
                    </>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <FieldLabel htmlFor="nama">Nama</FieldLabel>
                    <Input {...field('nama')} />
                    <InputError message={errors.nama} />
                </div>

                <div className="grid gap-2">
                    <FieldLabel htmlFor="tempat_lahir">Tempat Lahir</FieldLabel>
                    <Input {...field('tempat_lahir')} />
                    <InputError message={errors.tempat_lahir} />
                </div>

                <div className="grid gap-2">
                    <FieldLabel htmlFor="tanggal_lahir">
                        Tanggal Lahir
                    </FieldLabel>
                    <Input type="date" {...field('tanggal_lahir')} />
                    <InputError message={errors.tanggal_lahir} />
                </div>

                <div className="col-span-full grid gap-2">
                    <FieldLabel htmlFor="alamat">Alamat</FieldLabel>
                    <Textarea {...field('alamat')} />
                    <InputError message={errors.alamat} />
                </div>
            </div>
        </div>
    );
}

export function ProjekKlasifikasiFields({
    values,
    onChange,
    errors,
}: SectionProps) {
    const field = useField(values, onChange);

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
                <FieldLabel htmlFor="project">Project</FieldLabel>
                <Input {...field('project')} />
                <InputError message={errors.project} />
            </div>

            <div className="grid gap-2">
                <FieldLabel htmlFor="lokasi">Lokasi Proyek</FieldLabel>
                <Input {...field('lokasi')} />
                <InputError message={errors.lokasi} />
            </div>

            <div className="grid gap-2">
                <FieldLabel htmlFor="beginning_classification">
                    Beginning Classification
                </FieldLabel>
                <Input {...field('beginning_classification')} />
                <InputError message={errors.beginning_classification} />
            </div>

            <div className="grid gap-2">
                <FieldLabel htmlFor="beginning_versatility">
                    Beginning Versatility
                </FieldLabel>
                <Input {...field('beginning_versatility')} />
                <InputError message={errors.beginning_versatility} />
            </div>

            <div className="grid gap-2">
                <FieldLabel htmlFor="final_classification">
                    Final Classification
                </FieldLabel>
                <Input {...field('final_classification')} />
                <InputError message={errors.final_classification} />
            </div>

            <div className="grid gap-2">
                <FieldLabel htmlFor="final_versatility">
                    Final Versatility
                </FieldLabel>
                <Input {...field('final_versatility')} />
                <InputError message={errors.final_versatility} />
            </div>
        </div>
    );
}

export function MasaKerjaFields({
    values,
    onChange,
    errors,
    alasanPhkOptions,
}: SectionProps & { alasanPhkOptions: string[] }) {
    const field = useField(values, onChange);
    const dateOrderInvalid =
        values.doh && values.doe && values.doe < values.doh;

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
                <FieldLabel htmlFor="doh">DOH (Date of Hire)</FieldLabel>
                <Input type="date" {...field('doh')} />
                <InputError message={errors.doh} />
            </div>

            <div className="grid gap-2">
                <FieldLabel htmlFor="doe">DOE (Date of End)</FieldLabel>
                <Input type="date" {...field('doe')} />
                <InputError
                    message={
                        errors.doe ??
                        (dateOrderInvalid
                            ? 'DOE tidak boleh sebelum DOH.'
                            : undefined)
                    }
                />
            </div>

            <div className="grid gap-2">
                <FieldLabel htmlFor="alasan_phk">Alasan PHK</FieldLabel>
                <Select
                    value={values.alasan_phk}
                    onValueChange={(value) => onChange('alasan_phk', value)}
                >
                    <SelectTrigger id="alasan_phk" className="w-full">
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
                <input
                    type="hidden"
                    name="alasan_phk"
                    value={values.alasan_phk}
                />
                <InputError message={errors.alasan_phk} />
            </div>

            <div className="col-span-full grid gap-2">
                <FieldLabel htmlFor="remarks" required={false}>
                    Remarks / Keterangan
                </FieldLabel>
                <Textarea {...field('remarks')} />
                <InputError message={errors.remarks} />
            </div>
        </div>
    );
}

export function TandaTanganFields({ values, onChange, errors }: SectionProps) {
    const field = useField(values, onChange);

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="col-span-full grid gap-2">
                <FieldLabel htmlFor="no_surat">Nomor Surat</FieldLabel>
                <Input
                    {...field('no_surat')}
                    placeholder="Contoh: WBK-BAU-HRGA-2026-VIII-0001"
                />
                <p className="text-xs text-muted-foreground">
                    Diisi manual sesuai buku register paklaring.
                </p>
                <InputError message={errors.no_surat} />
            </div>

            <div className="grid gap-2">
                <FieldLabel htmlFor="signing_lokasi">
                    Lokasi Tanda Tangan
                </FieldLabel>
                <Input {...field('signing_lokasi')} />
                <InputError message={errors.signing_lokasi} />
            </div>

            <div className="grid gap-2">
                <FieldLabel htmlFor="signing_tanggal">Tanggal Surat</FieldLabel>
                <Input type="date" {...field('signing_tanggal')} />
                <InputError message={errors.signing_tanggal} />
            </div>
        </div>
    );
}

/**
 * Flat, single-page rendering of every section — used by the edit form,
 * where a wizard would get in the way of jumping straight to one field.
 */
export function PaklaringFormFields({
    values,
    onChange,
    sites,
    lockedSite,
    errors,
    nrppLookup,
    alasanPhkOptions,
}: SectionProps & {
    sites: Site[];
    lockedSite?: Site | null;
    nrppLookup?: { onSearch: () => void; loading: boolean };
    alasanPhkOptions: string[];
}) {
    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                    Site / Lokasi Kerja &amp; Data Karyawan
                </h3>
                <SiteKaryawanFields
                    values={values}
                    onChange={onChange}
                    errors={errors}
                    sites={sites}
                    lockedSite={lockedSite}
                    nrppLookup={nrppLookup}
                />
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                    Project &amp; Klasifikasi
                </h3>
                <ProjekKlasifikasiFields
                    values={values}
                    onChange={onChange}
                    errors={errors}
                />
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                    Masa Kerja &amp; Pemberhentian
                </h3>
                <MasaKerjaFields
                    values={values}
                    onChange={onChange}
                    errors={errors}
                    alasanPhkOptions={alasanPhkOptions}
                />
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                    Tanda Tangan Surat
                </h3>
                <TandaTanganFields
                    values={values}
                    onChange={onChange}
                    errors={errors}
                />
            </section>
        </div>
    );
}
