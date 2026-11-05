import { AuthHeroShell } from '@/components/auth-hero-shell';
import { login } from '@/routes';
import type { AuthLayoutProps } from '@/types';

/** Every non-login auth page shares the Login frame (hero + contour pane). */
export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <AuthHeroShell
            title={title ?? ''}
            description={description}
            backHref={login()}
        >
            <div className="flex flex-col gap-4">{children}</div>
        </AuthHeroShell>
    );
}
