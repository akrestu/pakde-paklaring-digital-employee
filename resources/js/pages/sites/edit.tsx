import { Form, Head, Link } from '@inertiajs/react';
import SiteController from '@/actions/App/Http/Controllers/SiteController';
import Heading from '@/components/heading';
import { SiteFormFields } from '@/components/site-form-fields';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/sites';
import type { Site } from '@/types';

export default function Edit({ site }: { site: Site }) {
    return (
        <>
            <Head title={`Edit ${site.name}`} />

            <div className="space-y-6 p-4">
                <Heading title={`Edit Site — ${site.name}`} />

                <Form
                    {...SiteController.update.form(site)}
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <SiteFormFields site={site} errors={errors} />

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
        { title: 'Sites', href: index() },
        { title: 'Edit', href: index() },
    ],
};
