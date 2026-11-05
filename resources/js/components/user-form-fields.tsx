import { useState } from 'react';
import InputError from '@/components/input-error';
import { Field } from '@/components/paklaring-form-fields';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Site, User } from '@/types';

const ROLES = [
    {
        value: 'super_admin',
        label: 'Super Admin',
        description: 'Semua site, pengguna, dan data',
    },
    {
        value: 'site_admin',
        label: 'Site Admin',
        description: 'Hanya karyawan dan paklaring site-nya',
    },
] as const;

const selectClass =
    'h-[50px] w-full rounded-md border-2 border-transparent bg-input px-4 text-[15px] text-foreground outline-none focus-visible:border-foreground focus-visible:bg-card aria-invalid:border-destructive dark:focus-visible:border-accent';

/** User fields per `screens/PenggunaForm.html`. Password stays; site only for Site Admin. */
export function UserFormFields({
    user,
    sites,
    errors,
}: {
    user?: User;
    sites: Pick<Site, 'id' | 'name'>[];
    errors: Partial<Record<string, string>>;
}) {
    const [role, setRole] = useState<'super_admin' | 'site_admin'>(
        user?.role ?? 'site_admin',
    );

    return (
        <div className="flex flex-col gap-3.5">
            <Field label="Nama" htmlFor="name" error={errors.name}>
                <Input
                    id="name"
                    name="name"
                    defaultValue={user?.name}
                    aria-invalid={errors.name ? true : undefined}
                    required
                />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email}>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    defaultValue={user?.email}
                    aria-invalid={errors.email ? true : undefined}
                    required
                />
            </Field>
            <Field
                label="Password"
                htmlFor="password"
                error={errors.password}
                hint={user ? 'Kosongkan jika tidak diubah.' : undefined}
            >
                <Input
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    aria-invalid={errors.password ? true : undefined}
                    required={!user}
                />
            </Field>

            <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-[13px] font-semibold">Role</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {ROLES.map((r) => {
                        const on = role === r.value;

                        return (
                            <label
                                key={r.value}
                                className={cn(
                                    'flex cursor-pointer flex-col gap-1 rounded-md px-3.5 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                    on
                                        ? 'border-2 border-primary bg-accent-soft'
                                        : 'border border-border bg-card hover:bg-muted',
                                )}
                            >
                                <span className="flex items-center gap-2 text-sm font-bold">
                                    <input
                                        type="radio"
                                        name="role"
                                        value={r.value}
                                        checked={on}
                                        onChange={() => setRole(r.value)}
                                        className="size-[18px] accent-[var(--primary)]"
                                    />
                                    {r.label}
                                </span>
                                <span className="pl-[26px] text-xs text-muted-foreground">
                                    {r.description}
                                </span>
                            </label>
                        );
                    })}
                </div>
                <InputError message={errors.role} />
            </fieldset>

            {role === 'site_admin' && (
                <Field label="Site" htmlFor="site_id" error={errors.site_id}>
                    <select
                        id="site_id"
                        name="site_id"
                        defaultValue={user?.site_id ?? ''}
                        aria-invalid={errors.site_id ? true : undefined}
                        className={selectClass}
                        required
                    >
                        <option value="" disabled>
                            Pilih site…
                        </option>
                        {sites.map((site) => (
                            <option key={site.id} value={site.id}>
                                {site.name}
                            </option>
                        ))}
                    </select>
                </Field>
            )}
        </div>
    );
}
