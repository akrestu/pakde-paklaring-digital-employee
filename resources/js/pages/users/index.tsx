import { Form, Head, usePage } from '@inertiajs/react';
import { Pencil, Plus, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import { FormSheet } from '@/components/form-sheet';
import { ROLE_LABEL } from '@/components/nav-items';
import { Button } from '@/components/ui/button';
import { UserFormFields } from '@/components/user-form-fields';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { Auth, Site, User } from '@/types';

type UserRow = User & { site?: Pick<Site, 'id' | 'name'> | null };

const card = 'rounded-lg bg-card shadow-[0_1px_2px_oklch(0.191_0_0/0.06)]';
const GRID =
    'grid grid-cols-[minmax(180px,1.2fr)_minmax(200px,1.3fr)_130px_minmax(120px,1fr)_44px] items-center gap-3 px-4';

function RolePill({ role }: { role: string }) {
    return (
        <span
            className={cn(
                'inline-block rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                role === 'super_admin'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground',
            )}
        >
            {ROLE_LABEL[role] ?? role}
        </span>
    );
}

export default function Index({
    users,
    sites,
}: {
    users: UserRow[];
    sites: Pick<Site, 'id' | 'name'>[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const getInitials = useInitials();
    const [editing, setEditing] = useState<UserRow | 'new' | null>(null);
    const user = editing && editing !== 'new' ? editing : undefined;

    return (
        <>
            <Head title="Pengguna" />

            <div className="flex flex-col gap-2.5 md:gap-[18px]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="hidden flex-col gap-1 md:flex">
                        <h1 className="text-[30px] leading-[1.15] font-extrabold tracking-[-0.025em]">
                            Pengguna
                        </h1>
                        <div className="text-sm text-muted-foreground">
                            Akun yang dapat mengelola data paklaring.
                        </div>
                    </div>
                    <Button
                        variant="accent"
                        className="font-bold"
                        onClick={() => setEditing('new')}
                    >
                        <Plus />
                        Tambah Pengguna
                    </Button>
                </div>

                {users.length === 0 ? (
                    <div
                        className={cn(
                            card,
                            'flex flex-col items-center gap-3 px-6 py-14 text-center',
                        )}
                    >
                        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <UserIcon
                                className="size-6 text-muted-foreground"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                        </span>
                        <div className="text-base font-bold">
                            Belum ada pengguna
                        </div>
                    </div>
                ) : (
                    <>
                        <ul className="flex flex-col gap-2.5 md:hidden">
                            {users.map((u) => (
                                <li key={u.id}>
                                    <button
                                        type="button"
                                        onClick={() => setEditing(u)}
                                        className={cn(
                                            card,
                                            'flex w-full items-center gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                        )}
                                    >
                                        <span className="flex size-10 flex-none items-center justify-center rounded-full bg-primary text-[13px] font-bold text-accent">
                                            {getInitials(u.name)}
                                        </span>
                                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <span className="truncate text-[15px] font-bold">
                                                {u.name}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {u.email}
                                            </span>
                                        </span>
                                        <RolePill role={u.role} />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <section
                            className={cn(card, 'hidden overflow-hidden md:block')}
                        >
                            <div className="overflow-x-auto">
                                <div
                                    role="table"
                                    aria-label="Daftar pengguna"
                                    className="min-w-[760px]"
                                >
                                    <div
                                        role="row"
                                        className={cn(
                                            GRID,
                                            'bg-muted py-2.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase',
                                        )}
                                    >
                                        <span role="columnheader">Nama</span>
                                        <span role="columnheader">Email</span>
                                        <span role="columnheader">Role</span>
                                        <span role="columnheader">Site</span>
                                        <span
                                            role="columnheader"
                                            className="sr-only"
                                        >
                                            Aksi
                                        </span>
                                    </div>
                                    {users.map((u) => (
                                        <div
                                            key={u.id}
                                            role="row"
                                            className={cn(
                                                GRID,
                                                'border-t border-border py-2 text-[13px]',
                                            )}
                                        >
                                            <span
                                                role="cell"
                                                className="flex min-w-0 items-center gap-2.5 text-sm font-semibold"
                                            >
                                                <span
                                                    aria-hidden
                                                    className="flex size-8 flex-none items-center justify-center rounded-full bg-primary text-[11px] font-bold text-accent"
                                                >
                                                    {getInitials(u.name)}
                                                </span>
                                                <span className="truncate">
                                                    {u.name}
                                                </span>
                                            </span>
                                            <span
                                                role="cell"
                                                className="truncate text-muted-foreground"
                                            >
                                                {u.email}
                                            </span>
                                            <span role="cell">
                                                <RolePill role={u.role} />
                                            </span>
                                            <span
                                                role="cell"
                                                className="truncate"
                                            >
                                                {u.site?.name ?? 'Semua site'}
                                            </span>
                                            <span role="cell">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditing(u)
                                                    }
                                                    aria-label={`Edit ${u.name}`}
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
                title={user ? `Edit ${user.name}` : 'Tambah Pengguna'}
            >
                {editing !== null && (
                    <Form
                        key={user?.id ?? 'new'}
                        {...(user
                            ? UserController.update.form(user)
                            : UserController.store.form())}
                        onSuccess={() => setEditing(null)}
                        className="flex flex-col gap-5 pt-2"
                    >
                        {({ processing, errors }) => (
                            <>
                                <UserFormFields
                                    user={user}
                                    sites={sites}
                                    errors={errors}
                                />
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
                {user && user.id !== auth.user.id && (
                    <Form
                        {...UserController.destroy.form(user)}
                        onSuccess={() => setEditing(null)}
                        onBefore={() =>
                            window.confirm(`Hapus pengguna ${user.name}?`)
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
                                Hapus pengguna
                            </Button>
                        )}
                    </Form>
                )}
            </FormSheet>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Pengguna', href: UserController.index() }],
};
