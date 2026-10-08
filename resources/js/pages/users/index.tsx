import { Form, Head, Link, usePage } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/UserController';
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
import { create, edit, index } from '@/routes/users';
import type { Auth, User } from '@/types';

export default function Index({ users }: { users: User[] }) {
    const {
        props: { auth },
    } = usePage<{ auth: Auth }>();

    return (
        <>
            <Head title="Users" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        title="Users"
                        description="Kelola akun HRGA per site dan Super Admin HQ."
                    />
                    <Button asChild>
                        <Link href={create()}>Tambah User</Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2 font-medium">Nama</th>
                                <th className="px-4 py-2 font-medium">Email</th>
                                <th className="px-4 py-2 font-medium">Role</th>
                                <th className="px-4 py-2 font-medium">Site</th>
                                <th className="px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-2 font-medium">
                                        {user.name}
                                    </td>
                                    <td className="px-4 py-2">{user.email}</td>
                                    <td className="px-4 py-2">
                                        {user.role === 'super_admin'
                                            ? 'Super Admin (HQ)'
                                            : 'Site Admin'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {user.site?.name ?? '-'}
                                    </td>
                                    <td className="px-4 py-2 text-right whitespace-nowrap">
                                        <Link
                                            href={edit(user)}
                                            className="text-primary underline"
                                        >
                                            Edit
                                        </Link>

                                        {auth.user.id !== user.id && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button className="ml-3 text-destructive underline">
                                                        Hapus
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogTitle>
                                                        Hapus user {user.name}?
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Tindakan ini tidak bisa
                                                        dibatalkan.
                                                    </DialogDescription>
                                                    <Form
                                                        {...UserController.destroy.form(
                                                            user,
                                                        )}
                                                    >
                                                        {({ processing }) => (
                                                            <DialogFooter className="gap-2">
                                                                <DialogClose
                                                                    asChild
                                                                >
                                                                    <Button variant="secondary">
                                                                        Batal
                                                                    </Button>
                                                                </DialogClose>
                                                                <Button
                                                                    variant="destructive"
                                                                    type="submit"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    Hapus
                                                                </Button>
                                                            </DialogFooter>
                                                        )}
                                                    </Form>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Users', href: index() }],
};
