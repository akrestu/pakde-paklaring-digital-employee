<?php

use App\Models\Site;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('database seeder creates the expected site and admin accounts', function () {
    $this->seed(DatabaseSeeder::class);

    $site = Site::where('code', 'BAU')->first();
    expect($site)->not->toBeNull();

    $superAdmin = User::where('email', 'admin@wbk.test')->first();
    expect($superAdmin)->not->toBeNull()
        ->and($superAdmin->role)->toBe(User::ROLE_SUPER_ADMIN)
        ->and($superAdmin->site_id)->toBeNull()
        ->and($superAdmin->email_verified_at)->not->toBeNull();

    $siteAdmin = User::where('email', 'hrga.lahat@wbk.test')->first();
    expect($siteAdmin)->not->toBeNull()
        ->and($siteAdmin->role)->toBe(User::ROLE_SITE_ADMIN)
        ->and($siteAdmin->site_id)->toBe($site->id);
});

test('database seeder is safe to run again after a partial run', function () {
    // Simulates the seeder crashing after creating the site but before the
    // users (e.g. a prior deploy failure) — re-running it must not error
    // on the site's unique code and must still fill in the missing users.
    Site::create([
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

    $this->seed(DatabaseSeeder::class);

    expect(Site::where('code', 'BAU')->count())->toBe(1)
        ->and(User::where('email', 'admin@wbk.test')->count())->toBe(1)
        ->and(User::where('email', 'hrga.lahat@wbk.test')->count())->toBe(1);

    // And running it a second time on top of a complete state must also
    // stay a no-op rather than erroring or duplicating anything.
    $this->seed(DatabaseSeeder::class);

    expect(Site::where('code', 'BAU')->count())->toBe(1)
        ->and(User::where('email', 'admin@wbk.test')->count())->toBe(1)
        ->and(User::where('email', 'hrga.lahat@wbk.test')->count())->toBe(1);
});
