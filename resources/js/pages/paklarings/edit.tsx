import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import PaklaringController from '@/actions/App/Http/Controllers/PaklaringController';
import Heading from '@/components/heading';
import { PaklaringFormFields } from '@/components/paklaring-form-fields';
import type { PaklaringFormValues } from '@/components/paklaring-form-fields';
import { Button } from '@/components/ui/button';
import { index, show } from '@/routes/paklarings';
import type { Paklaring } from '@/types';

function toDateInputValue(value: string): string {
    return value.slice(0, 10);
}

export default function Edit({
    paklaring,
    alasanPhkOptions,
}: {
    paklaring: Paklaring;
    alasanPhkOptions: string[];
}) {
    const [values, setValues] = useState<PaklaringFormValues>({
        site_id: String(paklaring.site_id),
        no_surat: paklaring.no_surat,
        nrpp: paklaring.nrpp,
        nama: paklaring.nama,
        tempat_lahir: paklaring.tempat_lahir,
        tanggal_lahir: toDateInputValue(paklaring.tanggal_lahir),
        alamat: paklaring.alamat,
        project: paklaring.project,
        lokasi: paklaring.lokasi,
        beginning_classification: paklaring.beginning_classification,
        beginning_versatility: paklaring.beginning_versatility,
        final_classification: paklaring.final_classification,
        final_versatility: paklaring.final_versatility,
        alasan_phk: paklaring.alasan_phk,
        doh: toDateInputValue(paklaring.doh),
        doe: toDateInputValue(paklaring.doe),
        remarks: paklaring.remarks ?? '',
        signing_lokasi: paklaring.signing_lokasi,
        signing_tanggal: toDateInputValue(paklaring.signing_tanggal),
    });

    function handleChange<K extends keyof PaklaringFormValues>(
        field: K,
        value: PaklaringFormValues[K],
    ) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <>
            <Head title={`Edit ${paklaring.no_surat}`} />

            <div className="space-y-6 p-4">
                <Heading
                    title={`Edit Paklaring — ${paklaring.no_surat}`}
                    description="PDF akan dibuat ulang otomatis setelah perubahan disimpan."
                />

                <Form
                    {...PaklaringController.update.form(paklaring)}
                    className="max-w-3xl space-y-8"
                >
                    {({ processing, errors }) => (
                        <>
                            <PaklaringFormFields
                                values={values}
                                onChange={handleChange}
                                sites={[]}
                                lockedSite={paklaring.site}
                                errors={errors}
                                alasanPhkOptions={alasanPhkOptions}
                            />

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Simpan Perubahan
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={show(paklaring)}>Batal</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Paklaring', href: index() },
        { title: 'Edit', href: index() },
    ],
};
