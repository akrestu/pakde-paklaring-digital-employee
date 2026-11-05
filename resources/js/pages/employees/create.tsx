import { Head } from '@inertiajs/react';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import { EmployeeForm } from '@/components/employee-form-fields';
import type { Site } from '@/types';

export default function Create({
    sites,
    userSite,
}: {
    sites: Site[];
    userSite: Site | null;
}) {
    return (
        <>
            <Head title="Tambah Karyawan" />

            <EmployeeForm
                form={EmployeeController.store.form()}
                title="Tambah Karyawan"
                sites={sites}
                lockedSite={userSite}
                backHref={EmployeeController.index()}
                submitLabel="Simpan"
            />
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Daftar Karyawan', href: EmployeeController.index() },
        { title: 'Tambah Karyawan', href: EmployeeController.index() },
    ],
};
