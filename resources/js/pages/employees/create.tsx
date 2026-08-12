import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import { EmployeeFormFields } from '@/components/employee-form-fields';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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

            <div className="space-y-6 p-4 pb-24">
                <Link
                    href={EmployeeController.index()}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Data Karyawan
                </Link>

                <Heading
                    title="Tambah Karyawan"
                    description="Data ini dipakai untuk auto-fill saat membuat paklaring lewat NRPP. Kolom bertanda * wajib diisi, sisanya boleh dilengkapi belakangan."
                />

                <Form
                    {...EmployeeController.store.form()}
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
                                sites={sites}
                                lockedSite={userSite}
                                errors={errors}
                            />

                            <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80">
                                <Button type="submit" disabled={processing}>
                                    Simpan
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

Create.layout = {
    breadcrumbs: [
        { title: 'Data Karyawan', href: EmployeeController.index() },
        { title: 'Tambah Karyawan', href: EmployeeController.index() },
    ],
};
