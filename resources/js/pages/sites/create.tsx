import { Form, Head, Link } from '@inertiajs/react';
import SiteController from '@/actions/App/Http/Controllers/SiteController';
import Heading from '@/components/heading';
import { SiteFormFields } from '@/components/site-form-fields';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/sites';

export default function Create() {
    return (
        <>
            <Head title="Tambah Site" />

            <div className="space-y-6 p-4">
                <Heading title="Tambah Site" />

                <Form
                    {...SiteController.store.form()}
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <SiteFormFields errors={errors} />

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
        { title: 'Sites', href: index() },
        { title: 'Tambah Site', href: index() },
    ],
};
