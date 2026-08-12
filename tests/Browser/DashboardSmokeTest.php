<?php

use App\Models\Employee;
use App\Models\Paklaring;
use App\Models\Site;
use App\Models\User;

test('dashboard renders welcome heading, stat cards, and charts', function () {
    $siteA = Site::factory()->create(['name' => 'Head Office Jakarta']);
    $siteB = Site::factory()->create(['name' => 'Lahat Site']);

    Employee::factory()->count(5)->create(['site_id' => $siteA->id, 'is_active' => true]);
    Employee::factory()->count(2)->create(['site_id' => $siteA->id, 'is_active' => false]);
    Employee::factory()->count(3)->create(['site_id' => $siteB->id, 'is_active' => true]);

    Paklaring::factory()->count(4)->create(['site_id' => $siteA->id, 'created_at' => now()]);
    Paklaring::factory()->count(2)->create(['site_id' => $siteB->id, 'created_at' => now()->subMonth()]);

    $user = User::factory()->create([
        'role' => User::ROLE_SUPER_ADMIN,
    ]);

    $this->actingAs($user);

    $page = visit('/dashboard');

    $page->assertSee('Total Paklaring')
        ->assertSee('Karyawan Aktif')
        ->assertSee('Tren Paklaring')
        ->assertSee('Status Karyawan')
        ->assertSee('Paklaring per Site')
        ->assertSee('Head Office Jakarta')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'dashboard-smoke');
});

test('site admin dashboard is scoped to their own site and hides the per-site chart', function () {
    $site = Site::factory()->create(['name' => 'Lahat Site']);
    $otherSite = Site::factory()->create(['name' => 'Head Office Jakarta']);

    Employee::factory()->count(2)->create(['site_id' => $site->id, 'is_active' => true]);
    Paklaring::factory()->count(3)->create(['site_id' => $site->id]);
    Paklaring::factory()->count(5)->create(['site_id' => $otherSite->id]);

    $user = User::factory()->create([
        'role' => User::ROLE_SITE_ADMIN,
        'site_id' => $site->id,
    ]);

    $this->actingAs($user);

    $page = visit('/dashboard');

    $page->assertSee('Total Paklaring')
        ->assertSee('Lahat Site')
        ->assertDontSee('Paklaring per Site')
        ->assertDontSee('Head Office Jakarta')
        ->assertNoJavascriptErrors();
});
