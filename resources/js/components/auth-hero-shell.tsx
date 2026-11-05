import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Auth frame per `screens/Login.html`: Merapi Barat hero + form pane with
 * the contour motif. Card 896 px wide on desktop, stacked on mobile.
 */
export function AuthHeroShell({
    title,
    description,
    backHref,
    backLabel = 'Kembali ke halaman masuk',
    children,
}: {
    title: string;
    description?: ReactNode;
    backHref?: NonNullable<InertiaLinkProps['href']>;
    backLabel?: string;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-svh bg-card lg:items-center lg:justify-center lg:bg-background lg:p-8">
            <div className="relative isolate flex w-full flex-col overflow-hidden bg-card lg:max-w-4xl lg:flex-row lg:rounded-[28px] lg:shadow-[0_24px_60px_oklch(0.191_0_0/0.10)]">
                <section className="relative isolate flex h-[300px] shrink-0 flex-col justify-between px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 sm:h-[360px] lg:h-auto lg:min-h-[600px] lg:w-1/2 lg:pt-6">
                    <img
                        src="/images/mountain.jpg"
                        alt="Merapi Barat"
                        className="absolute inset-0 -z-20 size-full object-cover object-[62%_55%]"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0_0_0/0.30)_0%,transparent_40%,var(--card)_100%)] lg:bg-[linear-gradient(180deg,oklch(0_0_0/0.30)_0%,transparent_45%)]"
                    />
                    <div className="flex items-center gap-2.5 self-start rounded-full bg-white/90 py-1.5 pr-3.5 pl-1.5">
                        <img
                            src="/images/logo.png"
                            alt="Logo PT.WBK"
                            className="size-[30px]"
                        />
                        <span className="text-xs font-extrabold tracking-[0.1em] text-[#141414]">
                            PAKDE
                        </span>
                    </div>
                    <span className="self-end text-xs font-semibold text-muted-foreground lg:text-white/85">
                        Merapi Barat
                    </span>
                </section>

                <section className="relative isolate flex min-w-0 flex-1 flex-col gap-4 overflow-hidden px-6 pt-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:justify-center lg:p-10">
                    <img
                        src="/images/topo.png"
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10 size-full object-cover object-[100%_100%] opacity-35 dark:opacity-15 dark:invert"
                    />

                    {backHref && (
                        <Link
                            href={backHref}
                            aria-label={backLabel}
                            className="flex size-11 items-center justify-center self-start rounded-full border border-border bg-card outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ArrowLeft
                                className="size-5"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                        </Link>
                    )}

                    <div>
                        <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.025em]">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1.5 text-sm leading-[1.45] text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}

                    <p className="mt-auto pt-2 text-center text-xs text-muted-foreground">
                        Belum punya akses? Hubungi tim IT site Anda.
                    </p>
                </section>
            </div>
        </div>
    );
}
