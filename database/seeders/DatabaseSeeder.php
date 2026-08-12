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
     */
    public function run(): void
    {
        $site = Site::create([
            'code' => 'BAU',
            'name' => 'Lahat Site',
            'company_name' => 'PT. Bara Alam Utama',
            'address' => 'Merapi Kab. Lahat Sumatera Selatan',
            'default_project' => 'PT. BAU',
            'default_location' => 'Lahat',
            'signer_name' => 'Mario Palondongan',
            'signer_title' => 'Project Manager',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'HQ Admin',
            'email' => 'admin@wbk.test',
            'password' => Hash::make('password'),
            'role' => User::ROLE_SUPER_ADMIN,
            'site_id' => null,
        ])->forceFill(['email_verified_at' => now()])->save();

        User::create([
            'name' => 'HRGA Lahat',
            'email' => 'hrga.lahat@wbk.test',
            'password' => Hash::make('password'),
            'role' => User::ROLE_SITE_ADMIN,
            'site_id' => $site->id,
        ])->forceFill(['email_verified_at' => now()])->save();
    }
}
