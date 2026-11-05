<?php

use App\Models\Site;
use App\Models\User;

test('super admin creates a site from the right-hand sheet', function () {
    Site::factory()->create(['name' => 'Site BAU', 'code' => 'BAU']);

    $this->actingAs(User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]));

    visit('/sites')
        ->assertSee('Data perusahaan dan penandatangan untuk tiap site.')
        ->assertSee('Site BAU')
        ->click('Tambah Site')
        ->assertSee('Site aktif')
        ->type('#code', 'MAS')
        ->type('#name', 'Site MAS')
        ->type('#company_name', 'PT Wahana Bandhawa Kencana')
        ->type('#address', 'Lahat')
        ->screenshot(true, 'sites-sheet')
        ->click('Simpan')
        ->assertSee('Site MAS')
        ->assertNoJavascriptErrors();

    expect(Site::where('code', 'MAS')->first()?->is_active)->toBeTrue();
});

test('users list opens the sheet with role choice and keeps the password field', function () {
    $site = Site::factory()->create(['name' => 'Site BAU']);
    User::factory()->create(['name' => 'Dina Admin', 'role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    $this->actingAs(User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]));

    visit('/users')
        ->assertSee('Dina Admin')
        ->click('[aria-label="Edit Dina Admin"]')
        ->assertSee('Kosongkan jika tidak diubah.')
        ->assertSee('Hanya karyawan dan paklaring site-nya')
        ->assertPresent('#password')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'users-sheet');
});

test('settings pages keep profile, password, two-factor and account deletion', function () {
    $this->actingAs(User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]));

    visit('/settings/profile')
        ->assertSee('Pengaturan')
        ->assertSee('Profil')
        ->assertSee('Hapus akun')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'settings-profile');

    $this->withSession(['auth.password_confirmed_at' => time()]);

    visit('/settings/security')
        ->assertSee('Ganti password')
        ->assertSee('Verifikasi dua langkah')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'settings-security');
});
