import { Form, Head, Link } from '@inertiajs/react';
import SiteController from '@/actions/App/Http/Controllers/SiteController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { create, edit, index } from '@/routes/sites';
import type { Site } from '@/types';

export default function Index({ sites }: { sites: Site[] }) {
    return (
        <>
            <Head title="Sites" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        title="Sites"
                        description="Kelola site / proyek dan penandatangan paklaring tiap site."
                    />
                    <Button asChild>
                        <Link href={create()}>Tambah Site</Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2 font-medium">Kode</th>
                                <th className="px-4 py-2 font-medium">
                                    Nama Site
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Perusahaan
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Penandatangan
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Paklaring
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sites.map((site) => (
                                <tr key={site.id}>
                                    <td className="px-4 py-2 font-medium">
                                        {site.code}
                                    </td>
                                    <td className="px-4 py-2">{site.name}</td>
                                    <td className="px-4 py-2">
                                        {site.company_name}
                                    </td>
                                    <td className="px-4 py-2">
                                        {site.signer_name}
                                    </td>
                                    <td className="px-4 py-2">
                                        {site.paklarings_count}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs ${
                                                site.is_active
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {site.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right whitespace-nowrap">
                                        <Link
                                            href={edit(site)}
                                            className="text-primary underline"
                                        >
                                            Edit
                                        </Link>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button className="ml-3 text-destructive underline">
                                                    Hapus
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogTitle>
                                                    Hapus site {site.name}?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Site hanya bisa dihapus jika
                                                    belum memiliki paklaring
                                                    atau user.
                                                </DialogDescription>
                                                <Form
                                                    {...SiteController.destroy.form(
                                                        site,
                                                    )}
                                                >
                                                    {({ processing }) => (
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose
                                                                asChild
                                                            >
                                                                <Button variant="secondary">
                                                                    Batal
                                                                </Button>
                                                            </DialogClose>
                                                            <Button
                                                                variant="destructive"
                                                                type="submit"
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </DialogFooter>
                                                    )}
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    </td>
                                </tr>
                            ))}

                            {sites.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        Belum ada site.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Sites', href: index() }],
};
