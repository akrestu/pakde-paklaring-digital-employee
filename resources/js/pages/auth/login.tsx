import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AuthHeroShell } from '@/components/auth-hero-shell';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [remember, setRemember] = useState(false);

    return (
        <AuthHeroShell
            title="Masuk ke PAKDE"
            description="Paklaring digital karyawan PT Wahana Bandhawa Kencana."
        >
            <Head title="Masuk" />

            {status && (
                <div
                    role="status"
                    className="rounded-md bg-success-soft px-4 py-3 text-sm font-medium text-success"
                >
                    {status}
                </div>
            )}

            <Form
                {...store()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="email"
                                className="text-[13px] font-semibold"
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="username"
                                placeholder="Alamat email Anda"
                                aria-invalid={errors.email ? true : undefined}
                                className="text-[15px]"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="password"
                                className="text-[13px] font-semibold"
                            >
                                Password
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Masukkan password"
                                aria-invalid={
                                    errors.password ? true : undefined
                                }
                                className="text-[15px]"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center justify-between gap-2 text-[13px]">
                            <label
                                htmlFor="remember"
                                className="flex min-h-11 cursor-pointer items-center gap-2 font-medium"
                            >
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={remember}
                                    onCheckedChange={(val) =>
                                        setRemember(val === true)
                                    }
                                    tabIndex={3}
                                />
                                Ingat saya
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={request()}
                                    className="flex min-h-11 items-center font-semibold hover:underline"
                                    tabIndex={5}
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            tabIndex={4}
                            loading={processing}
                            data-test="login-button"
                        >
                            Masuk
                        </Button>
                    </>
                )}
            </Form>
        </AuthHeroShell>
    );
}
