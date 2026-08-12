import { useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Site, User } from '@/types';

const selectClassName =
    'border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm';

export function UserFormFields({
    user,
    sites,
    errors,
}: {
    user?: User;
    sites: Site[];
    errors: Partial<Record<string, string>>;
}) {
    const [role, setRole] = useState(user?.role ?? 'site_admin');

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={user?.name}
                    required
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    defaultValue={user?.email}
                    required
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">
                    Password{user && ' (kosongkan jika tidak diubah)'}
                </Label>
                <Input
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    required={!user}
                />
                <InputError message={errors.password} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                    id="role"
                    name="role"
                    className={selectClassName}
                    value={role}
                    onChange={(event) =>
                        setRole(
                            event.target.value as 'super_admin' | 'site_admin',
                        )
                    }
                    required
                >
                    <option value="site_admin">Site Admin</option>
                    <option value="super_admin">Super Admin (HQ)</option>
                </select>
                <InputError message={errors.role} />
            </div>

            {role === 'site_admin' && (
                <div className="grid gap-2">
                    <Label htmlFor="site_id">Site</Label>
                    <select
                        id="site_id"
                        name="site_id"
                        defaultValue={user?.site_id ?? ''}
                        className={selectClassName}
                        required
                    >
                        <option value="" disabled>
                            Pilih site&hellip;
                        </option>
                        {sites.map((site) => (
                            <option key={site.id} value={site.id}>
                                {site.name}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.site_id} />
                </div>
            )}
        </div>
    );
}
