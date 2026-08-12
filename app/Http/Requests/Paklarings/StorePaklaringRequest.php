<?php

namespace App\Http\Requests\Paklarings;

use App\Models\Paklaring;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaklaringRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Site admins are always pinned to their own site (see controller);
            // only the super admin needs to actually choose one here.
            'site_id' => [Rule::requiredIf(fn () => $this->user()->isSuperAdmin()), 'exists:sites,id'],

            'nrpp' => ['required', 'string', 'max:50'],
            'nama' => ['required', 'string', 'max:255'],
            'tempat_lahir' => ['required', 'string', 'max:255'],
            'tanggal_lahir' => ['required', 'date'],
            'alamat' => ['required', 'string'],

            'project' => ['required', 'string', 'max:255'],
            'lokasi' => ['required', 'string', 'max:255'],

            'beginning_classification' => ['required', 'string', 'max:255'],
            'final_classification' => ['required', 'string', 'max:255'],
            'beginning_versatility' => ['required', 'string', 'max:255'],
            'final_versatility' => ['required', 'string', 'max:255'],

            'alasan_phk' => ['required', Rule::in(Paklaring::ALASAN_PHK_OPTIONS)],
            'doh' => ['required', 'date'],
            'doe' => ['required', 'date', 'after_or_equal:doh'],
            'remarks' => ['nullable', 'string'],

            'signing_lokasi' => ['required', 'string', 'max:255'],
            'signing_tanggal' => ['required', 'date'],
        ];
    }
}
