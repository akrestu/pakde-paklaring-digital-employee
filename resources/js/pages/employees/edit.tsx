import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import { EmployeeFormFields } from '@/components/employee-form-fields';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { Auth, Employee, Site } from '@/types';

export default function Edit({
    employee,
    sites,
}: {
    employee: Employee;
    sites: Site[];
}) {
    const {
        props: { auth },
    } = usePage<{ auth: Auth }>();
    const isSuperAdmin = auth.user.role === 'super_admin';

    return (
        <>
            <Head title={`Edit ${employee.nama}`} />

            <div className="space-y-6 p-4 pb-24">
                <Link
                    href={EmployeeController.index()}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Data Karyawan
                </Link>

                <Heading title={`Edit Karyawan — ${employee.nama}`} />

                <Form
                    {...EmployeeController.update.form(employee)}
                    className="max-w-3xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive">
                                    <CircleAlert />
                                    <AlertTitle>
                                        Ada isian yang perlu diperbaiki
                                    </AlertTitle>
                                    <AlertDescription>
                                        Periksa kembali kolom yang ditandai
                                        merah di bawah sebelum menyimpan.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <EmployeeFormFields
                                employee={employee}
                                sites={sites}
                                lockedSite={
                                    isSuperAdmin ? null : employee.site
                                }
                                errors={errors}
                            />

                            <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80">
                                <Button type="submit" disabled={processing}>
                                    Simpan Perubahan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                >
                                    <Link href={EmployeeController.index()}>
                                        Batal
                                    </Link>
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
        { title: 'Data Karyawan', href: EmployeeController.index() },
        { title: 'Edit', href: EmployeeController.index() },
    ],
};
