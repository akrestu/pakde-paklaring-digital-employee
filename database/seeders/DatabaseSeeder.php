<?php

namespace Database\Seeders;

use App\Models\Site;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
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

        User::factory()->create([
            'name' => 'HQ Admin',
            'email' => 'admin@wbk.test',
            'role' => User::ROLE_SUPER_ADMIN,
            'site_id' => null,
        ]);

        User::factory()->create([
            'name' => 'HRGA Lahat',
            'email' => 'hrga.lahat@wbk.test',
            'role' => User::ROLE_SITE_ADMIN,
            'site_id' => $site->id,
        ]);
    }
}
