import { Head } from '@inertiajs/react';
import PaklaringController from '@/actions/App/Http/Controllers/PaklaringController';
import { PaklaringWizard } from '@/components/paklaring-wizard';
import { index, show } from '@/routes/paklarings';
import type { Paklaring } from '@/types';

const toDate = (value: string | null | undefined) =>
    value ? value.slice(0, 10) : '';

export default function Edit({
    paklaring,
    alasanPhkOptions,
}: {
    paklaring: Paklaring;
    alasanPhkOptions: string[];
}) {
    return (
        <>
            <Head title={`Edit ${paklaring.no_surat}`} />

            <PaklaringWizard
                mode="edit"
                form={PaklaringController.update.form(paklaring)}
                initialValues={{
                    site_id: String(paklaring.site_id),
                    no_surat: paklaring.no_surat,
                    nrpp: paklaring.nrpp,
                    nama: paklaring.nama,
                    tempat_lahir: paklaring.tempat_lahir,
                    tanggal_lahir: toDate(paklaring.tanggal_lahir),
                    alamat: paklaring.alamat,
                    project: paklaring.project,
                    lokasi: paklaring.lokasi,
                    beginning_classification:
                        paklaring.beginning_classification,
                    beginning_versatility: paklaring.beginning_versatility,
                    final_classification: paklaring.final_classification,
                    final_versatility: paklaring.final_versatility,
                    alasan_phk: paklaring.alasan_phk,
                    doh: toDate(paklaring.doh),
                    doe: toDate(paklaring.doe),
                    remarks: paklaring.remarks ?? '',
                    signing_lokasi: paklaring.signing_lokasi,
                    signing_tanggal: toDate(paklaring.signing_tanggal),
                }}
                sites={[]}
                lockedSite={paklaring.site}
                alasanPhkOptions={alasanPhkOptions}
                backHref={show(paklaring)}
                backLabel="Kembali ke detail paklaring"
            />
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Daftar Paklaring', href: index() },
        { title: 'Edit Paklaring', href: index() },
    ],
};
