import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Site } from '@/types';

const textareaClassName =
    'border-input flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm';

export function SiteFormFields({
    site,
    errors,
}: {
    site?: Site;
    errors: Partial<Record<string, string>>;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
                <Label htmlFor="code">Kode Site</Label>
                <Input
                    id="code"
                    name="code"
                    defaultValue={site?.code}
                    placeholder="BAU"
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Dipakai di No Surat, mis. WBK-BAU-HRGA-2025-VIII-0001.
                </p>
                <InputError message={errors.code} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="name">Nama Site</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={site?.name}
                    placeholder="Lahat Site"
                    required
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="company_name">Nama Perusahaan (Footer)</Label>
                <Input
                    id="company_name"
                    name="company_name"
                    defaultValue={site?.company_name}
                    placeholder="PT. Bara Alam Utama"
                    required
                />
                <InputError message={errors.company_name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Alamat (Footer)</Label>
                <textarea
                    id="address"
                    name="address"
                    defaultValue={site?.address}
                    className={textareaClassName}
                    required
                />
                <InputError message={errors.address} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="default_project">Default Project</Label>
                <Input
                    id="default_project"
                    name="default_project"
                    defaultValue={site?.default_project ?? ''}
                    placeholder="PT. BAU"
                />
                <InputError message={errors.default_project} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="default_location">Default Lokasi</Label>
                <Input
                    id="default_location"
                    name="default_location"
                    defaultValue={site?.default_location ?? ''}
                    placeholder="Lahat"
                />
                <InputError message={errors.default_location} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="signer_name">Nama Penandatangan</Label>
                <Input
                    id="signer_name"
                    name="signer_name"
                    defaultValue={site?.signer_name ?? ''}
                    placeholder="Mario Palondongan"
                />
                <InputError message={errors.signer_name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="signer_title">Jabatan Penandatangan</Label>
                <Input
                    id="signer_title"
                    name="signer_title"
                    defaultValue={site?.signer_title ?? ''}
                    placeholder="Project Manager"
                />
                <InputError message={errors.signer_title} />
            </div>

            <div className="col-span-full flex items-center gap-2">
                <Checkbox
                    id="is_active"
                    name="is_active"
                    value="1"
                    defaultChecked={site?.is_active ?? true}
                />
                <Label htmlFor="is_active">
                    Site aktif (bisa dipilih saat membuat paklaring baru)
                </Label>
                <InputError message={errors.is_active} />
            </div>
        </div>
    );
}
