import { Form, Head, Link } from '@inertiajs/react';
import { Info, Upload } from 'lucide-react';
import { useState } from 'react';
import EmployeeController from '@/actions/App/Http/Controllers/EmployeeController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Site } from '@/types';

export default function Import({ sites }: { sites: Site[] }) {
    const [siteId, setSiteId] = useState('none');
    const [fileName, setFileName] = useState<string | null>(null);

    return (
        <>
            <Head title="Import Data Karyawan" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Import Data Karyawan"
                    description="Upload file Excel (.xlsx/.xls). Baris dengan NRPP yang sudah ada akan diperbarui, NRPP baru akan ditambahkan."
                />

                <div className="max-w-xl space-y-6">
                    <Alert>
                        <Info />
                        <AlertTitle>Format kolom yang didukung</AlertTitle>
                        <AlertDescription>
                            <p>
                                nrpp, site, nama, tempat_lahir, tanggal_lahir,
                                alamat, project, lokasi,
                                beginning_classification,
                                beginning_versatility, classification,
                                versatility, doh
                            </p>
                            <p>
                                Kolom <strong>site</strong> diisi kode site
                                (mis. &quot;BAU&quot;) dan otomatis
                                disinkronkan ke site yang sudah terdaftar di
                                aplikasi — tiap baris bisa punya site berbeda.
                                Kalau kosong, dipakai site default yang
                                dipilih di bawah.
                            </p>
                            <p>
                                Template sudah berisi 1 baris contoh pengisian
                                (NRPP &quot;CONTOH001&quot;) sebagai panduan
                                format — baris itu otomatis dilewati saat
                                import walau lupa dihapus.
                            </p>
                            <a
                                href={EmployeeController.template().url}
                                className="font-medium text-primary underline"
                            >
                                Unduh template Excel
                            </a>
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardContent>
                            <Form
                                {...EmployeeController.import.form()}
                                className="space-y-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {sites.length > 1 && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="site_id">
                                                    Site Default (opsional)
                                                </Label>
                                                <Select
                                                    value={siteId}
                                                    onValueChange={setSiteId}
                                                >
                                                    <SelectTrigger
                                                        id="site_id"
                                                        className="w-full"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            Tidak ada default
                                                            — wajib isi kolom
                                                            &quot;site&quot;
                                                            di file
                                                        </SelectItem>
                                                        {sites.map((site) => (
                                                            <SelectItem
                                                                key={site.id}
                                                                value={String(
                                                                    site.id,
                                                                )}
                                                            >
                                                                {site.name} (
                                                                {site.code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <input
                                                    type="hidden"
                                                    name="site_id"
                                                    value={
                                                        siteId === 'none'
                                                            ? ''
                                                            : siteId
                                                    }
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Dipakai untuk baris yang
                                                    kolom &quot;site&quot;-nya
                                                    kosong.
                                                </p>
                                                <InputError
                                                    message={errors.site_id}
                                                />
                                            </div>
                                        )}

                                        {sites.length === 1 && (
                                            <input
                                                type="hidden"
                                                name="site_id"
                                                value={sites[0].id}
                                            />
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="file">
                                                File Excel
                                            </Label>
                                            <label
                                                htmlFor="file"
                                                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30"
                                            >
                                                <Upload className="size-6" />
                                                <span>
                                                    {fileName ?? (
                                                        <>
                                                            Klik untuk pilih
                                                            file Excel
                                                            (.xlsx/.xls)
                                                        </>
                                                    )}
                                                </span>
                                            </label>
                                            <input
                                                id="file"
                                                type="file"
                                                name="file"
                                                accept=".xlsx,.xls"
                                                required
                                                className="sr-only"
                                                onChange={(event) =>
                                                    setFileName(
                                                        event.target.files?.[0]
                                                            ?.name ?? null,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.file}
                                            />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Import
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link
                                                    href={EmployeeController.index()}
                                                >
                                                    Batal
                                                </Link>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Import.layout = {
    breadcrumbs: [
        { title: 'Data Karyawan', href: EmployeeController.index() },
        { title: 'Import', href: EmployeeController.importForm() },
    ],
};
