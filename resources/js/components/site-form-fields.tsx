import { useState } from 'react';
import { Field } from '@/components/paklaring-form-fields';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Site } from '@/types';

/** Site fields per `screens/SiteForm.html`; is_active is sent as 1 or 0. */
export function SiteFormFields({
    site,
    errors,
}: {
    site?: Site;
    errors: Partial<Record<string, string>>;
}) {
    const [active, setActive] = useState(site?.is_active ?? true);
    const field = (name: keyof Site, value?: string | null) => ({
        id: name,
        name,
        defaultValue: value ?? '',
        'aria-invalid': errors[name] ? true : undefined,
    });

    return (
        <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Field
                    label="Kode"
                    htmlFor="code"
                    error={errors.code}
                    hint="Huruf besar, dipakai di no. surat."
                >
                    <Input
                        {...field('code', site?.code)}
                        placeholder="BAU"
                        required
                        className="tabular uppercase"
                    />
                </Field>
                <Field label="Nama site" htmlFor="name" error={errors.name}>
                    <Input {...field('name', site?.name)} required />
                </Field>
            </div>
            <Field
                label="Nama perusahaan"
                htmlFor="company_name"
                error={errors.company_name}
            >
                <Input
                    {...field('company_name', site?.company_name)}
                    required
                />
            </Field>
            <Field label="Alamat" htmlFor="address" error={errors.address}>
                <Textarea
                    {...field('address', site?.address)}
                    rows={2}
                    required
                />
            </Field>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Field
                    label="Project default"
                    htmlFor="default_project"
                    error={errors.default_project}
                    optional
                >
                    <Input
                        {...field('default_project', site?.default_project)}
                    />
                </Field>
                <Field
                    label="Lokasi default"
                    htmlFor="default_location"
                    error={errors.default_location}
                    optional
                >
                    <Input
                        {...field('default_location', site?.default_location)}
                    />
                </Field>
                <Field
                    label="Nama penandatangan"
                    htmlFor="signer_name"
                    error={errors.signer_name}
                    optional
                >
                    <Input {...field('signer_name', site?.signer_name)} />
                </Field>
                <Field
                    label="Jabatan penandatangan"
                    htmlFor="signer_title"
                    error={errors.signer_title}
                    optional
                >
                    <Input {...field('signer_title', site?.signer_title)} />
                </Field>
            </div>

            <input type="hidden" name="is_active" value={active ? '1' : '0'} />
            <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => setActive((v) => !v)}
                className="flex h-11 items-center gap-2.5 self-start rounded-full border border-border bg-card pr-4 pl-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                Site aktif
            </button>
            <p className="-mt-1.5 text-xs text-muted-foreground">
                Hanya site aktif yang bisa dipilih saat membuat paklaring baru.
            </p>
        </div>
    );
}
