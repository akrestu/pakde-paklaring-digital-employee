import { Form, Head, Link } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { UserFormFields } from '@/components/user-form-fields';
import { index } from '@/routes/users';
import type { Site, User } from '@/types';

export default function Edit({ user, sites }: { user: User; sites: Site[] }) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <div className="space-y-6 p-4">
                <Heading title={`Edit User — ${user.name}`} />

                <Form
                    {...UserController.update.form(user)}
                    className="max-w-xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <UserFormFields
                                user={user}
                                sites={sites}
                                errors={errors}
                            />

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Simpan Perubahan
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

Edit.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'Edit', href: index() },
    ],
};
