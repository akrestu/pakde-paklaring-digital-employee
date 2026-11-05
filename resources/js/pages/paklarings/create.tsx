import { Head } from '@inertiajs/react';
import PaklaringController from '@/actions/App/Http/Controllers/PaklaringController';
import { emptyPaklaringFormValues } from '@/components/paklaring-form-fields';
import { PaklaringWizard } from '@/components/paklaring-wizard';
import { index } from '@/routes/paklarings';
import type { Site } from '@/types';

export default function Create({
    sites,
    userSite,
    alasanPhkOptions,
}: {
    sites: Site[];
    userSite: Site | null;
    alasanPhkOptions: string[];
}) {
    return (
        <>
            <Head title="Buat Paklaring" />

            <PaklaringWizard
                mode="create"
                form={PaklaringController.store.form()}
                initialValues={{
                    ...emptyPaklaringFormValues,
                    site_id: userSite ? String(userSite.id) : '',
                    project: userSite?.default_project ?? '',
                    lokasi: userSite?.default_location ?? '',
                    signing_lokasi: userSite?.default_location ?? '',
                }}
                sites={sites}
                lockedSite={userSite}
                alasanPhkOptions={alasanPhkOptions}
                backHref={index()}
                backLabel="Kembali ke Daftar Paklaring"
                enableLookup
            />
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Daftar Paklaring', href: index() },
        { title: 'Buat Paklaring', href: index() },
    ],
};
