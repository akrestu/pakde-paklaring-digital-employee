<?php

use App\Models\User;
use Database\Seeders\AdminUserSeeder;

test('admin user seeder creates only a super admin account', function () {
    $this->seed(AdminUserSeeder::class);

    $admin = User::where('email', 'admin@wbk.test')->first();

    expect($admin)->not->toBeNull()
        ->and($admin->role)->toBe(User::ROLE_SUPER_ADMIN)
        ->and($admin->site_id)->toBeNull()
        ->and($admin->email_verified_at)->not->toBeNull()
        ->and(User::count())->toBe(1);
});

test('admin user seeder is safe to run again', function () {
    $this->seed(AdminUserSeeder::class);
    $this->seed(AdminUserSeeder::class);

    expect(User::where('email', 'admin@wbk.test')->count())->toBe(1);
});
