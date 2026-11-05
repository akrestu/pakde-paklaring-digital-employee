import { Form, Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Field } from '@/components/paklaring-form-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Employee, Site } from '@/types';

const toDate = (value?: string | null) => (value ? value.slice(0, 10) : '');

const card = 'rounded-lg bg-card shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]';

const selectClass =
    'h-[50px] w-full rounded-md border-2 border-transparent bg-input px-4 text-[15px] text-foreground outline-none focus-visible:border-foreground focus-visible:bg-card aria-invalid:border-destructive dark:focus-visible:border-accent';

function Group({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className={cn(card, 'flex flex-col gap-4 p-4 md:p-6')}>
            <h2 className="text-base font-bold">{title}</h2>
            <div className="grid gap-3.5 sm:grid-cols-2">{children}</div>
        </section>
    );
}

/**
 * Employee create/edit form per `screens/KaryawanForm.html`: header with an
 * active switch, three field groups, Batal/Simpan footer. Field names match
 * Store/UpdateEmployeeRequest; is_active is always sent as 1 or 0.
 */
export function EmployeeForm({
    form,
    title,
    employee,
    sites,
    lockedSite,
    backHref,
    submitLabel,
}: {
    form: Pick<ComponentProps<typeof Form>, 'action' | 'method'>;
    title: string;
    employee?: Employee;
    sites: Site[];
    lockedSite?: Site | null;
    backHref: NonNullable<InertiaLinkProps['href']>;
    submitLabel: string;
}) {
    const [active, setActive] = useState(employee?.is_active ?? true);
    const [siteId, setSiteId] = useState(
        employee?.site_id ? String(employee.site_id) : '',
    );

    return (
        <Form {...form} className="flex flex-col gap-4 md:gap-5">
            {({ processing, errors }) => {
                const input = (
                    name: keyof Employee,
                    value?: string | null,
                ) => ({
                    id: name,
                    name,
                    defaultValue: value ?? '',
                    'aria-invalid': errors[name] ? true : undefined,
                });

                return (
                    <>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={backHref}
                                aria-label="Kembali ke Daftar Karyawan"
                                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <ArrowLeft
                                    className="size-5"
                                    strokeWidth={1.8}
                                    aria-hidden
                                />
                            </Link>
                            <h1 className="min-w-0 flex-1 truncate text-2xl leading-[1.15] font-extrabold tracking-[-0.025em] md:text-[30px]">
                                {title}
                            </h1>
                            <input
                                type="hidden"
                                name="is_active"
                                value={active ? '1' : '0'}
                            />
                            <button
                                type="button"
                                role="switch"
                                aria-checked={active}
                                onClick={() => setActive((v) => !v)}
                                className="flex h-11 items-center gap-2.5 rounded-full border border-border bg-card pr-4 pl-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <span
                                    aria-hidden
                                    className={cn(
                                        'relative h-6 w-10 rounded-full transition-colors',
                                        active ? 'bg-success' : 'bg-border',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]',
                                            active ? 'left-[18px]' : 'left-0.5',
                                        )}
                                    />
                                </span>
                                {active ? 'Aktif' : 'Nonaktif'}
                            </button>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div
                                role="alert"
                                className="flex items-start gap-2.5 rounded-md bg-destructive-soft px-4 py-3 text-sm font-medium text-destructive"
                            >
                                <CircleAlert
                                    className="mt-0.5 size-[18px] shrink-0"
                                    strokeWidth={1.8}
                                    aria-hidden
                                />
                                Ada isian yang perlu diperbaiki. Periksa kolom
                                yang ditandai merah.
                            </div>
                        )}

                        <Group title="Identitas">
                            <Field
                                label="NRPP"
                                htmlFor="nrpp"
                                error={errors.nrpp}
                            >
                                <Input
                                    {...input('nrpp', employee?.nrpp)}
                                    required
                                    className="tabular"
                                />
                            </Field>
                            <Field
                                label="Nama"
                                htmlFor="nama"
                                error={errors.nama}
                            >
                                <Input
                                    {...input('nama', employee?.nama)}
                                    required
                                />
                            </Field>
                            <Field
                                label="Tempat lahir"
                                htmlFor="tempat_lahir"
                                error={errors.tempat_lahir}
                            >
                                <Input
                                    {...input(
                                        'tempat_lahir',
                                        employee?.tempat_lahir,
                                    )}
                                />
                            </Field>
                            <Field
                                label="Tanggal lahir"
                                htmlFor="tanggal_lahir"
                                error={errors.tanggal_lahir}
                            >
                                <Input
                                    type="date"
                                    {...input(
                                        'tanggal_lahir',
                                        toDate(employee?.tanggal_lahir),
                                    )}
                                    className="tabular"
                                />
                            </Field>
                            <Field
                                label="Alamat"
                                htmlFor="alamat"
                                error={errors.alamat}
                                className="sm:col-span-2"
                            >
                                <Textarea
                                    {...input('alamat', employee?.alamat)}
                                    rows={2}
                                />
                            </Field>
                        </Group>

                        <Group title="Penempatan">
                            {lockedSite ? (
                                <>
                                    <input
                                        type="hidden"
                                        name="site_id"
                                        value={lockedSite.id}
                                    />
                                    <Field label="Site" htmlFor="site_locked">
                                        <Input
                                            id="site_locked"
                                            value={lockedSite.name}
                                            disabled
                                        />
                                    </Field>
                                </>
                            ) : (
                                <Field
                                    label="Site"
                                    htmlFor="site_id"
                                    error={errors.site_id}
                                >
                                    <select
                                        id="site_id"
                                        name="site_id"
                                        value={siteId}
                                        onChange={(e) =>
                                            setSiteId(e.target.value)
                                        }
                                        aria-invalid={
                                            errors.site_id ? true : undefined
                                        }
                                        className={selectClass}
                                    >
                                        <option value="">Pilih site…</option>
                                        {sites.map((site) => (
                                            <option
                                                key={site.id}
                                                value={String(site.id)}
                                            >
                                                {site.name} ({site.code})
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            )}
                            <Field
                                label="Project"
                                htmlFor="project"
                                error={errors.project}
                            >
                                <Input
                                    {...input(
                                        'project',
                                        employee?.project ??
                                            lockedSite?.default_project,
                                    )}
                                />
                            </Field>
                            <Field
                                label="Lokasi"
                                htmlFor="lokasi"
                                error={errors.lokasi}
                            >
                                <Input
                                    {...input(
                                        'lokasi',
                                        employee?.lokasi ??
                                            lockedSite?.default_location,
                                    )}
                                />
                            </Field>
                            <Field
                                label="DOH (tanggal masuk)"
                                htmlFor="doh"
                                error={errors.doh}
                            >
                                <Input
                                    type="date"
                                    {...input('doh', toDate(employee?.doh))}
                                    className="tabular"
                                />
                            </Field>
                        </Group>

                        <Group title="Classification & versatility">
                            <Field
                                label="Beginning classification"
                                htmlFor="beginning_classification"
                                error={errors.beginning_classification}
                            >
                                <Input
                                    {...input(
                                        'beginning_classification',
                                        employee?.beginning_classification,
                                    )}
                                />
                            </Field>
                            <Field
                                label="Classification akhir"
                                htmlFor="classification"
                                error={errors.classification}
                            >
                                <Input
                                    {...input(
                                        'classification',
                                        employee?.classification,
                                    )}
                                />
                            </Field>
                            <Field
                                label="Beginning versatility"
                                htmlFor="beginning_versatility"
                                error={errors.beginning_versatility}
                            >
                                <Input
                                    {...input(
                                        'beginning_versatility',
                                        employee?.beginning_versatility,
                                    )}
                                />
                            </Field>
                            <Field
                                label="Versatility akhir"
                                htmlFor="versatility"
                                error={errors.versatility}
                            >
                                <Input
                                    {...input(
                                        'versatility',
                                        employee?.versatility,
                                    )}
                                />
                            </Field>
                        </Group>

                        <p className="text-xs text-muted-foreground">
                            Hanya NRPP dan nama yang wajib. Kolom lain boleh
                            dilengkapi belakangan, tetapi harus terisi semua
                            sebelum karyawan bisa dibuatkan paklaring batch.
                        </p>

                        <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-full bg-card/95 p-2 shadow-[0_10px_30px_rgba(20,20,20,0.12)] backdrop-blur md:static md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
                            <Button type="button" variant="ghost" asChild>
                                <Link href={backHref}>Batal</Link>
                            </Button>
                            <Button type="submit" loading={processing}>
                                {submitLabel}
                            </Button>
                        </div>
                    </>
                );
            }}
        </Form>
    );
}
