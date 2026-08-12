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
