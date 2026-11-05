import { Head } from '@inertiajs/react';
import { Check, X } from 'lucide-react';

/** Exactly what VerificationController@show sends — nothing more. */
type PublicPaklaring = {
    no_surat: string;
    nama: string;
    tanggal_terbit: string | null;
    signer_name: string | null;
    signer_title: string | null;
    final_classification: string;
    doh: string | null;
    doe: string | null;
};

const dateLong = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const fmt = (v: string | null) =>
    v ? dateLong.format(new Date(`${v}T00:00:00`)) : '–';

function Rows({ rows }: { rows: [string, string][] }) {
    return (
        <dl className="flex flex-col gap-2.5">
            {rows.map(([k, v]) => (
                <div
                    key={k}
                    className="grid grid-cols-[128px_minmax(0,1fr)] gap-2 text-sm leading-[1.4]"
                >
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="tabular font-semibold [overflow-wrap:anywhere]">
                        {v || '–'}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

const sectionLabel =
    'text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase';

export default function Show({
    valid,
    paklaring,
}: {
    valid: boolean;
    paklaring: PublicPaklaring | null;
}) {
    return (
        <>
            <Head
                title={
                    valid && paklaring
                        ? `Verifikasi ${paklaring.no_surat}`
                        : 'Verifikasi Paklaring'
                }
            />

            <div className="relative isolate flex min-h-svh flex-col items-center gap-5 overflow-hidden bg-background px-4 pt-5 pb-7">
                <img
                    src="/images/topo.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 size-full object-cover object-[0%_50%] opacity-[0.22] mix-blend-multiply dark:opacity-10 dark:mix-blend-normal dark:invert"
                />

                <div className="flex items-center gap-2.5">
                    <img
                        src="/images/logo.png"
                        alt="Logo WBK"
                        className="size-9 object-contain"
                    />
                    <span className="flex flex-col">
                        <span className="text-sm font-extrabold">
                            PT Wahana Bandhawa Kencana
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Verifikasi dokumen
                        </span>
                    </span>
                </div>

                <main className="flex w-full max-w-[480px] flex-col gap-3">
                    {valid && paklaring ? (
                        <>
                            <section
                                aria-live="polite"
                                className="flex flex-col items-center gap-3 rounded-[28px] bg-success-soft px-6 py-8 text-center text-success"
                            >
                                <span className="flex size-[72px] items-center justify-center rounded-full bg-success text-white dark:text-[#141414]">
                                    <Check
                                        className="size-9"
                                        strokeWidth={2.4}
                                        aria-hidden
                                    />
                                </span>
                                <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-[-0.025em]">
                                    Dokumen Asli
                                </h1>
                                <div className="text-[15px] font-semibold">
                                    Terverifikasi
                                </div>
                            </section>

                            <section className="flex flex-col gap-4 rounded-lg bg-card p-5 shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]">
                                <h2 className={sectionLabel}>Identitas surat</h2>
                                <Rows
                                    rows={[
                                        ['No. surat', paklaring.no_surat],
                                        ['Nama', paklaring.nama],
                                        [
                                            'Tanggal terbit',
                                            fmt(paklaring.tanggal_terbit),
                                        ],
                                        [
                                            'Penandatangan',
                                            [
                                                paklaring.signer_name,
                                                paklaring.signer_title,
                                            ]
                                                .filter(Boolean)
                                                .join(' · '),
                                        ],
                                    ]}
                                />
                                <div className="h-px bg-border" />
                                <h2 className={sectionLabel}>Riwayat kerja</h2>
                                <Rows
                                    rows={[
                                        [
                                            'Classification',
                                            paklaring.final_classification,
                                        ],
                                        ['DOH', fmt(paklaring.doh)],
                                        ['DOE', fmt(paklaring.doe)],
                                    ]}
                                />
                            </section>
                        </>
                    ) : (
                        <>
                            <section
                                aria-live="polite"
                                className="flex flex-col items-center gap-3 rounded-[28px] bg-destructive-soft px-6 py-8 text-center text-destructive"
                            >
                                <span className="flex size-[72px] items-center justify-center rounded-full bg-destructive text-white dark:text-[#141414]">
                                    <X
                                        className="size-9"
                                        strokeWidth={2.4}
                                        aria-hidden
                                    />
                                </span>
                                <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-[-0.025em]">
                                    Dokumen tidak ditemukan
                                </h1>
                                <div className="text-[15px] leading-normal font-medium">
                                    Kode verifikasi ini tidak cocok dengan surat
                                    paklaring yang terdaftar.
                                </div>
                            </section>
                            <section className="flex flex-col gap-1.5 rounded-lg bg-card p-5 text-sm leading-normal shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]">
                                <h2 className="text-[15px] font-bold">
                                    Yang bisa dilakukan
                                </h2>
                                <p className="text-muted-foreground">
                                    Pindai ulang QR code pada surat. Jika
                                    hasilnya tetap sama, hubungi bagian HR PT
                                    Wahana Bandhawa Kencana.
                                </p>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </>
    );
}
