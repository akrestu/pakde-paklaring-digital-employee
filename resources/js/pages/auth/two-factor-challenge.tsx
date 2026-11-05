import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    setLayoutProps(
        showRecoveryInput
            ? {
                  title: 'Kode pemulihan',
                  description:
                      'Masukkan salah satu kode pemulihan darurat akun Anda.',
              }
            : {
                  title: 'Verifikasi dua langkah',
                  description:
                      'Masukkan 6 digit kode dari aplikasi authenticator Anda.',
              },
    );

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Verifikasi dua langkah" />

            <Form
                {...store.form()}
                className="flex flex-col gap-4"
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <div className="flex flex-col gap-1.5">
                                <Input
                                    name="recovery_code"
                                    type="text"
                                    aria-label="Kode pemulihan"
                                    placeholder="Masukkan kode pemulihan"
                                    autoFocus
                                    required
                                    aria-invalid={
                                        errors.recovery_code ? true : undefined
                                    }
                                    className="text-[15px]"
                                />
                                <InputError message={errors.recovery_code} />
                            </div>
                        ) : (
                            <fieldset className="flex flex-col gap-1.5">
                                <legend className="sr-only">
                                    Kode verifikasi 6 digit
                                </legend>
                                <InputOTP
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    value={code}
                                    onChange={(value) => setCode(value)}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                    containerClassName="w-full"
                                >
                                    <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
                                        {Array.from(
                                            { length: OTP_MAX_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="tabular h-[58px] w-full rounded-md! border-2! border-transparent! bg-input text-[22px] font-bold shadow-none data-[active=true]:border-foreground! data-[active=true]:bg-card data-[active=true]:ring-0 dark:data-[active=true]:border-accent!"
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                                <InputError message={errors.code} />
                            </fieldset>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            loading={processing}
                        >
                            Verifikasi
                        </Button>

                        <button
                            type="button"
                            className="flex min-h-11 items-center justify-center rounded-full text-[13px] font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => toggleRecoveryMode(clearErrors)}
                        >
                            {showRecoveryInput
                                ? 'Gunakan kode authenticator'
                                : 'Gunakan kode pemulihan'}
                        </button>
                    </>
                )}
            </Form>
        </>
    );
}
