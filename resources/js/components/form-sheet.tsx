import type { ReactNode } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

/**
 * Right-hand form sheet per `screens/Site.html` / `Pengguna.html`: 520 px,
 * rounded on the open edge, scrolls its own content.
 */
export function FormSheet({
    open,
    onOpenChange,
    title,
    description,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full gap-0 overflow-y-auto border-0 bg-card p-0 shadow-[-10px_0_30px_rgba(20,20,20,0.18)] sm:max-w-[520px] sm:rounded-l-[28px]"
            >
                <SheetHeader className="px-6 pt-6 pb-2">
                    <SheetTitle className="text-xl font-extrabold tracking-tight">
                        {title}
                    </SheetTitle>
                    <SheetDescription
                        className={description ? '' : 'sr-only'}
                    >
                        {description ?? title}
                    </SheetDescription>
                </SheetHeader>
                <div className="px-6 pb-6">{children}</div>
            </SheetContent>
        </Sheet>
    );
}
