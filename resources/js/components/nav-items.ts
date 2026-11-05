import type { InertiaLinkProps } from '@inertiajs/react';
import {
    FileText,
    Home,
    Layers,
    MapPin,
    SlidersHorizontal,
    Upload,
    User,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dashboard } from '@/routes';
import { index as employeesIndex } from '@/routes/employees';
import { form as employeesImport } from '@/routes/employees/import';
import { createBatch, index as paklaringsIndex } from '@/routes/paklarings';
import { edit as profileEdit } from '@/routes/profile';
import { index as sitesIndex } from '@/routes/sites';
import { index as usersIndex } from '@/routes/users';

export type ShellNavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon: LucideIcon;
};

export type ShellNavGroup = {
    label?: string;
    items: ShellNavItem[];
};

/** Sidebar menu per `screens/Sidebar.html`. Manajemen only for super_admin. */
export function sidebarGroups(isSuperAdmin: boolean): ShellNavGroup[] {
    return [
        { items: [{ title: 'Dashboard', href: dashboard(), icon: Home }] },
        {
            label: 'Paklaring',
            items: [
                {
                    title: 'Daftar Paklaring',
                    href: paklaringsIndex(),
                    icon: FileText,
                },
                { title: 'Buat Batch', href: createBatch(), icon: Layers },
            ],
        },
        {
            label: 'Karyawan',
            items: [
                {
                    title: 'Daftar Karyawan',
                    href: employeesIndex(),
                    icon: Users,
                },
                {
                    title: 'Import Karyawan',
                    href: employeesImport(),
                    icon: Upload,
                },
            ],
        },
        ...(isSuperAdmin
            ? [
                  {
                      label: 'Manajemen',
                      items: [
                          { title: 'Site', href: sitesIndex(), icon: MapPin },
                          {
                              title: 'Pengguna',
                              href: usersIndex(),
                              icon: User,
                          },
                      ],
                  },
              ]
            : []),
        {
            label: 'Akun',
            items: [
                {
                    title: 'Pengaturan',
                    href: profileEdit(),
                    icon: SlidersHorizontal,
                },
            ],
        },
    ];
}

export const ROLE_LABEL: Record<string, string> = {
    super_admin: 'Super Admin',
    site_admin: 'Site Admin',
};
