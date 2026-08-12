<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Creates just a single super_admin account so there is a way to log
     * into the system — no demo Site or site_admin account, unlike
     * DatabaseSeeder. Safe to run more than once (firstOrCreate keyed on
     * email). Credentials are read from the environment so a real
     * production admin login doesn't need to be hardcoded in source, with
     * the same demo defaults as DatabaseSeeder when left unset.
     */
    public function run(): void
    {
        $email = (string) config('admin.email');
        $password = (string) config('admin.password');
        $name = (string) config('admin.name');

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => User::ROLE_SUPER_ADMIN,
                'site_id' => null,
            ],
        );

        if ($user->wasRecentlyCreated) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }
    }
}
