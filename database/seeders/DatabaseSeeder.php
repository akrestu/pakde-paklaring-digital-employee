<?php

namespace Database\Seeders;

use App\Models\Site;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Deliberately avoids User::factory() — factories call fake() (backed by
     * fakerphp/faker, a require-dev-only package) to build their defaults
     * even when every field ends up overridden, which breaks this seeder on
     * a production `composer install --no-dev`.
     *
     * Uses firstOrCreate (keyed on the site's unique code / each user's
     * unique email) so the seeder is safe to re-run — e.g. after a partial
     * failure that already created some of these rows.
     */
    public function run(): void
    {
        $site = Site::firstOrCreate(
            ['code' => 'BAU'],
            [
                'name' => 'Lahat Site',
                'company_name' => 'PT. Bara Alam Utama',
                'address' => 'Merapi Kab. Lahat Sumatera Selatan',
                'default_project' => 'PT. BAU',
                'default_location' => 'Lahat',
                'signer_name' => 'Mario Palondongan',
                'signer_title' => 'Project Manager',
                'is_active' => true,
            ],
        );

        $this->createUserIfMissing('HQ Admin', 'admin@wbk.test', User::ROLE_SUPER_ADMIN, null);
        $this->createUserIfMissing('HRGA Lahat', 'hrga.lahat@wbk.test', User::ROLE_SITE_ADMIN, $site->id);
    }

    private function createUserIfMissing(string $name, string $email, string $role, ?int $siteId): void
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'role' => $role,
                'site_id' => $siteId,
            ],
        );

        if ($user->wasRecentlyCreated) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }
    }
}
