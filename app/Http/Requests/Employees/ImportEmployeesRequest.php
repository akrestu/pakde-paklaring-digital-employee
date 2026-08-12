<?php

namespace App\Http\Requests\Employees;

use Illuminate\Foundation\Http\FormRequest;

class ImportEmployeesRequest extends FormRequest
{
    /**
     * "site_id" is only a fallback default (used for rows whose "site"
     * column is blank) — the file itself can name a site per row, synced
     * against real Site codes in EmployeeImportService — so it is optional
     * even for the super admin.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'site_id' => ['nullable', 'exists:sites,id'],
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ];
    }
}
