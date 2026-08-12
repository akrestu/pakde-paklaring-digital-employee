import { Briefcase, Building2, CircleCheck, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Employee, Site } from '@/types';

function toDateInputValue(value?: string | null): string {
    return value ? value.slice(0, 10) : '';
}

function StepNumber({ step }: { step: number }) {
    return (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {step}
        </span>
    );
}

function FieldLabel({
    htmlFor,
    required,
    children,
}: {
    htmlFor: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <Label htmlFor={htmlFor}>
            {children}
            {required ? (
                <span className="ml-0.5 text-destructive">*</span>
            ) : (
                <span className="ml-1 font-normal text-muted-foreground">
                    (opsional)
                </span>
            )}
        </Label>
    );
}

export function EmployeeFormFields({
    employee,
    sites,
    lockedSite,
    errors,
}: {
    employee?: Employee;
    sites: Site[];
    lockedSite?: Site | null;
    errors: Partial<Record<string, string>>;
}) {
    const [siteId, setSiteId] = useState(
        employee?.site_id ? String(employee.site_id) : '',
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <StepNumber step={1} />
                        <Building2 className="size-4 text-muted-foreground" />
                        Site
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {lockedSite ? (
                        <div className="grid gap-2">
                            <Label>Site</Label>
                            <Input value={lockedSite.name} disabled />
                            <p className="text-xs text-muted-foreground">
                                Karyawan otomatis tercatat di site kamu.
                            </p>
                            <input
                                type="hidden"
                                name="site_id"
                                value={lockedSite.id}
                            />
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="site_id" required>
                                Site
                            </FieldLabel>
                            <Select value={siteId} onValueChange={setSiteId}>
                                <SelectTrigger id="site_id" className="w-full">
                                    <SelectValue placeholder="Pilih site…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sites.map((site) => (
                                        <SelectItem
                                            key={site.id}
                                            value={String(site.id)}
                                        >
                                            {site.name} ({site.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <input
                                type="hidden"
                                name="site_id"
                                value={siteId}
                            />
                            <InputError message={errors.site_id} />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <StepNumber step={2} />
                        <UserRound className="size-4 text-muted-foreground" />
                        Data Diri
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <FieldLabel htmlFor="nrpp" required>
                            NRPP
                        </FieldLabel>
                        <Input
                            id="nrpp"
                            name="nrpp"
                            defaultValue={employee?.nrpp}
                            placeholder="Contoh: 202214889"
                            required
                        />
                        <InputError message={errors.nrpp} />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="nama" required>
                            Nama
                        </FieldLabel>
                        <Input
                            id="nama"
                            name="nama"
                            defaultValue={employee?.nama}
                            placeholder="Nama lengkap karyawan"
                            required
                        />
                        <InputError message={errors.nama} />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="tempat_lahir">
                            Tempat Lahir
                        </FieldLabel>
                        <Input
                            id="tempat_lahir"
                            name="tempat_lahir"
                            defaultValue={employee?.tempat_lahir ?? ''}
                            placeholder="Contoh: Palembang"
                        />
                        <InputError message={errors.tempat_lahir} />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="tanggal_lahir">
                            Tanggal Lahir
                        </FieldLabel>
                        <Input
                            id="tanggal_lahir"
                            type="date"
                            name="tanggal_lahir"
                            defaultValue={toDateInputValue(
                                employee?.tanggal_lahir,
                            )}
                        />
                        <InputError message={errors.tanggal_lahir} />
                    </div>

                    <div className="col-span-full grid gap-2">
                        <FieldLabel htmlFor="alamat">Alamat</FieldLabel>
                        <Textarea
                            id="alamat"
                            name="alamat"
                            defaultValue={employee?.alamat ?? ''}
                            placeholder="Alamat sesuai KTP"
                        />
                        <InputError message={errors.alamat} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <StepNumber step={3} />
                        <Briefcase className="size-4 text-muted-foreground" />
                        Project &amp; Klasifikasi Saat Ini
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <FieldLabel htmlFor="project">Project</FieldLabel>
                        <Input
                            id="project"
                            name="project"
                            defaultValue={
                                employee?.project ??
                                lockedSite?.default_project ??
                                ''
                            }
                        />
                        <InputError message={errors.project} />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="lokasi">Lokasi</FieldLabel>
                        <Input
                            id="lokasi"
                            name="lokasi"
                            defaultValue={
                                employee?.lokasi ??
                                lockedSite?.default_location ??
                                ''
                            }
                        />
                        <InputError message={errors.lokasi} />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="beginning_classification">
                            Beginning Classification
                        </FieldLabel>
                        <Input
                            id="beginning_classification"
                            name="beginning_classification"
                            defaultValue={
                                employee?.beginning_classification ?? ''
                            }
                            placeholder="Contoh: Skilled"
                        />
                        <InputError
                            message={errors.beginning_classification}
                        />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="beginning_versatility">
                            Beginning Versatility
                        </FieldLabel>
                        <Input
                            id="beginning_versatility"
                            name="beginning_versatility"
                            defaultValue={
                                employee?.beginning_versatility ?? ''
                            }
                            placeholder="Contoh: Multi Skilled"
                        />
                        <InputError message={errors.beginning_versatility} />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="classification">
                            Classification (Saat Ini)
                        </FieldLabel>
                        <Input
                            id="classification"
                            name="classification"
                            defaultValue={employee?.classification ?? ''}
                            placeholder="Contoh: Skilled"
                        />
                        <InputError message={errors.classification} />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="versatility">
                            Versatility (Saat Ini)
                        </FieldLabel>
                        <Input
                            id="versatility"
                            name="versatility"
                            defaultValue={employee?.versatility ?? ''}
                            placeholder="Contoh: Multi Skilled"
                        />
                        <InputError message={errors.versatility} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <StepNumber step={4} />
                        <CircleCheck className="size-4 text-muted-foreground" />
                        Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <FieldLabel htmlFor="doh">
                            DOH (Date of Hire)
                        </FieldLabel>
                        <Input
                            id="doh"
                            type="date"
                            name="doh"
                            defaultValue={toDateInputValue(employee?.doh)}
                        />
                        <InputError message={errors.doh} />
                    </div>

                    <div className="flex items-center gap-2 self-end pb-2">
                        <Checkbox
                            id="is_active"
                            name="is_active"
                            value="1"
                            defaultChecked={employee?.is_active ?? true}
                        />
                        <Label htmlFor="is_active">Masih aktif bekerja</Label>
                        <InputError message={errors.is_active} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
