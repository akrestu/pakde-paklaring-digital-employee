import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="bottom-center"
            // Above the floating mobile bottom nav (72 px + 12 px gap).
            mobileOffset={{ bottom: 100 }}
            // StateUmum.html: ink pill, white text, soft shadow.
            toastOptions={{
                classNames: {
                    toast: '!rounded-full !px-5 !py-3 !text-sm !font-semibold !shadow-[0_10px_30px_rgba(20,20,20,0.22)]',
                },
            }}
            style={
                {
                    '--normal-bg': 'var(--foreground)',
                    '--normal-text': 'var(--background)',
                    '--normal-border': 'transparent',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
