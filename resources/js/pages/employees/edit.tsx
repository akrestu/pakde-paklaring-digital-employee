import { Head, usePage } from '@inertiajs/react';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import { EmployeeForm } from '@/components/employee-form-fields';
import type { Auth, Employee, Site } from '@/types';

export default function Edit({
    employee,
    sites,
}: {
    employee: Employee;
    sites: Site[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = auth.user.role === 'super_admin';

    return (
        <>
            <Head title={`Edit ${employee.nama}`} />

            <EmployeeForm
                form={EmployeeController.update.form(employee)}
                title="Edit Karyawan"
                employee={employee}
                sites={sites}
                lockedSite={isSuperAdmin ? null : employee.site}
                backHref={EmployeeController.index()}
                submitLabel="Simpan perubahan"
            />
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Daftar Karyawan', href: EmployeeController.index() },
        { title: 'Edit Karyawan', href: EmployeeController.index() },
    ],
};
