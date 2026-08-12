<?php

namespace App\Http\Requests\Employees;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'site_id' => [Rule::requiredIf(fn () => $this->user()->isSuperAdmin()), 'exists:sites,id'],

            'nrpp' => ['required', 'string', 'max:50', Rule::unique('employees', 'nrpp')->ignore($this->route('employee'))],
            'nama' => ['required', 'string', 'max:255'],
            'tempat_lahir' => ['nullable', 'string', 'max:255'],
            'tanggal_lahir' => ['nullable', 'date'],
            'alamat' => ['nullable', 'string'],

            'project' => ['nullable', 'string', 'max:255'],
            'lokasi' => ['nullable', 'string', 'max:255'],

            'beginning_classification' => ['nullable', 'string', 'max:255'],
            'beginning_versatility' => ['nullable', 'string', 'max:255'],
            'classification' => ['nullable', 'string', 'max:255'],
            'versatility' => ['nullable', 'string', 'max:255'],

            'doh' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ];
    }
}
