export type Site = {
    id: number;
    code: string;
    name: string;
    company_name: string;
    address: string;
    default_project: string | null;
    default_location: string | null;
    signer_name: string | null;
    signer_title: string | null;
    is_active: boolean;
    paklarings_count?: number;
};

export type Paklaring = {
    id: number;
    site_id: number;
    site?: Site;
    nrpp: string;
    no_surat: string;
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    alamat: string;
    project: string;
    lokasi: string;
    beginning_classification: string;
    final_classification: string;
    beginning_versatility: string;
    final_versatility: string;
    alasan_phk: string;
    doh: string;
    doe: string;
    remarks: string | null;
    signing_lokasi: string;
    signing_tanggal: string;
    verification_token: string;
    file_path: string | null;
    created_at: string;
    updated_at: string;
};

export type Employee = {
    id: number;
    site_id: number;
    site?: Site;
    nrpp: string;
    nama: string;
    tempat_lahir: string | null;
    tanggal_lahir: string | null;
    alamat: string | null;
    project: string | null;
    lokasi: string | null;
    beginning_classification: string | null;
    beginning_versatility: string | null;
    classification: string | null;
    versatility: string | null;
    doh: string | null;
    is_active: boolean;
    is_complete_for_paklaring: boolean;
    created_at: string;
    updated_at: string;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};
