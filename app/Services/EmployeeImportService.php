<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use Throwable;

class EmployeeImportService
{
    /**
     * Columns the import file may contain, mapped from a normalized header
     * (lowercase, spaces/dashes collapsed to underscores) to the Employee
     * attribute it fills. "site_code" is handled separately — it is not a
     * real Employee column, it is used to look up and sync the row's Site.
     *
     * @var array<string, string>
     */
    private const COLUMN_MAP = [
        'nrpp' => 'nrpp',
        'nama' => 'nama',
        'name' => 'nama',
        'site' => 'site_code',
        'site_code' => 'site_code',
        'kode_site' => 'site_code',
        'tempat_lahir' => 'tempat_lahir',
        'tanggal_lahir' => 'tanggal_lahir',
        'alamat' => 'alamat',
        'address' => 'alamat',
        'project' => 'project',
        'lokasi' => 'lokasi',
        'location' => 'lokasi',
        'beginning_classification' => 'beginning_classification',
        'beginning_versatility' => 'beginning_versatility',
        'classification' => 'classification',
        'final_classification' => 'classification',
        'versatility' => 'versatility',
        'final_versatility' => 'versatility',
        'doh' => 'doh',
        'date_of_hire' => 'doh',
        'is_active' => 'is_active',
        'aktif' => 'is_active',
    ];

    private const DATE_ATTRIBUTES = ['tanggal_lahir', 'doh'];

    /**
     * Import employees, syncing each row to a real Site record.
     *
     * If the file has a "site" column, its value is matched against the
     * app's Site codes so every row lands on the site it actually names
     * (site admins may only target their own site). Rows without a site
     * column fall back to $defaultSite — required for site admins (their
     * own site), optional for the super admin.
     */
    public function import(UploadedFile $file, User $user, ?Site $defaultSite): EmployeeImportResult
    {
        $created = 0;
        $updated = 0;
        $skipped = [];

        foreach ($this->plan($file, $user, $defaultSite) as $row) {
            if ($row->isSkipped()) {
                $skipped[] = $row->skipLabel();

                continue;
            }

            try {
                $employee = Employee::updateOrCreate(
                    ['nrpp' => $row->attributes['nrpp']],
                    [...$row->attributes, 'site_id' => $row->site?->id],
                );

                $employee->wasRecentlyCreated ? $created++ : $updated++;
            } catch (Throwable $e) {
                $skipped[] = "Baris {$row->rowNumber}: gagal disimpan ({$e->getMessage()}).";
            }
        }

        return new EmployeeImportResult($created, $updated, $skipped);
    }

    /**
     * Read and check every data row without saving anything. The preview
     * screen shows this plan; import() saves exactly the rows it accepts.
     *
     * @return list<EmployeeImportRow>
     */
    public function plan(UploadedFile $file, User $user, ?Site $defaultSite): array
    {
        $reader = IOFactory::createReaderForFile($file->getRealPath());
        $reader->setReadDataOnly(true);
        $spreadsheet = $reader->load($file->getRealPath());
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, false);

        if ($rows === []) {
            return [new EmployeeImportRow(0, EmployeeImportRow::STATUS_SKIP, [], null, 'File kosong atau tidak terbaca.')];
        }

        $columns = $this->mapHeaderRow(array_shift($rows));
        $parsed = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            if (collect($row)->filter(fn ($value) => trim((string) $value) !== '')->isEmpty()) {
                continue;
            }

            $attributes = $this->mapRow($row, $columns);

            if ($this->isExampleOrInstructionRow($attributes, $row)) {
                continue;
            }

            $parsed[] = [$rowNumber, $attributes];
        }

        // Which NRPPs already exist, so each row can be labelled new/update
        // exactly the way updateOrCreate() will treat it.
        $existing = Employee::query()
            ->whereIn('nrpp', array_filter(array_map(fn ($p) => $p[1]['nrpp'] ?? null, $parsed)))
            ->pluck('nrpp')
            ->map(fn ($nrpp) => (string) $nrpp)
            ->flip();

        $plan = [];
        $seen = [];

        foreach ($parsed as [$rowNumber, $attributes]) {
            if (blank($attributes['nrpp'] ?? null) || blank($attributes['nama'] ?? null)) {
                $plan[] = new EmployeeImportRow($rowNumber, EmployeeImportRow::STATUS_SKIP, $attributes, null, 'kolom nrpp dan nama wajib diisi.');

                continue;
            }

            $siteCode = $attributes['site_code'] ?? null;
            unset($attributes['site_code']);

            [$site, $error] = $this->resolveSite($siteCode, $user, $defaultSite);

            if ($site === null) {
                $plan[] = new EmployeeImportRow($rowNumber, EmployeeImportRow::STATUS_SKIP, $attributes, null, $error);

                continue;
            }

            $nrpp = (string) $attributes['nrpp'];
            $status = isset($existing[$nrpp]) || isset($seen[$nrpp])
                ? EmployeeImportRow::STATUS_UPDATE
                : EmployeeImportRow::STATUS_NEW;
            $seen[$nrpp] = true;

            $plan[] = new EmployeeImportRow($rowNumber, $status, $attributes, $site);
        }

        return $plan;
    }

    /**
     * @return array{0: ?Site, 1: ?string} The site, or null with the reason.
     */
    private function resolveSite(?string $siteCode, User $user, ?Site $defaultSite): array
    {
        if (blank($siteCode)) {
            return $defaultSite === null
                ? [null, 'site wajib diisi (kolom "site" kosong dan tidak ada site default dipilih).']
                : [$defaultSite, null];
        }

        $site = Site::where('code', Str::upper(trim($siteCode)))->first();

        if ($site === null) {
            return [null, "kode site \"{$siteCode}\" tidak ditemukan di aplikasi."];
        }

        if (! $user->isSuperAdmin() && $site->id !== $user->site_id) {
            return [null, "site \"{$siteCode}\" bukan site Anda, dilewati."];
        }

        return [$site, null];
    }

    /**
     * The template ships with a sample row (NRPP prefixed "CONTOH") and an
     * instructional note row so users can see the expected format. Both are
     * harmless no-ops if left in the file when uploading — silently skipped
     * rather than imported or reported as an error.
     *
     * @param  array<string, mixed>  $attributes
     * @param  array<int, mixed>  $row
     */
    private function isExampleOrInstructionRow(array $attributes, array $row): bool
    {
        $nrpp = Str::upper((string) ($attributes['nrpp'] ?? ''));

        if (Str::startsWith($nrpp, Str::upper(EmployeeSpreadsheetService::EXAMPLE_NRPP))) {
            return true;
        }

        $firstCell = trim((string) ($row[0] ?? ''));

        return Str::startsWith($firstCell, '↑');
    }

    /**
     * @param  array<int, mixed>  $headerRow
     * @return array<int, string|null>
     */
    private function mapHeaderRow(array $headerRow): array
    {
        return array_map(function ($header) {
            $normalized = Str::of((string) $header)->trim()->lower()->snake()->value();

            return self::COLUMN_MAP[$normalized] ?? null;
        }, $headerRow);
    }

    /**
     * @param  array<int, mixed>  $row
     * @param  array<int, string|null>  $columns
     * @return array<string, mixed>
     */
    private function mapRow(array $row, array $columns): array
    {
        $attributes = [];

        foreach ($columns as $index => $attribute) {
            if ($attribute === null) {
                continue;
            }

            $value = $row[$index] ?? null;
            $value = is_string($value) ? trim($value) : $value;

            if ($value === '' || $value === null) {
                continue;
            }

            if (in_array($attribute, self::DATE_ATTRIBUTES, true)) {
                $attributes[$attribute] = $this->parseDate($value);

                continue;
            }

            if ($attribute === 'is_active') {
                $attributes[$attribute] = in_array(Str::lower((string) $value), ['1', 'true', 'yes', 'ya', 'aktif'], true);

                continue;
            }

            $attributes[$attribute] = $value;
        }

        return $attributes;
    }

    private function parseDate(mixed $value): ?string
    {
        if (is_numeric($value)) {
            return ExcelDate::excelToDateTimeObject((float) $value)->format('Y-m-d');
        }

        try {
            return Carbon::parse((string) $value)->format('Y-m-d');
        } catch (Throwable) {
            return null;
        }
    }
}
