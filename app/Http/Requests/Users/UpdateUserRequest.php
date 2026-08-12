<?php

namespace App\Http\Requests\Users;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('user'))],
            'password' => ['nullable', Password::defaults()],
            'role' => ['required', Rule::in([User::ROLE_SUPER_ADMIN, User::ROLE_SITE_ADMIN])],
            'site_id' => [Rule::requiredIf(fn () => $this->input('role') === User::ROLE_SITE_ADMIN), 'nullable', 'exists:sites,id'],
        ];
    }
}
