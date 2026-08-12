import { Form, Head, Link } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { UserFormFields } from '@/components/user-form-fields';
import { index } from '@/routes/users';
import type { Site } from '@/types';

export default function Create({ sites }: { sites: Site[] }) {
    return (
        <>
            <Head title="Tambah User" />

            <div className="space-y-6 p-4">
                <Heading title="Tambah User" />

                <Form
                    {...UserController.store.form()}
                    className="max-w-xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <UserFormFields sites={sites} errors={errors} />

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Simpan
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={index()}>Batal</Link>
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
        { title: 'Users', href: index() },
        { title: 'Tambah User', href: index() },
    ],
};
