import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    Link2,
    Pencil,
    Printer,
    QrCode,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import PaklaringController from '@/actions/App/Http/Controllers/PaklaringController';
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
import { useClipboard } from '@/hooks/use-clipboard';
import { cn } from '@/lib/utils';
import { edit, index, pdf } from '@/routes/paklarings';
import type { Paklaring } from '@/types';

const dateLong = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const fmt = (v: string | null | undefined) =>
    v ? dateLong.format(new Date(`${v.slice(0, 10)}T00:00:00`)) : '–';

const card = 'rounded-lg bg-card shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]';

function Group({ title, items }: { title: string; items: [string, string][] }) {
    return (
        <section className={cn(card, 'flex flex-col gap-3 p-4 md:p-5')}>
            <h2 className="text-[15px] font-bold">{title}</h2>
            <dl className="flex flex-col gap-2">
                {items.map(([k, v]) => (
                    <div
                        key={k}
                        className="grid grid-cols-[118px_minmax(0,1fr)] gap-2 text-[13px] leading-[1.4]"
                    >
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="font-semibold [overflow-wrap:anywhere]">
                            {v || '–'}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
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
    const [, copy] = useClipboard();
    const previewUrl = pdf(paklaring, {
        query: { paper_size: paperSize },
    }).url;
    const downloadUrl = pdf(paklaring, {
        query: { paper_size: paperSize, download: 1 },
    }).url;

    async function copyLink() {
        const ok = await copy(verificationUrl);

        if (ok) {
            toast.success('Link verifikasi disalin');
        } else {
            toast.error('Gagal menyalin link. Salin manual dari panel QR.');
        }
    }

    let verifyPath = verificationUrl;

    try {
        verifyPath = new URL(verificationUrl).pathname;
    } catch {
        // keep the full string
    }

    return (
        <>
            <Head title={paklaring.no_surat} />

            <div className="flex flex-col gap-4 md:gap-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link
                            href={index()}
                            aria-label="Kembali ke Daftar Paklaring"
                            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ArrowLeft
                                className="size-5"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                        </Link>
                        <div className="flex min-w-0 flex-col">
                            <h1 className="tabular truncate text-xl leading-[1.15] font-extrabold tracking-[-0.025em] md:text-[26px]">
                                {paklaring.no_surat}
                            </h1>
                            <div className="tabular truncate text-[13px] text-muted-foreground">
                                {paklaring.nama} · NRPP {paklaring.nrpp}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={paperSize}
                            onChange={(e) =>
                                setPaperSize(e.target.value as 'f4' | 'a4')
                            }
                            aria-label="Ukuran kertas"
                            className="h-11 rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="f4">F4 (210 × 330 mm)</option>
                            <option value="a4">A4 (210 × 297 mm)</option>
                        </select>
                        <Button variant="outline" onClick={copyLink}>
                            <Link2 />
                            <span className="hidden sm:inline">
                                Salin link verifikasi
                            </span>
                            <span className="sm:hidden">Salin link</span>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={edit(paklaring)}>
                                <Pencil />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Printer />
                                Cetak
                            </a>
                        </Button>
                        <Button variant="accent" className="font-bold" asChild>
                            <a href={downloadUrl}>
                                <Download />
                                Unduh PDF
                            </a>
                        </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Hapus paklaring"
                                    className="text-destructive hover:bg-destructive-soft hover:text-destructive"
                                >
                                    <Trash2 />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-xl">
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
                                                <Button variant="outline">
                                                    Batal
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                variant="destructive"
                                                loading={processing}
                                                type="submit"
                                            >
                                                Hapus
                                            </Button>
                                        </DialogFooter>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-5">
                    <section
                        aria-label="Pratinjau surat"
                        className={cn(card, 'overflow-hidden p-2 md:p-3')}
                    >
                        <iframe
                            key={previewUrl}
                            src={previewUrl}
                            title={`Pratinjau PDF ukuran ${paperSize.toUpperCase()}`}
                            className="h-[520px] w-full rounded-md bg-muted md:h-[calc(100svh-200px)] md:min-h-[640px]"
                        />
                    </section>

                    <aside className="flex flex-col gap-3">
                        <section className={cn(card, 'flex gap-4 p-4 md:p-5')}>
                            <div className="flex size-[88px] shrink-0 items-center justify-center rounded-md bg-muted">
                                <QrCode
                                    className="size-12"
                                    strokeWidth={1.4}
                                    aria-hidden
                                />
                            </div>
                            <div className="flex min-w-0 flex-col gap-1">
                                <div className="text-[15px] font-bold">
                                    QR verifikasi
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Publik dapat memindai untuk memeriksa
                                    keaslian surat.
                                </div>
                                <a
                                    href={verificationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="tabular mt-1 truncate text-xs font-semibold underline underline-offset-2"
                                >
                                    {verifyPath}
                                </a>
                            </div>
                        </section>

                        <Group
                            title="Karyawan"
                            items={[
                                ['Nama', paklaring.nama],
                                ['NRPP', paklaring.nrpp],
                                [
                                    'Tempat, tgl lahir',
                                    `${paklaring.tempat_lahir}, ${fmt(paklaring.tanggal_lahir)}`,
                                ],
                                ['Alamat', paklaring.alamat],
                                ['Project', paklaring.project],
                                ['Lokasi', paklaring.lokasi],
                            ]}
                        />
                        <Group
                            title="Data kerja"
                            items={[
                                [
                                    'Classification',
                                    `${paklaring.beginning_classification} → ${paklaring.final_classification}`,
                                ],
                                [
                                    'Versatility',
                                    `${paklaring.beginning_versatility} → ${paklaring.final_versatility}`,
                                ],
                                ['Alasan PHK', paklaring.alasan_phk],
                                ['DOH', fmt(paklaring.doh)],
                                ['DOE', fmt(paklaring.doe)],
                                ['Remarks', paklaring.remarks ?? ''],
                            ]}
                        />
                        <Group
                            title="Penandatanganan"
                            items={[
                                ['Lokasi', paklaring.signing_lokasi],
                                ['Tanggal', fmt(paklaring.signing_tanggal)],
                                [
                                    'Penandatangan',
                                    [
                                        paklaring.site?.signer_name,
                                        paklaring.site?.signer_title,
                                    ]
                                        .filter(Boolean)
                                        .join(' · '),
                                ],
                                [
                                    'Dibuat oleh',
                                    [
                                        paklaring.creator?.name,
                                        paklaring.site?.name,
                                    ]
                                        .filter(Boolean)
                                        .join(' · '),
                                ],
                            ]}
                        />
                    </aside>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [{ title: 'Detail Paklaring', href: index() }],
};
