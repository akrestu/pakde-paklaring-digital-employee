import { Head } from '@inertiajs/react';
import VerificationController from '@/actions/App/Http/Controllers/VerificationController';
import type { Paklaring } from '@/types';

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-b-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

export default function Show({
    valid,
    paklaring,
}: {
    valid: boolean;
    paklaring: Paklaring | null;
}) {
    return (
        <>
            <Head
                title={
                    valid
                        ? `Verifikasi ${paklaring?.no_surat}`
                        : 'Verifikasi Paklaring'
                }
            />

            <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
                <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-sm">
                    <div className="mb-4 text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                        PT. Wahana Bandhawa Kencana
                    </div>

                    {valid && paklaring ? (
                        <>
                            <div className="mb-6 flex flex-col items-center gap-2 text-center">
                                <div className="flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="size-8"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h1 className="text-lg font-semibold">
                                    Dokumen Terverifikasi Asli
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Surat paklaring ini tercatat resmi di sistem
                                    PT. Wahana Bandhawa Kencana.
                                </p>
                            </div>

                            <div className="rounded-xl border p-4">
                                <Row
                                    label="No Surat"
                                    value={paklaring.no_surat}
                                />
                                <Row label="Nama" value={paklaring.nama} />
                                <Row label="NRPP" value={paklaring.nrpp} />
                                <Row
                                    label="Site"
                                    value={paklaring.site?.name ?? '-'}
                                />
                                <Row
                                    label="Masa Kerja"
                                    value={`${paklaring.doh.slice(0, 10)} s/d ${paklaring.doe.slice(0, 10)}`}
                                />
                                <Row
                                    label="Tanggal Surat"
                                    value={paklaring.signing_tanggal.slice(
                                        0,
                                        10,
                                    )}
                                />
                            </div>

                            <a
                                href={VerificationController.download.url(
                                    paklaring.verification_token,
                                )}
                                className="mt-4 block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Unduh PDF Resmi
                            </a>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="size-8"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-lg font-semibold">
                                Dokumen Tidak Ditemukan
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Kode verifikasi tidak valid atau dokumen ini
                                tidak tercatat di sistem kami.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
