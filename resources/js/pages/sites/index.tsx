import { Form, Head } from '@inertiajs/react';
import { MapPin, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import SiteController from '@/actions/App/Http/Controllers/SiteController';
import { FormSheet } from '@/components/form-sheet';
import { SiteFormFields } from '@/components/site-form-fields';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Site } from '@/types';

type SiteRow = Site & { paklarings_count?: number };

const card = 'rounded-lg bg-card shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]';
const GRID =
    'grid grid-cols-[90px_minmax(140px,1fr)_minmax(180px,1.4fr)_minmax(180px,1.3fr)_100px_44px] items-center gap-3 px-4';

function signer(site: Site): string {
    return (
        [site.signer_name, site.signer_title].filter(Boolean).join(' · ') || '–'
    );
}

function StatusPill({ active }: { active: boolean }) {
    return (
        <span
            className={cn(
                'inline-block rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                active
                    ? 'bg-success-soft text-success'
                    : 'bg-muted text-muted-foreground',
            )}
        >
            {active ? 'Aktif' : 'Nonaktif'}
        </span>
    );
}

export default function Index({ sites }: { sites: SiteRow[] }) {
    // null = closed, 'new' = create, otherwise the site being edited.
    const [editing, setEditing] = useState<SiteRow | 'new' | null>(null);
    const site = editing && editing !== 'new' ? editing : undefined;

    return (
        <>
            <Head title="Site" />

            <div className="flex flex-col gap-2.5 md:gap-[18px]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="hidden flex-col gap-1 md:flex">
                        <h1 className="text-[30px] leading-[1.15] font-extrabold tracking-[-0.025em]">
                            Site
                        </h1>
                        <div className="text-sm text-muted-foreground">
                            Data perusahaan dan penandatangan untuk tiap site.
                        </div>
                    </div>
                    <Button
                        variant="accent"
                        className="font-bold"
                        onClick={() => setEditing('new')}
                    >
                        <Plus />
                        Tambah Site
                    </Button>
                </div>

                {sites.length === 0 ? (
                    <div
                        className={cn(
                            card,
                            'flex flex-col items-center gap-3 px-6 py-14 text-center',
                        )}
                    >
                        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <MapPin
                                className="size-6 text-muted-foreground"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                        </span>
                        <div className="text-base font-bold">
                            Belum ada site
                        </div>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Tambahkan site pertama beserta penandatangan
                            suratnya.
                        </p>
                    </div>
                ) : (
                    <>
                        <ul className="flex flex-col gap-2.5 md:hidden">
                            {sites.map((s) => (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => setEditing(s)}
                                        className={cn(
                                            card,
                                            'flex w-full flex-col gap-1.5 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                        )}
                                    >
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="truncate text-[15px] font-bold">
                                                {s.name}
                                            </span>
                                            <StatusPill active={s.is_active} />
                                        </span>
                                        <span className="tabular text-xs font-semibold text-muted-foreground">
                                            {s.code} · {s.company_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {signer(s)}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <section
                            className={cn(
                                card,
                                'hidden overflow-hidden md:block',
                            )}
                        >
                            <div className="overflow-x-auto">
                                <div
                                    role="table"
                                    aria-label="Daftar site"
                                    className="min-w-[820px]"
                                >
                                    <div
                                        role="row"
                                        className={cn(
                                            GRID,
                                            'bg-muted py-2.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase',
                                        )}
                                    >
                                        <span role="columnheader">Kode</span>
                                        <span role="columnheader">Nama</span>
                                        <span role="columnheader">
                                            Perusahaan
                                        </span>
                                        <span role="columnheader">
                                            Penandatangan
                                        </span>
                                        <span role="columnheader">Status</span>
                                        <span
                                            role="columnheader"
                                            className="sr-only"
                                        >
                                            Aksi
                                        </span>
                                    </div>
                                    {sites.map((s) => (
                                        <div
                                            key={s.id}
                                            role="row"
                                            className={cn(
                                                GRID,
                                                'border-t border-border py-2 text-[13px]',
                                            )}
                                        >
                                            <span
                                                role="cell"
                                                className="tabular font-bold"
                                            >
                                                {s.code}
                                            </span>
                                            <span
                                                role="cell"
                                                className="truncate text-sm font-semibold"
                                            >
                                                {s.name}
                                            </span>
                                            <span
                                                role="cell"
                                                className="truncate"
                                            >
                                                {s.company_name}
                                            </span>
                                            <span
                                                role="cell"
                                                className="truncate"
                                            >
                                                {signer(s)}
                                            </span>
                                            <span role="cell">
                                                <StatusPill
                                                    active={s.is_active}
                                                />
                                            </span>
                                            <span role="cell">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditing(s)
                                                    }
                                                    aria-label={`Edit ${s.name}`}
                                                    className="flex size-10 items-center justify-center rounded-full outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    <Pencil
                                                        className="size-[18px]"
                                                        strokeWidth={1.8}
                                                        aria-hidden
                                                    />
                                                </button>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>

            <FormSheet
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                title={site ? `Edit ${site.name}` : 'Tambah Site'}
            >
                {editing !== null && (
                    <Form
                        key={site?.id ?? 'new'}
                        {...(site
                            ? SiteController.update.form(site)
                            : SiteController.store.form())}
                        onSuccess={() => setEditing(null)}
                        className="flex flex-col gap-5 pt-2"
                    >
                        {({ processing, errors }) => (
                            <>
                                <SiteFormFields site={site} errors={errors} />
                                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setEditing(null)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" loading={processing}>
                                        Simpan
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                )}
                {site && (
                    <Form
                        {...SiteController.destroy.form(site)}
                        onSuccess={() => setEditing(null)}
                        onBefore={() =>
                            window.confirm(
                                `Hapus site ${site.name}? Site yang masih punya paklaring atau pengguna tidak bisa dihapus.`,
                            )
                        }
                        className="mt-6 border-t border-border pt-4"
                    >
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="ghost"
                                loading={processing}
                                className="text-destructive hover:bg-destructive-soft hover:text-destructive"
                            >
                                Hapus site
                            </Button>
                        )}
                    </Form>
                )}
            </FormSheet>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Site', href: SiteController.index() }],
};
