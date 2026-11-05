<?php

use App\Models\Paklaring;
use App\Models\Site;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('the monthly trend covers twelve months ending with the current one', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'site_id' => null]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('monthlyTrend', 12)
            ->where('monthlyTrend.11.month', now()->startOfMonth()->toDateString())
            ->missing('employeeStatus')
            ->missing('paklaringBySite'));
});

test('paklarings are counted per termination reason, including unused reasons', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'site_id' => null]);
    $site = Site::factory()->create();

    Paklaring::factory()->count(2)->create(['site_id' => $site->id, 'alasan_phk' => 'Resign']);
    Paklaring::factory()->create(['site_id' => $site->id, 'alasan_phk' => 'PHK']);
    Paklaring::factory()->create([
        'site_id' => $site->id,
        'alasan_phk' => 'Pensiun',
        'created_at' => now()->subMonths(13),
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('byReason', count(Paklaring::ALASAN_PHK_OPTIONS))
            ->where('byReason.0', ['reason' => 'Resign', 'total' => 2])
            ->where('byReason.1', ['reason' => 'PHK', 'total' => 1])
            ->where('byReason', fn ($rows) => collect($rows)->firstWhere('reason', 'Pensiun')['total'] === 0));
});

test('super admin can filter the dashboard by site', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'site_id' => null]);
    $siteA = Site::factory()->create();
    $siteB = Site::factory()->create();

    Paklaring::factory()->count(3)->create(['site_id' => $siteA->id]);
    Paklaring::factory()->create(['site_id' => $siteB->id]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('stats.totalPaklaring', 4)
            ->has('sites', 2)
            ->where('filters.site_id', null));

    $this->actingAs($admin)
        ->get(route('dashboard', ['site_id' => $siteB->id]))
        ->assertInertia(fn ($page) => $page
            ->where('stats.totalPaklaring', 1)
            ->where('filters.site_id', $siteB->id)
            ->has('recentPaklarings', 1));
});

test('an unknown site filter falls back to all sites', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'site_id' => null]);
    Paklaring::factory()->count(2)->create();

    $this->actingAs($admin)
        ->get(route('dashboard', ['site_id' => 999999]))
        ->assertInertia(fn ($page) => $page
            ->where('stats.totalPaklaring', 2)
            ->where('filters.site_id', null));
});

test('site admin cannot use the site filter to see another site', function () {
    $siteA = Site::factory()->create();
    $siteB = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $siteA->id]);

    Paklaring::factory()->create(['site_id' => $siteA->id]);
    Paklaring::factory()->count(2)->create(['site_id' => $siteB->id]);

    $this->actingAs($user)
        ->get(route('dashboard', ['site_id' => $siteB->id]))
        ->assertInertia(fn ($page) => $page
            ->where('stats.totalPaklaring', 1)
            ->where('sites', [])
            ->where('filters.site_id', null));
});
