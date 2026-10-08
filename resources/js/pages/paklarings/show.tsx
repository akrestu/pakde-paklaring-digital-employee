import { Form, Head, Link } from '@inertiajs/react';
import { Download, Printer } from 'lucide-react';
import { useState } from 'react';
import PaklaringController from '@/actions/App/Http/Controllers/PaklaringController';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { edit, index, pdf } from '@/routes/paklarings';
import type { Paklaring } from '@/types';

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="text-sm">{value}</dd>
        </div>
    );
}

export default function Show({
    paklaring,
    verificationUrl,
}: {
    paklaring: Paklaring;
    verificationUrl: string;
}) {
    const [paperSize, setPaperSize] = useState<'f4' | 'a4'>('f4');
    const previewUrl = pdf(paklaring, {
        query: { paper_size: paperSize },
    }).url;
    const downloadUrl = pdf(paklaring, {
        query: { paper_size: paperSize, download: 1 },
    }).url;

    return (
        <>
            <Head title={paklaring.no_surat} />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={paklaring.no_surat}
                        description={`${paklaring.nama} — ${paklaring.site?.name ?? ''}`}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={paperSize}
                            onValueChange={(value: 'f4' | 'a4') =>
                                setPaperSize(value)
                            }
                        >
                            <SelectTrigger
                                className="w-[170px]"
                                aria-label="Ukuran kertas"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="f4">
                                    F4 (210 x 330 mm)
                                </SelectItem>
                                <SelectItem value="a4">
                                    A4 (210 x 297 mm)
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Button asChild variant="outline">
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Printer />
                                Cetak
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a href={downloadUrl}>
                                <Download />
                                Export PDF
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={edit(paklaring)}>Edit</Link>
                        </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive">Hapus</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>Hapus paklaring ini?</DialogTitle>
                                <DialogDescription>
                                    Tindakan ini tidak bisa dibatalkan. PDF dan
                                    link verifikasi untuk {paklaring.no_surat}{' '}
                                    akan dihapus permanen.
                                </DialogDescription>

                                <Form
                                    {...PaklaringController.destroy.form(
                                        paklaring,
                                    )}
                                >
                                    {({ processing }) => (
                                        <DialogFooter className="gap-2">
                                            <DialogClose asChild>
                                                <Button variant="secondary">
                                                    Batal
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                variant="destructive"
                                                disabled={processing}
                                                type="submit"
                                            >
                                                Hapus
                                            </Button>
                                        </DialogFooter>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>

                        <Button asChild variant="outline">
                            <Link href={index()}>Kembali</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border p-4">
                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                Data Karyawan
                            </h3>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <Field label="NRPP" value={paklaring.nrpp} />
                                <Field label="Nama" value={paklaring.nama} />
                                <Field
                                    label="Tempat, Tanggal Lahir"
                                    value={`${paklaring.tempat_lahir}, ${paklaring.tanggal_lahir.slice(0, 10)}`}
                                />
                                <Field
                                    label="Site"
                                    value={paklaring.site?.name ?? '-'}
                                />
                                <Field
                                    label="Alamat"
                                    value={paklaring.alamat}
                                />
                            </dl>
                        </div>

                        <div className="rounded-xl border p-4">
                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                Project &amp; Klasifikasi
                            </h3>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Project"
                                    value={paklaring.project}
                                />
                                <Field
                                    label="Lokasi Proyek"
                                    value={paklaring.lokasi}
                                />
                                <Field
                                    label="Beginning Classification"
                                    value={paklaring.beginning_classification}
                                />
                                <Field
                                    label="Beginning Versatility"
                                    value={paklaring.beginning_versatility}
                                />
                                <Field
                                    label="Final Classification"
                                    value={paklaring.final_classification}
                                />
                                <Field
                                    label="Final Versatility"
                                    value={paklaring.final_versatility}
                                />
                            </dl>
                        </div>

                        <div className="rounded-xl border p-4">
                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                Masa Kerja &amp; Pemberhentian
                            </h3>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="DOH"
                                    value={paklaring.doh.slice(0, 10)}
                                />
                                <Field
                                    label="DOE"
                                    value={paklaring.doe.slice(0, 10)}
                                />
                                <Field
                                    label="Alasan PHK"
                                    value={paklaring.alasan_phk}
                                />
                                <Field
                                    label="Remarks"
                                    value={paklaring.remarks || '- - -'}
                                />
                            </dl>
                        </div>

                        <div className="overflow-hidden rounded-xl border">
                            <iframe
                                key={previewUrl}
                                src={previewUrl}
                                title={`Preview PDF ukuran ${paperSize.toUpperCase()}`}
                                className="h-[600px] w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border p-4">
                            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                                Verifikasi QR
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Setiap paklaring memiliki halaman verifikasi
                                publik yang bisa diakses siapa saja lewat QR
                                code pada dokumen.
                            </p>
                            <a
                                href={verificationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block truncate text-sm text-primary underline"
                            >
                                {verificationUrl}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [{ title: 'Paklaring', href: index() }],
};
